from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    price: float
    quantity: int
    image: str
    sku: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True
