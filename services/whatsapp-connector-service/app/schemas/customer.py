from pydantic import BaseModel

class CustomerBase(BaseModel):
    whatsapp_no: str
    user_id: int

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True
