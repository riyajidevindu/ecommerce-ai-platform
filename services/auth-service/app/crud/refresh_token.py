from sqlalchemy.orm import Session
from app.models.refresh_token import RefreshToken
from datetime import datetime, timedelta, timezone
import uuid

def create_refresh_token(db: Session, user_id: int, expires_delta: timedelta):
    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + expires_delta
    db_refresh_token = RefreshToken(user_id=user_id, token=token, expires_at=expires_at)
    db.add(db_refresh_token)
    db.commit()
    db.refresh(db_refresh_token)
    return db_refresh_token

def get_refresh_token(db: Session, token: str):
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def revoke_all_refresh_tokens_for_user(db: Session, user_id: int):
    tokens_to_revoke = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.is_revoked == False
    ).all()
    
    for token in tokens_to_revoke:
        token.is_revoked = True
        
    db.commit()
