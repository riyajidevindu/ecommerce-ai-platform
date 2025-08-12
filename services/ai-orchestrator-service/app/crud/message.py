from sqlalchemy.orm import Session
from app.models.message import Message
from app.schemas.message import MessageCreate

def get_message(db: Session, message_id: int):
    return db.query(Message).filter(Message.id == message_id).first()

def get_messages_by_customer(db: Session, customer_id: int, skip: int = 0, limit: int = 100):
    return db.query(Message).filter(Message.customer_id == customer_id).offset(skip).limit(limit).all()

def create_message(db: Session, message: MessageCreate):
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
