from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.message import Message
from app.models.customer import Customer
from app.schemas.message import MessageCreate

def create_message(db: Session, message: MessageCreate):
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def update_message_response(db: Session, message_id: int, response_message: str):
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if db_message:
        db_message.response_message = response_message
        db_message.send_ai = True
        db.commit()
        db.refresh(db_message)
    return db_message

def mark_message_sent_to_customer(db: Session, message_id: int):
    db_message = db.query(Message).filter(Message.id == message_id).first()
    if db_message:
        db_message.send_customer = True
        db.commit()
        db.refresh(db_message)
    return db_message

def get_message_stats_for_user(db: Session, user_id: int):
    """
    Returns a list of dicts with whatsapp_no and message counts for that user.
    - total: total messages rows for the customers of the user
    - ai: messages marked send_ai=True
    - customer: messages marked send_customer=True (replies sent back)
    """
    rows = (
        db.query(
            Customer.whatsapp_no.label("whatsapp_no"),
            func.count(Message.id).label("total"),
            func.sum(case((Message.send_ai == True, 1), else_=0)).label("ai"),
            func.sum(case((Message.send_customer == True, 1), else_=0)).label("customer"),
        )
        .join(Customer, Message.customer_id == Customer.id)
        .filter(Customer.user_id == user_id, Customer.whatsapp_no.isnot(None))
        .group_by(Customer.whatsapp_no)
        .all()
    )
    result = []
    for row in rows:
        whatsapp_no, total, ai_cnt, cust_cnt = row
        result.append(
            {
                "whatsapp_no": whatsapp_no,
                "total": int(total or 0),
                "ai": int(ai_cnt or 0),
                "customer": int(cust_cnt or 0),
            }
        )
    return result
