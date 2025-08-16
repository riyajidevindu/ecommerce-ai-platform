import logging
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate

logger = logging.getLogger(__name__)

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

def get_products_by_user_id(db: Session, user_id: int):
    return db.query(Product).filter(Product.user_id == user_id).all()

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: ProductCreate):
    db_product = get_product(db, product_id)
    if db_product:
        logger.info(f"Updating product {product_id} with data: {product.dict()}")
        update_data = product.dict(exclude_unset=True)
        update_data.pop("sku", None)  # Do not update SKU
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
        logger.info(f"Product {product_id} updated successfully.")
    else:
        logger.warning(f"Product with ID {product_id} not found for update.")
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product
