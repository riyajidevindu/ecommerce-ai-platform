from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid
from sqlalchemy.orm import Session
from app.schemas.token import TokenData
from app.db.session import get_db
from app.crud import user as user_crud, refresh_token as refresh_token_crud, revoked_token as revoked_token_crud

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(db: Session, user_id: int):
    expires_delta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    db_refresh_token = refresh_token_crud.create_refresh_token(db=db, user_id=user_id, expires_delta=expires_delta)
    return db_refresh_token.token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        jti: str = payload.get("jti")
        if username is None or jti is None:
            raise credentials_exception
        if revoked_token_crud.is_token_revoked(db, jti=jti):
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = user_crud.get_user_by_username_or_email(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_current_user_from_refresh_token(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    db_refresh_token = refresh_token_crud.get_refresh_token(db, token=token)
    
    if not db_refresh_token or db_refresh_token.is_revoked or db_refresh_token.expires_at < datetime.now(timezone.utc):
        raise credentials_exception
        
    user = db_refresh_token.user
    if user is None:
        raise credentials_exception
    return user

def revoke_refresh_tokens_for_user(db: Session, user_id: int):
    refresh_token_crud.revoke_all_refresh_tokens_for_user(db, user_id=user_id)

def revoke_access_token(db: Session, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        exp = datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
        if jti:
            revoked_token_crud.add_revoked_token(db, jti=jti, exp=exp)
    except JWTError:
        pass # Ignore if the token is invalid
