from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.user import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_agent = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
