import pika
import os
import logging
import json

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/%2F")
logger = logging.getLogger(__name__)

def publish_message(message_data: dict):
    """
    Publishes a message to the new_message_events exchange.
    """
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()

        exchange_name = 'new_message_events'
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)

        message_body = json.dumps({
            "event_type": "new_message",
            "message_data": message_data
        })

        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',
            body=message_body,
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        logger.info(f" [x] Sent {message_body}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")
    except Exception as e:
        logger.error(f"An error occurred while publishing a message: {e}")


def on_message_callback(ch, method, properties, body):
    logger.info(f"Received message: {body}")
    data = json.loads(body)
    if data.get("event_type") == "ai_response_ready":
        message_id = data.get("message_id")
        ai_response = data.get("ai_response")
        if message_id and ai_response:
            from app.db.session import SessionLocal
            from app.crud import message as message_crud
            db = SessionLocal()
            try:
                message_crud.update_message_response(db, message_id, ai_response)
                logger.info(f"Updated message {message_id} with AI response.")
            finally:
                db.close()
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consumer():
    try:
        logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        logger.info("Successfully connected to RabbitMQ.")

        exchange_name = 'ai_response_events'
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
