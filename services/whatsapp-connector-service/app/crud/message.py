from sqlalchemy.orm import Session
from app.models.message import Message
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
