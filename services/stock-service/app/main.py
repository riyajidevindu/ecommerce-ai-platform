import logging
import threading
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.v1 import products
from app.db.session import engine
from app.db.base import Base
from app.models import product, user # Import the models to register them with Base
from app.messaging import start_consumer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    # This will now create all tables registered with the Base
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stock Service",
    description="Handles product stock management.",
    version="0.1.0"
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up and initializing database...")
    init_db()
    logger.info("Database initialized.")
    
    # Start the RabbitMQ consumer in a background thread
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()
    logger.info("RabbitMQ consumer started.")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status code: {response.status_code}")
    return response

# CORS configuration to allow frontend access
_extra_origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "").split(",") if o.strip()]
origins = [
    "http://localhost:8080",  # frontend custom port
    "http://localhost:5173",  # Vite default dev port
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
    "https://ecommerce-ai-platform.vercel.app",
]
origins += _extra_origins
_cors_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip() or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=_cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/v1/products", tags=["products"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
