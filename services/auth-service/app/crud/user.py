from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_username_or_email(db: Session, username: str = "", email: str = ""):
    if username:
        return db.query(User).filter(User.username == username).first()
    if email:
        return db.query(User).filter(User.email == email).first()
    return None

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
