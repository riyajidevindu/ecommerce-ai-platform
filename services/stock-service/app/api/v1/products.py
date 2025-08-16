from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import product as product_crud
from app.schemas import product as product_schema
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.messaging import publish_product_created, publish_product_updated, publish_product_deleted

router = APIRouter()

@router.post("/", response_model=product_schema.Product)
def create_product(product: product_schema.ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = product_crud.get_product_by_sku(db, sku=product.sku)
    if db_product:
        raise HTTPException(status_code=400, detail="SKU already registered")
    new_product = product_crud.create_product(db=db, product=product, user_id=current_user.id)
    publish_product_created(product_data={
        "id": new_product.id,
        "name": new_product.name,
        "sku": new_product.sku,
        "price": new_product.price,
        "description": new_product.description,
        "image_url": new_product.image,
        "availability_qty": new_product.available_qty,
        "stock_qty": new_product.stock_qty,
        "user_id": new_product.owner_id
    })
    return new_product

@router.get("/", response_model=List[product_schema.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = product_crud.get_products(db, user_id=current_user.id, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=product_schema.Product)
def read_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = product_crud.get_product(db, product_id=product_id)
    if db_product is None or db_product.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=product_schema.Product)
def update_product(product_id: int, product: product_schema.ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = product_crud.get_product(db, product_id=product_id)
    if db_product is None or db_product.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Product not found")
    updated_product = product_crud.update_product(db=db, product_id=product_id, product=product)
    publish_product_updated(product_data={
        "id": updated_product.id,
        "name": updated_product.name,
        "sku": updated_product.sku,
        "price": updated_product.price,
        "description": updated_product.description,
        "image_url": updated_product.image,
        "availability_qty": updated_product.available_qty,
        "stock_qty": updated_product.stock_qty,
        "user_id": updated_product.owner_id
    })
    return updated_product

@router.delete("/{product_id}", response_model=product_schema.Product)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = product_crud.get_product(db, product_id=product_id)
    if db_product is None or db_product.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Product not found")
    deleted_product = product_crud.delete_product(db=db, product_id=product_id)
    publish_product_deleted(product_id=deleted_product.id)
    return deleted_product
