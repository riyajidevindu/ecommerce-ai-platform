from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=False)
    name = Column(String, index=True)

    customers = relationship("Customer", back_populates="user")
    products = relationship("Product", back_populates="owner")
