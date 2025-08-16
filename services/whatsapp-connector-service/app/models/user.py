from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=False)
    name = Column(String, index=True)
    whatsapp_no = Column(String, nullable=True)

    customers = relationship("Customer", back_populates="user")
