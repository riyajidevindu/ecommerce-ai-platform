from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_whatsapp_no(db: Session, whatsapp_no: str):
    return db.query(User).filter(User.whatsapp_no == whatsapp_no).first()

def get_user_by_phone_number_id(db: Session, phone_number_id: str):
    return db.query(User).filter(User.phone_number_id == phone_number_id).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(id=user.id, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_whatsapp_info(db: Session, user_id: int, whatsapp_no: str | None = None, phone_number_id: str | None = None):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    if whatsapp_no is not None:
        db_user.whatsapp_no = whatsapp_no
    if phone_number_id is not None:
        db_user.phone_number_id = phone_number_id
    db.commit()
    db.refresh(db_user)
    return db_user
