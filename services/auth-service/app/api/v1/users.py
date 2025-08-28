from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import User, UserUpdate
from app.core.security import get_current_user
from app.db.session import get_db
from app.crud import user as user_crud

router = APIRouter()

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=User)
def update_users_me(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Perform update and publish event if changed
    updated_user, _changed = user_crud.update_user(db=db, db_user=current_user, updates=updates)
    return updated_user


@router.put("/me", response_model=User)
def replace_users_me(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Accept same partial payload; acts as fallback if PATCH not routed properly
    updated_user, _changed = user_crud.update_user(db=db, db_user=current_user, updates=updates)
    return updated_user
