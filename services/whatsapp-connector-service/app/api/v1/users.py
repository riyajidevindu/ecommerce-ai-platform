from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import user as user_crud
from app.schemas import user as user_schema
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[user_schema.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=user_schema.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user_crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=user_schema.User)
def update_user_whatsapp(user_id: int, payload: dict, db: Session = Depends(get_db)):
    whatsapp_no = payload.get("whatsapp_no")
    phone_number_id = payload.get("phone_number_id")
    db_user = user_crud.update_user_whatsapp_info(db, user_id=user_id, whatsapp_no=whatsapp_no, phone_number_id=phone_number_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
