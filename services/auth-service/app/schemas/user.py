from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str

from typing import Optional

class UserCreate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
