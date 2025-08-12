from pydantic import BaseModel
from typing import Optional

class MessageBase(BaseModel):
    message: str
    send_ai: bool = False
    send_customer: bool = False
    response_message: Optional[str] = None

class MessageCreate(MessageBase):
    customer_id: int

class Message(MessageBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True
