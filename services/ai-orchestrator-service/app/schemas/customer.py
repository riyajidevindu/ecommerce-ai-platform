from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    user_id: int
    whatsapp_no: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        orm_mode = True
