from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    availability_qty: Optional[int] = None
    stock_qty: Optional[int] = None

class ProductCreate(ProductBase):
    user_id: int

class Product(ProductBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
