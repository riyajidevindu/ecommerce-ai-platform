from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.whatsapp import WhatsAppUserCreate

def get_whatsapp_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_or_update_whatsapp_user(db: Session, user_id: int, whatsapp_user: WhatsAppUserCreate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.whatsapp_no = whatsapp_user.whatsapp_no
        db.commit()
        db.refresh(db_user)
    return db_user
