from pydantic import BaseModel

class UserBase(BaseModel):
    name: str | None = None
    whatsapp_no: str | None = None

class UserCreate(UserBase):
    id: int

class User(UserBase):
    id: int

    class Config:
        orm_mode = True
