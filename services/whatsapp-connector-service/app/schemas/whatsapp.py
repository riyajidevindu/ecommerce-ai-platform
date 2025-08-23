from pydantic import BaseModel, Field
from typing import Optional

class WhatsAppUserBase(BaseModel):
    whatsapp_no: Optional[str] = Field(None, max_length=20)
    phone_number_id: Optional[str] = Field(None, max_length=64)

class WhatsAppUserCreate(WhatsAppUserBase):
    pass

class WhatsAppUser(WhatsAppUserBase):
    id: int

    class Config:
        from_attributes = True
