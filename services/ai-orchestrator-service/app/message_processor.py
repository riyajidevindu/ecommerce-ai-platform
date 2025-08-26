from . import gemini_client
from .groq_client import generate_response as groq_generate_response
from .db import get_db
from sqlalchemy.orm import Session
from .crud.message import update_message_response
from .crud.product import get_products_by_user_id
from .models.message import Message
from . import messaging

def process_message(channel, message: Message, db: Session, user_id: int):
    """
    Processes a single message and publishes the AI response.

    Inputs:
    - channel: RabbitMQ channel to publish the AI response.
    - message: DB Message row (contains customer/message ids and text).
    - db: SQLAlchemy session.
    - user_id: The owner/tenant id associated with this conversation.

    Note: We intentionally rely on the user_id coming with the event payload
    to avoid any mismatch due to cross-service customer id collisions.
    """
    try:
        # Always scope products by the user_id provided with the message event
        # rather than traversing message.customer to avoid tenant leakage.
        products = get_products_by_user_id(db, user_id)
        product_info = "\n".join([f"- {p.name}: {p.description}" for p in products]) if products else "(no products found for this user)"
        prompt = (
            "You are a helpful e-commerce assistant. "
            "Use the product list if available; if not, still provide a polite, useful reply.\n\n"
            f"Products for user:\n{product_info}\n\n"
            f"Customer message: {message.user_message}\n\n"
            "Respond concisely and friendly."
        )
        # Prefer Groq; fallback to Gemini if unavailable or errors
        print("[AI] Trying Groq for message", message.id)
        reply = groq_generate_response(prompt)
        if isinstance(reply, str) and reply.startswith("[Groq unavailable"):
            print("[AI] Groq unavailable; falling back to Gemini for message", message.id)
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
