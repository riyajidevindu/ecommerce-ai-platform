from fastapi import APIRouter, Depends
from app.schemas.user import User
from app.core.security import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
