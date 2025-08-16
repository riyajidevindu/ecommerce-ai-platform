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

def publish_product_created(product_data: dict):
    """
    Publishes a message to the 'product_events' exchange when a product is created.
    """
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchange_name = 'product_events'
        
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
        
        message = {
            "event_type": "product_created",
            "product": product_data
        }
        
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        
        logger.info(f" [x] Sent product.created:{json.dumps(message)}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing message: {e}")

def publish_product_updated(product_data: dict):
    """
    Publishes a message to the 'product_events' exchange when a product is updated.
    """
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchange_name = 'product_events'
        
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
        
        message = {
            "event_type": "product_updated",
            "product": product_data
        }
        
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        
        logger.info(f" [x] Sent product.updated:{json.dumps(message)}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing message: {e}")

def publish_product_deleted(product_id: int):
    """
    Publishes a message to the 'product_events' exchange when a product is deleted.
    """
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchange_name = 'product_events'
        
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
        
        message = {
            "event_type": "product_deleted",
            "product_id": product_id
        }
        
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        
        logger.info(f" [x] Sent product.deleted:{json.dumps(message)}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing message: {e}")

def start_consumer():
    """
    Starts the RabbitMQ consumer to listen for user events.
    """
    while True:
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

            def callback(ch, method, properties, body):
                logger.info(f" [x] Received {method.routing_key}:{body}")
                data = json.loads(body)
                
                if data.get("event_type") == "user_created":
                    user_data = data.get("user")
                    if user_data:
                        db: Session = SessionLocal()
                        try:
                            logger.info(f"Creating user in stock_db: {user_data}")
                            user_create = user_schema.UserCreate(**user_data)
                            user_crud.create_user(db, user=user_create)
                            logger.info(f"User {user_data['username']} created in stock_db.")
                        except Exception as e:
                            logger.error(f"Failed to create user in stock_db: {e}")
                        finally:
                            db.close()
                
                ch.basic_ack(delivery_tag=method.delivery_tag)

            channel.basic_consume(queue=queue_name, on_message_callback=callback)

            logger.info(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Consumer failed to connect to RabbitMQ: {e}. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"An error occurred in consumer: {e}. Retrying in 5 seconds...")
            time.sleep(5)
