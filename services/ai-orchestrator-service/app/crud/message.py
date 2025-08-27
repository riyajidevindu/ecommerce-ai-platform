from sqlalchemy.orm import Session, joinedload
from ..models.message import Message
from ..schemas.message import MessageBase
from ..models.customer import Customer
from typing import List
from ..phone_cache import get_whatsapp_no

def create_message(db: Session, message: MessageBase, customer_id: int, message_id: int) -> Message:
    db_message = Message(
        id=message_id,
        customer_id=customer_id,
        user_message=message.user_message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_unprocessed_messages(db: Session) -> List[Message]:
    return db.query(Message).filter(Message.is_send_response == False).all()

def get_message(db: Session, message_id: int) -> Message | None:
    return db.query(Message).filter(Message.id == message_id).first()

def update_message_response(db: Session, message_id: int, response_message: str):
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if db_message:
        db_message.response_message = response_message
        db_message.is_send_response = True
        db.commit()
        db.refresh(db_message)
    return db_message

def get_conversations(db: Session, user_id: int | None = None) -> List[dict]:
    query = db.query(Customer).options(joinedload(Customer.messages))
    if user_id is not None:
        query = query.filter(Customer.user_id == user_id)
    customers = query.all()

    result: List[dict] = []
    for customer in customers:
        # Only include if there are messages with AI responses
        msgs = [m for m in customer.messages if m.response_message is not None]
        if not msgs:
            continue

        first_user_msg = next((m.user_message for m in customer.messages if m.user_message), None)
        # TEMP: Use a stable identifier if phone is unknown; UI expects a string key
        # Prefer persisted phone; then try cache; then fallback stable id
        persisted_no = getattr(customer, "whatsapp_no", None)
        cache_no = None
        if not persisted_no:
            try:
                cache_no = get_whatsapp_no(customer.id)
            except Exception:
                cache_no = None

        result.append(
            {
                "whatsapp_no": persisted_no or cache_no or f"customer:{customer.id}",
                "first_message": first_user_msg,
                "messages": [
                    {
                        "id": m.id,
                        "customer_id": m.customer_id,
                        "user_message": m.user_message,
                        "response_message": m.response_message,
                    }
                    for m in msgs
                ],
            }
        )
    return result
