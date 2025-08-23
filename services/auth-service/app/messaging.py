import pika
import json
import os
import logging

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

# Global channel to be initialized on startup
channel = None

def get_rabbitmq_channel():
    """
    Returns a RabbitMQ channel, creating a new connection if one doesn't exist.
    """
    global channel
    if channel is None or channel.is_closed:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
    return channel

def publish_user_created(user_data: dict):
    """
    Publishes a message to the 'user_fanout_events' exchange when a user is created.
    """
    try:
        ch = get_rabbitmq_channel()
        exchange_name = 'user_fanout_events'
        
        ch.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
        
        message = {
            "event_type": "user_created",
            "user": user_data
        }
        
        ch.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        
        logger.info(f" [x] Sent user_created event for user: {user_data.get('username')}")
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
        global channel
        channel = None  # Reset channel on connection error
    except Exception as e:
        logger.error(f"An error occurred while publishing message: {e}", exc_info=True)
