from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None
    available_qty: Optional[int] = None
    stock_qty: Optional[int] = None

class ProductCreate(ProductBase):
    owner_id: int

class Product(ProductBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True
