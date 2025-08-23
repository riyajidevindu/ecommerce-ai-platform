import pika
import json
import os
import logging
import time
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

def publish_ai_response(channel, message_id: int, ai_response: str):
    """
    Publishes the AI response to the ai_response_events exchange using a provided channel.
    """
    try:
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
    except Exception as e:
        logger.error(f"An error occurred while publishing an AI response: {e}", exc_info=True)
        # Optionally re-raise or handle the exception as needed
        raise


def _handle_user_created(data: dict):
    user_data = data.get("user")
    if not user_data:
        logger.warning("No user data in user_created event")
        return

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

def _handle_product_created(data: dict):
    product_data = data.get("product")
    if not product_data:
        logger.warning("No product data in product_created event")
        return

    db: Session = SessionLocal()
    try:
        owner_id = product_data.get("owner_id")
        if owner_id and not user_crud.get_user(db, user_id=owner_id):
            user_crud.create_user(db, user=UserCreate(id=owner_id, name="Unknown"))
            logger.warning(f"User with ID {owner_id} not found, created a placeholder user.")

        if not product_crud.get_product(db, product_id=product_data["id"]):
            product = ProductCreate(
                id=product_data["id"],
                name=product_data["name"],
                sku=product_data["sku"],
                price=product_data["price"],
                description=product_data.get("description"),
                image=product_data.get("image"),
                available_qty=product_data.get("available_qty"),
                stock_qty=product_data.get("stock_qty"),
                owner_id=product_data["owner_id"]
            )
            product_crud.create_product(db, product=product)
            logger.info(f"Product {product_data['name']} created in ai-orchestrator-service.")
        else:
            logger.info(f"Product {product_data['name']} already exists in ai-orchestrator-service.")
    except Exception as e:
        logger.error(f"An error occurred while handling product created event: {e}", exc_info=True)
    finally:
        db.close()

def _handle_product_updated(data: dict):
    product_data = data.get("product")
    if not product_data:
        logger.warning("No product data in product_updated event")
        return

    db: Session = SessionLocal()
    try:
        product = ProductCreate(
            id=product_data["id"],
            name=product_data["name"],
            sku=product_data["sku"],
            price=product_data["price"],
            description=product_data.get("description"),
            image=product_data.get("image"),
            available_qty=product_data.get("available_qty"),
            stock_qty=product_data.get("stock_qty"),
            owner_id=product_data["owner_id"]
        )
        product_crud.update_product(db, product_id=product_data["id"], product=product)
        logger.info(f"Product {product_data['name']} updated in ai-orchestrator-service.")
    except Exception as e:
        logger.error(f"An error occurred while handling product updated event: {e}", exc_info=True)
    finally:
        db.close()

def _handle_product_deleted(data: dict):
    product_id = data.get("product_id")
    if not product_id:
        logger.warning("No product_id in product_deleted event")
        return

    db: Session = SessionLocal()
    try:
        product_crud.delete_product(db, product_id=product_id)
        logger.info(f"Product with ID {product_id} deleted from ai-orchestrator-service.")
    finally:
        db.close()

def _handle_new_message(channel, data: dict):
    message_data = data.get("message_data")
    if not message_data:
        logger.warning("No message_data in new_message event")
        return

    db: Session = SessionLocal()
    try:
        from .crud import customer as customer_crud
        from .schemas.customer import CustomerCreate
        from .schemas.message import MessageBase

        customer = customer_crud.get_customer(db, customer_id=message_data["customer_id"])
        if not customer:
            customer = customer_crud.create_customer(db, customer=CustomerCreate(
                user_id=message_data["user_id"]
            ), customer_id=message_data["customer_id"])

        message = message_crud.create_message(db, message=MessageBase(
            user_message=message_data["user_message"]
        ), customer_id=customer.id, message_id=message_data["id"])

        message_processor.process_message(channel, message, db)
    finally:
        db.close()

EVENT_HANDLERS = {
    "user_created": _handle_user_created,
    "product_created": _handle_product_created,
    "product_updated": _handle_product_updated,
    "product_deleted": _handle_product_deleted,
    "new_message": _handle_new_message,
}

def on_message_callback(ch, method, properties, body):
    try:
        logger.info(f"Received message: {body}")
        data = json.loads(body)
        event_type = data.get("event_type")
        
        handler = EVENT_HANDLERS.get(event_type)
        if handler:
            if event_type == "new_message":
                handler(ch, data)
            else:
                handler(data)
            ch.basic_ack(delivery_tag=method.delivery_tag)
            logger.info(f"Successfully processed event: {event_type}")
        else:
            logger.warning(f"No handler for event type: {event_type}")
            ch.basic_ack(delivery_tag=method.delivery_tag) # Acknowledge to avoid requeueing unknown events

    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON message: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag) # Cannot process, discard
    except Exception as e:
        logger.error(f"An error occurred in message callback: {e}", exc_info=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False) # Requeue=False to avoid poison messages

def start_consumer():
    while True:
        try:
            logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()
            logger.info("Successfully connected to RabbitMQ.")

            exchanges = {
                'user_fanout_events': 'ai_orchestrator_user_events',
                'product_events': 'ai_orchestrator_product_events',
                'new_message_events': 'ai_orchestrator_new_message_events'
            }

            for exchange_name, queue_name in exchanges.items():
                channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
                channel.queue_declare(queue=queue_name, durable=True)
                channel.queue_bind(exchange=exchange_name, queue=queue_name)
                channel.basic_consume(queue=queue_name, on_message_callback=on_message_callback)
                logger.info(f"Consumer set up for exchange '{exchange_name}' on queue '{queue_name}'")

            logger.info(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"An error occurred while consuming messages: {e}. Retrying in 5 seconds...", exc_info=True)
            time.sleep(5)
