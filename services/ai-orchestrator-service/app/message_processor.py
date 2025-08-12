from . import gemini_client
from .db import get_db
from sqlalchemy.orm import Session

def process_message(message: dict, db: Session):
    """
    Processes a single message.
    """
    product_info = gemini_client.extract_product_info(message["message"])
    
    # This is a placeholder for searching the stock table
    stock_status = "in stock" 
    
    reply = gemini_client.generate_natural_reply(product_info, stock_status)
    
    # This is a placeholder for saving the reply to the database
    print(f"Reply for message {message['id']}: {reply}")
