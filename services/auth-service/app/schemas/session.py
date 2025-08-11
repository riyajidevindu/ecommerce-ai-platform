from pydantic import BaseModel
from datetime import datetime

class SessionBase(BaseModel):
    user_agent: str | None = None

class SessionCreate(SessionBase):
    user_id: int

class Session(SessionBase):
    id: str
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True
