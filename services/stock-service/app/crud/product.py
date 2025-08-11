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
    product_data = product.dict(exclude={"available_qty"})
    db_product = product_model.Product(**product_data, available_qty=product.stock_qty)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: product_schema.ProductCreate):
    db_product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if db_product:
        update_data = product.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        if "stock_qty" in update_data:
            db_product.available_qty = update_data["stock_qty"]
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product
