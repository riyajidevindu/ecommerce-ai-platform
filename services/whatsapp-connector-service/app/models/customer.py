from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    whatsapp_no = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    address = Column(String, nullable=True)

    user = relationship("User", back_populates="customers")
    messages = relationship("Message", back_populates="customer")
