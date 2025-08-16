from sqlalchemy.orm import Session
from app.models.revoked_token import RevokedToken
from datetime import datetime

def add_revoked_token(db: Session, jti: str, exp: datetime):
    db_revoked_token = RevokedToken(jti=jti, exp=exp)
    db.add(db_revoked_token)
    db.commit()
    db.refresh(db_revoked_token)
    return db_revoked_token

def is_token_revoked(db: Session, jti: str):
    return db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is not None
