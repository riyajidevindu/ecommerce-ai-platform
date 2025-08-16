from . import gemini_client
from .db import get_db
from sqlalchemy.orm import Session
from .crud.message import update_message_response
from .crud.product import get_products_by_user_id
from .models.message import Message
from . import messaging

def process_message(channel, message: Message, db: Session):
    """
    Processes a single message and publishes the AI response.
    """
    try:
        products = get_products_by_user_id(db, message.customer.user_id)
        
        if not products:
            reply = "Sorry, we couldn't find any products for you at the moment. We'll do our best to bring them to you as soon as possible."
        else:
            product_info = "\n".join([f"- {p.name}: {p.description}" for p in products])
            prompt = f"The user is asking about products. Here are the products available for this user:\n{product_info}\n\nUser message: {message.user_message}\n\nPlease generate a suitable response."
            reply = gemini_client.generate_response(prompt)

        update_message_response(db, message.id, reply)
        
        # Use the passed-in channel to publish the response
        messaging.publish_ai_response(channel, message.id, reply)
        
        print(f"Reply for message {message.id}: {reply}")
    except Exception as e:
        # Log the exception and handle it appropriately
        # Consider whether to nack the message or take other corrective action
        print(f"Error processing message {message.id}: {e}")
        # Depending on the desired behavior, you might want to re-raise the exception
        # raise
