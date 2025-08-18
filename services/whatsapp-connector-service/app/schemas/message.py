from pydantic import BaseModel

class MessageBase(BaseModel):
    customer_id: int
    message: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    response_message: str
    send_ai: bool

    class Config:
        from_attributes = True
