from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    id: int

class User(UserBase):
    id: int

    class Config:
        from_attributes = True
