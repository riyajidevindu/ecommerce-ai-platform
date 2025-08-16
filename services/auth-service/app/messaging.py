import pika
import json
import os
import logging

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

def publish_user_created(user_data: dict):
    """
    Publishes a message to the 'user_events' exchange when a user is created.
    """
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchange_name = 'user_fanout_events'
        routing_key = 'user.created'
        
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
        
        message = {
            "event_type": "user_created",
            "user": user_data
        }
        
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        
        logger.info(f" [x] Sent {routing_key}:{json.dumps(message)}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing message: {e}")
