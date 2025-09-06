import pika
import json
import os
import logging
import time
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud import user as user_crud
from app.schemas import user as user_schema

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

def publish_event(exchange_name: str, event_type: str, data: dict):
    """
    Publishes an event to a specified exchange.
    """
    connection = None
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
        
        message = {
            "event_type": event_type,
            **data
        }
        
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=json.dumps(message, default=str),  # Use default=str to handle non-serializable data
            properties=pika.BasicProperties(delivery_mode=2)
        )
        logger.info(f" [x] Sent {event_type} event with data: {json.dumps(data, default=str)}")
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing event: {e}", exc_info=True)
    finally:
        if connection and connection.is_open:
            connection.close()
            logger.info("RabbitMQ connection closed.")

def publish_product_created(product_data: dict):
    publish_event('product_events', 'product_created', {"product": product_data})

def publish_product_updated(product_data: dict):
    publish_event('product_events', 'product_updated', {"product": product_data})

def publish_product_deleted(product_id: int):
    publish_event('product_events', 'product_deleted', {"product_id": product_id})

def _handle_user_created(data: dict):
    user_data = data.get("user")
    if not user_data:
        logger.warning("No user data in user_created event")
        return

    db: Session = SessionLocal()
    try:
        logger.info(f"[user_created] raw user payload: {user_data}")
        payload = {k: user_data.get(k) for k in ["id", "username", "email"] if k in user_data}
        try:
            user_create = user_schema.UserCreate(**payload)
        except Exception as e:
            logger.error(f"Validation error constructing UserCreate from {payload}: {e}")
            return
        user_crud.create_user(db, user=user_create)
        logger.info(f"User {payload.get('username')} created in stock_db (id={payload.get('id')}).")
    finally:
        db.close()

def _handle_user_updated(data: dict):
    user_data = data.get("user")
    if not user_data:
        logger.warning("No user data in user_updated event")
        return
    db: Session = SessionLocal()
    try:
        logger.info(f"[user_updated] raw user payload: {user_data}")
        existing = user_crud.update_user(
            db,
            user_id=user_data["id"],
            username=user_data.get("username"),
            email=user_data.get("email")
        )
        if existing:
            logger.info(f"User {user_data['id']} updated/backfilled in stock_db (username={existing.username}, email={getattr(existing,'email',None)}).")
    finally:
        db.close()

EVENT_HANDLERS = {
    "user_created": _handle_user_created,
    "user_updated": _handle_user_updated,
}

def on_message_callback(ch, method, properties, body):
    try:
        logger.info(f"Received message: {body}")
        data = json.loads(body)
        event_type = data.get("event_type")

        handler = EVENT_HANDLERS.get(event_type)
        if handler:
            handler(data)
            ch.basic_ack(delivery_tag=method.delivery_tag)
            logger.info(f"Successfully processed event: {event_type}")
        else:
            logger.warning(f"No handler for event type: {event_type}")
            ch.basic_ack(delivery_tag=method.delivery_tag)

    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON message: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"An error occurred in message callback: {e}", exc_info=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    """
    Starts the RabbitMQ consumer to listen for user events.
    """
    while True:
        connection = None
        try:
            logger.info(f"Consumer connecting to RabbitMQ at {RABBITMQ_URL}")
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()
            logger.info("Consumer successfully connected to RabbitMQ.")

            exchange_name = 'user_fanout_events'
            queue_name = 'stock_service_user_events'

            channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
            channel.queue_declare(queue=queue_name, durable=True)
            channel.queue_bind(queue=queue_name, exchange=exchange_name)
            channel.basic_consume(queue=queue_name, on_message_callback=on_message_callback)

            logger.info(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Consumer failed to connect to RabbitMQ: {e}. Retrying in 5 seconds...")
            if connection and connection.is_open:
                connection.close()
            time.sleep(5)
        except Exception as e:
            logger.error(f"An error occurred in consumer: {e}. Retrying in 5 seconds...")
            if connection and connection.is_open:
                connection.close()
            time.sleep(5)
