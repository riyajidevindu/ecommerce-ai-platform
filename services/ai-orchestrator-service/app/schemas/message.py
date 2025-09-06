from pydantic import BaseModel
from typing import List, Optional

class MessageBase(BaseModel):
    user_message: str
    response_message: str | None = None

class Message(MessageBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True

class Conversation(BaseModel):
    whatsapp_no: Optional[str] = None
    first_message: Optional[str] = None
    messages: List[Message]

    class Config:
        orm_mode = True
