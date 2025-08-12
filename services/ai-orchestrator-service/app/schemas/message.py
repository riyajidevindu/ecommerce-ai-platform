from pydantic import BaseModel
from typing import Optional

class MessageBase(BaseModel):
    user_message: Optional[str] = None
    response_message: Optional[str] = None
    is_send_response: bool = False

class MessageCreate(MessageBase):
    customer_id: int

class Message(MessageBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True
