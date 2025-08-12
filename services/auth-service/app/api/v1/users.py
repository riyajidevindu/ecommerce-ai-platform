from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import User
from app.core.security import get_current_user
from app.crud import session as session_crud
from app.db.session import get_db

router = APIRouter()

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/validate_session", response_model=User)
def validate_session(session_id: str, db: Session = Depends(get_db)):
    session = session_crud.get_session(db, session_id=session_id)
    if not session or not session.is_active:
        raise HTTPException(status_code=401, detail="Invalid session")
    return session.user
