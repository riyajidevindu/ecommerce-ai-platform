from fastapi import FastAPI
from app.api.v1 import products
from app.db.session import engine
from app.models import product

product.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stock Service",
    description="Handles product stock management.",
    version="0.1.0"
)

app.include_router(products.router, prefix="/api/v1/products", tags=["products"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
