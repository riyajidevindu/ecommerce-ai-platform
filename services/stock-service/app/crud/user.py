from sqlalchemy.orm import Session
from app.models import user as user_model
from app.schemas import user as user_schema

def get_user(db: Session, user_id: int):
    return db.query(user_model.User).filter(user_model.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(user_model.User).filter(user_model.User.username == username).first()

def create_user(db: Session, user: user_schema.UserCreate):
    db_user = user_model.User(
        id=user.id,
        username=user.username,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
