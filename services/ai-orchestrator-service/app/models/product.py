from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    price = Column(Float)
    description = Column(String, nullable=True)
    image = Column(String, nullable=True)
    stock_qty = Column(Integer, nullable=True)
    available_qty = Column(Integer, nullable=True)
 

    owner = relationship("User", back_populates="products")
