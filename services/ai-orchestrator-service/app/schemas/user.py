from pydantic import BaseModel

class UserBase(BaseModel):
    id: int
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True
