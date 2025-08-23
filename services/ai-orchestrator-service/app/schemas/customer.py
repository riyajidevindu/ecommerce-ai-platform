from pydantic import BaseModel

class CustomerBase(BaseModel):
    user_id: int

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        orm_mode = True
