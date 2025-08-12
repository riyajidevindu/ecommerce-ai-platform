from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    message = Column(String)
    send_ai = Column(Boolean, default=False)
    send_customer = Column(Boolean, default=False)
    response_message = Column(String, nullable=True)

    customer = relationship("Customer", back_populates="messages")
