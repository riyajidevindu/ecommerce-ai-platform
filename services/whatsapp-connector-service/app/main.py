import logging
from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.models import user, customer, message
from app.api.v1 import users, whatsapp
import threading
from . import messaging
from fastapi.middleware.cors import CORSMiddleware
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WhatsApp Connector Service",
    description="Handles communication with the WhatsApp API.",
    version="0.1.0"
)

_extra_origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "").split(",") if o.strip()]
origins = [
    "http://localhost",
    "http://localhost:8080",
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

@app.on_event("startup")
async def startup_event():
    init_db()
    consumer_thread = threading.Thread(target=messaging.start_consumer, daemon=True)
    consumer_thread.start()

app.include_router(users.router, prefix="/api/v1/whatsapp/users", tags=["users"])
app.include_router(whatsapp.router, prefix="/api/v1/whatsapp", tags=["whatsapp"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
