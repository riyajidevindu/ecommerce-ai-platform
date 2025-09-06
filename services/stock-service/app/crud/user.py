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
    email=user.email,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, username: str | None = None, email: str | None = None):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    changed = False
    if username and db_user.username != username:
        db_user.username = username
        changed = True
    if email and getattr(db_user, 'email', None) != email:
        db_user.email = email
        changed = True
    if changed:
        db.commit()
        db.refresh(db_user)
    return db_user
