from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema
from app.core.security import get_password_hash
from app.messaging import publish_user_created

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
