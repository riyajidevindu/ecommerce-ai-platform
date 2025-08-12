from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    whatsapp_no: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    user_id: int

class Customer(CustomerBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
