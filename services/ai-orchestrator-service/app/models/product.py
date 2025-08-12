from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    price = Column(Float)
    image_url = Column(String, nullable=True)
    availability_qty = Column(Integer, nullable=True)
    stock_qty = Column(Integer, nullable=True)

    user = relationship("User", back_populates="products")
