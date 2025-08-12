from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    user_message = Column(String, nullable=True)
    response_message = Column(String, nullable=True)
    is_send_response = Column(Boolean, default=False)

    customer = relationship("Customer", back_populates="messages")
