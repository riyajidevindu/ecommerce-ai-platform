import pika
import os
import logging
import json

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

def publish_message(message_data: dict):
    """
    Publishes a message to the new_message_events exchange using a persistent channel.
    """
    try:
        ch = get_rabbitmq_channel()
        exchange_name = 'new_message_events'
        ch.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)

        message_body = json.dumps({
            "event_type": "new_message",
            "message_data": message_data
        })

        ch.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=message_body,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        logger.info(f" [x] Sent {message_body}")
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
        global channel
        channel = None  # Reset channel on connection error
    except Exception as e:
        logger.error(f"An error occurred while publishing a message: {e}", exc_info=True)

def _handle_ai_response_ready(data: dict):
    message_id = data.get("message_id")
    ai_response = data.get("ai_response")
    if not message_id or not ai_response:
        logger.warning("Missing message_id or ai_response in ai_response_ready event")
        return

    from app.db.session import SessionLocal
    from app.crud import message as message_crud
    db = SessionLocal()
    try:
        message_crud.update_message_response(db, message_id, ai_response)
        logger.info(f"Updated message {message_id} with AI response.")
    finally:
        db.close()

def _handle_user_created(data: dict):
    user_data = data.get("user")
    if not user_data:
        logger.warning("No user data in user_created event")
        return

    from app.db.session import SessionLocal
    from app.crud import user as user_crud
    from app.schemas.user import UserCreate
    db = SessionLocal()
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

EVENT_HANDLERS = {
    "ai_response_ready": _handle_ai_response_ready,
    "user_created": _handle_user_created,
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
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        ch = get_rabbitmq_channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchanges = {
            'ai_response_events': 'whatsapp_connector_ai_response_events',
            'user_fanout_events': 'whatsapp_connector_user_events'
        }

        for exchange_name, queue_name in exchanges.items():
            ch.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
            ch.queue_declare(queue=queue_name, durable=True)
            ch.queue_bind(exchange=exchange_name, queue=queue_name)
            ch.basic_consume(queue=queue_name, on_message_callback=on_message_callback)
            logger.info(f"Consumer set up for exchange '{exchange_name}' on queue '{queue_name}'")

        logger.info(' [*] Waiting for messages. To exit press CTRL+C')
        ch.start_consuming()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
        global channel
        channel = None
    except Exception as e:
        logger.error(f"An error occurred while consuming messages: {e}", exc_info=True)
