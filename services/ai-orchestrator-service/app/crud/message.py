from sqlalchemy.orm import Session, joinedload
from ..models.message import Message
from ..models.customer import Customer
from typing import List

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
