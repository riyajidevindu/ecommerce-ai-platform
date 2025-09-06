from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema
from app.core.security import get_password_hash, verify_password
from app.messaging import publish_user_created, publish_user_updated
from fastapi import HTTPException

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate, auth_provider: str = "local"):
    hashed_password = None
    if user.password:
        hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password,
        auth_provider=auth_provider
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Publish user created event
    user_data = UserSchema.from_orm(db_user).dict()
    publish_user_created(user_data)
    
    return db_user


def update_user(db: Session, db_user: User, updates: UserUpdate):
    changed = False

    # Username
    if updates.username is not None and updates.username != db_user.username:
        db_user.username = updates.username
        changed = True

    # Email uniqueness check
    if updates.email is not None and updates.email != db_user.email:
        existing = get_user_by_email(db, email=updates.email)
        if existing and existing.id != db_user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
        db_user.email = updates.email
        changed = True

    # Password change (only for local auth users with stored hash)
    if updates.new_password:
        if db_user.auth_provider != "local" or not db_user.hashed_password:
            raise HTTPException(status_code=400, detail="Password change not allowed for this account")
        if not updates.current_password:
            raise HTTPException(status_code=400, detail="Current password required")
        if not verify_password(updates.current_password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        db_user.hashed_password = get_password_hash(updates.new_password)
        changed = True

    if not changed:
        return db_user, False

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    publish_user_updated(UserSchema.from_orm(db_user).dict())
    return db_user, True
