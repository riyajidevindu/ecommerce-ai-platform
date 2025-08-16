import pika
import json
import os
import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud import user as user_crud
from app.schemas.user import UserCreate

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

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
                    logger.info(f"User {user_data['username']} created in whatsapp-connector-service.")
                else:
                    logger.info(f"User {user_data['username']} already exists in whatsapp-connector-service.")
            finally:
                db.close()
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consumer():
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchange_name = 'user_fanout_events'
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)

        result = channel.queue_declare(queue='', exclusive=True)
        queue_name = result.method.queue

        channel.queue_bind(exchange=exchange_name, queue=queue_name)

        channel.basic_consume(queue=queue_name, on_message_callback=on_message_callback)

        logger.info(' [*] Waiting for messages. To exit press CTRL+C')
        channel.start_consuming()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while consuming messages: {e}")
