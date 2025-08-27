from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from ..db.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    # Persisted WhatsApp number for cross-service enrichment (nullable for backwards compat)
    whatsapp_no = Column(String, nullable=True)

    user = relationship("User", back_populates="customers")
    messages = relationship("Message", back_populates="customer")
