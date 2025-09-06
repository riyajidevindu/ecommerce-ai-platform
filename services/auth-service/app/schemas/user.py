from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: Optional[str] = None


class UserUpdate(BaseModel):
    """Fields allowed for user profile update (all optional)."""
    username: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None  # required if changing password
    new_password: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
