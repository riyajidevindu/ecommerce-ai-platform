import pika
import os
import logging
import json
import time

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

# Dedicated consumer channel/connection managed in the consumer thread only.
_consumer_connection = None
_consumer_channel = None

def _get_consumer_channel():
    """
    Returns a RabbitMQ channel for the consumer thread. Not thread-safe.
    """
    global _consumer_connection, _consumer_channel
    if _consumer_channel is None or _consumer_channel.is_closed:
        if _consumer_connection is None or _consumer_connection.is_closed:
            _consumer_connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        _consumer_channel = _consumer_connection.channel()
    return _consumer_channel

def publish_message(message_data: dict, _retries: int = 1):
    """
    Publishes a message to the new_message_events exchange using a short-lived connection.
    This avoids cross-thread channel reuse issues and is robust for moderate throughput.
    """
    exchange_name = 'new_message_events'
    message_body = json.dumps({
        "event_type": "new_message",
        "message_data": message_data
    })
    try:
        params = pika.URLParameters(RABBITMQ_URL)
        with pika.BlockingConnection(params) as connection:
            ch = connection.channel()
            ch.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
            ch.basic_publish(
                exchange=exchange_name,
                routing_key='',
                body=message_body,
                properties=pika.BasicProperties(delivery_mode=2)
            )
        logger.info(f" [x] Sent {message_body}")
    except Exception as e:
        if _retries > 0:
            logger.warning(f"Publish failed, retrying... ({e})")
            time.sleep(1)
            return publish_message(message_data, _retries=_retries - 1)
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
    while True:
        try:
            logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
            ch = _get_consumer_channel()
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
            logger.error(f"Failed to connect to RabbitMQ: {e}. Retrying in 5 seconds...")
            global _consumer_connection, _consumer_channel
            try:
                if _consumer_channel and not _consumer_channel.is_closed:
                    _consumer_channel.close()
            except Exception:
                pass
            try:
                if _consumer_connection and not _consumer_connection.is_closed:
                    _consumer_connection.close()
            except Exception:
                pass
            _consumer_channel = None
            _consumer_connection = None
            time.sleep(5)
        except Exception as e:
            logger.error(f"An error occurred while consuming messages: {e}. Retrying in 5 seconds...", exc_info=True)
            time.sleep(5)
