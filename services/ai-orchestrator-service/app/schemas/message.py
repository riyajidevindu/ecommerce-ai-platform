from pydantic import BaseModel
from typing import List

class MessageBase(BaseModel):
    user_message: str
    response_message: str | None = None

class Message(MessageBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True

class Conversation(BaseModel):
    whatsapp_no: str
    first_message: str
    messages: List[Message]

    class Config:
        orm_mode = True
