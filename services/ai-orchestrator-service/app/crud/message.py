from sqlalchemy.orm import Session, joinedload
from ..models.message import Message
from ..models.customer import Customer
from typing import List

def get_unprocessed_messages(db: Session) -> List[Message]:
    return db.query(Message).filter(Message.is_send_response == False).all()

def update_message_response(db: Session, message_id: int, response_message: str):
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if db_message:
        db_message.response_message = response_message
        db_message.is_send_response = True
        db.commit()
        db.refresh(db_message)
    return db_message

def get_conversations(db: Session) -> List[dict]:
    conversations = (
        db.query(Customer)
        .options(joinedload(Customer.messages))
        .all()
    )

    result = []
    for customer in conversations:
        if not customer.messages:
            continue

        first_message = customer.messages[0]
        result.append(
            {
                "whatsapp_no": customer.whatsapp_no,
                "first_message": first_message.user_message,
                "messages": [
                    {
                        "id": msg.id,
                        "customer_id": msg.customer_id,
                        "user_message": msg.user_message,
                        "response_message": msg.response_message,
                    }
                    for msg in customer.messages
                ],
            }
        )
    return result
