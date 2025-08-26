import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy.orm import Session
from . import message_processor
from .db.session import get_db, engine
from .db.base import Base
from .models import user, customer, message, product, conversation_state
from .schemas.message import Conversation
from .crud.message import get_conversations, get_unprocessed_messages
from pydantic import BaseModel
from typing import List
import threading
from . import messaging
from .db.session import SessionLocal

def init_db():
    Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Orchestrator Service",
    description="Orchestrates AI models and services.",
    version="0.1.0"
)

_extra_origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "").split(",") if o.strip()]
_origins = [
    "http://localhost:8080",
    "https://ecommerce-ai-platform.vercel.app",
]
_origins += _extra_origins
_cors_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip() or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
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

@app.get("/api/v1/ai/conversations", response_model=List[Conversation])
async def get_conversations_endpoint(db: Session = Depends(get_db)):
    """
    Fetch all conversations with their messages.
    """
    return get_conversations(db)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
