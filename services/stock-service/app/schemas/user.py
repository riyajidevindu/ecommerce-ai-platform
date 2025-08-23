from pydantic import BaseModel

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    id: int

class User(UserBase):
    id: int

    class Config:
        from_attributes = True
