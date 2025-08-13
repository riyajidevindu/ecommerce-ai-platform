import pika
import json
import os
import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud import user as user_crud
from app.schemas.user import UserCreate
from app.schemas.product import ProductCreate
from app.crud import product as product_crud
from app.crud import message as message_crud
from . import message_processor

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

def publish_ai_response(message_id: int, ai_response: str):
    """
    Publishes the AI response to the ai_response_events exchange.
    """
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()

        exchange_name = 'ai_response_events'
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)

        message_body = json.dumps({
            "event_type": "ai_response_ready",
            "message_id": message_id,
            "ai_response": ai_response
        })

        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=message_body,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        logger.info(f" [x] Sent AI Response: {message_body}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing an AI response: {e}")


def on_message_callback(ch, method, properties, body):
    logger.info(f"Received message: {body}")
    data = json.loads(body)
    if data.get("event_type") == "user_created":
        user_data = data.get("user")
        if user_data:
            db: Session = SessionLocal()
            try:
                existing_user = user_crud.get_user(db, user_id=user_data["id"])
                if not existing_user:
                    user = UserCreate(id=user_data["id"], name=user_data["username"])
                    user_crud.create_user(db, user=user)
                    logger.info(f"User {user_data['username']} created in ai-orchestrator-service.")
                else:
                    logger.info(f"User {user_data['username']} already exists in ai-orchestrator-service.")
            finally:
                db.close()
    elif data.get("event_type") == "product_created":
        product_data = data.get("product")
        if product_data:
            db: Session = SessionLocal()
            try:
                # Ensure user exists before creating product
                user_id = product_data.get("user_id")
                if user_id:
                    existing_user = user_crud.get_user(db, user_id=user_id)
                    if not existing_user:
                        # This is a fallback, ideally the user should be created by the user_created event
                        user_crud.create_user(db, user=UserCreate(id=user_id, name="Unknown"))
                        logger.warning(f"User with ID {user_id} not found, created a placeholder user.")

                existing_product = product_crud.get_product(db, product_id=product_data["id"])
                if not existing_product:
                    product = ProductCreate(**product_data)
                    product_crud.create_product(db, product=product)
                    logger.info(f"Product {product_data['name']} created in ai-orchestrator-service.")
                else:
                    logger.info(f"Product {product_data['name']} already exists in ai-orchestrator-service.")
            finally:
                db.close()
    elif data.get("event_type") == "product_updated":
        product_data = data.get("product")
        if product_data:
            db: Session = SessionLocal()
            try:
                product = ProductCreate(**product_data)
                product_crud.update_product(db, product_id=product_data["id"], product=product)
                logger.info(f"Product {product_data['name']} updated in ai-orchestrator-service.")
            finally:
                db.close()
    elif data.get("event_type") == "product_deleted":
        product_id = data.get("product_id")
        if product_id:
            db: Session = SessionLocal()
            try:
                product_crud.delete_product(db, product_id=product_id)
                logger.info(f"Product with ID {product_id} deleted from ai-orchestrator-service.")
            finally:
                db.close()
    elif data.get("event_type") == "new_message":
        message_data = data.get("message_data")
        if message_data:
            db: Session = SessionLocal()
            try:
                from .crud import customer as customer_crud
                from .schemas.customer import CustomerCreate
                from .schemas.message import MessageBase

                # Get or create the customer to prevent race conditions
                customer = customer_crud.get_customer(db, customer_id=message_data["customer_id"])
                if not customer:
                    customer = customer_crud.create_customer(db, customer=CustomerCreate(
                        user_id=message_data["user_id"]
                    ), customer_id=message_data["customer_id"])

                # Create the message
                message = message_crud.create_message(db, message=MessageBase(
                    user_message=message_data["user_message"]
                ), customer_id=customer.id, message_id=message_data["id"])

                message_processor.process_message(message, db)
            finally:
                db.close()
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consumer():
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        # User events consumer
        user_exchange_name = 'user_fanout_events'
        channel.exchange_declare(exchange=user_exchange_name, exchange_type='fanout', durable=True)
        user_result = channel.queue_declare(queue='', exclusive=True)
        user_queue_name = user_result.method.queue
        channel.queue_bind(exchange=user_exchange_name, queue=user_queue_name)
        channel.basic_consume(queue=user_queue_name, on_message_callback=on_message_callback)

        # Product events consumer
        product_exchange_name = 'product_events'
        channel.exchange_declare(exchange=product_exchange_name, exchange_type='fanout', durable=True)
        product_result = channel.queue_declare(queue='', exclusive=True)
        product_queue_name = product_result.method.queue
        channel.queue_bind(exchange=product_exchange_name, queue=product_queue_name)
        channel.basic_consume(queue=product_queue_name, on_message_callback=on_message_callback)

        # New message events consumer
        new_message_exchange_name = 'new_message_events'
        channel.exchange_declare(exchange=new_message_exchange_name, exchange_type='fanout', durable=True)
        new_message_result = channel.queue_declare(queue='', exclusive=True)
        new_message_queue_name = new_message_result.method.queue
        channel.queue_bind(exchange=new_message_exchange_name, queue=new_message_queue_name)
        channel.basic_consume(queue=new_message_queue_name, on_message_callback=on_message_callback)

        logger.info(' [*] Waiting for messages. To exit press CTRL+C')
        channel.start_consuming()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while consuming messages: {e}")
