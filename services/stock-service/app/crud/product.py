from sqlalchemy.orm import Session
from app.models import product as product_model
from app.schemas import product as product_schema

def get_product(db: Session, product_id: int):
    return db.query(product_model.Product).filter(product_model.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(product_model.Product).filter(product_model.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(product_model.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: product_schema.ProductCreate):
    db_product = product_model.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
