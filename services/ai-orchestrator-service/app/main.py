import logging
from fastapi import FastAPI, Depends, Query
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
from sqlalchemy import inspect, text
import os
import requests

def init_db():
    Base.metadata.create_all(bind=engine)
    # Lightweight migration: add customers.whatsapp_no if missing
    try:
        insp = inspect(engine)
        cols = [c.get("name") for c in insp.get_columns("customers")]
        if "whatsapp_no" not in cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE customers ADD COLUMN whatsapp_no VARCHAR"))
                conn.commit()
            logger.info("Added whatsapp_no column to customers table")
    except Exception as e:
        logger.warning(f"DB migration check failed or not needed: {e}")

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
async def get_conversations_endpoint(
    db: Session = Depends(get_db),
    user_id: int | None = Query(default=None, description="Filter by owner user_id"),
):
    """
    Fetch all conversations with their messages.
    """
    return get_conversations(db, user_id=user_id)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}

class BackfillResult(BaseModel):
    updated: int

@app.post("/api/v1/ai/backfill-whatsapp/{user_id}", response_model=BackfillResult)
def backfill_whatsapp_numbers(user_id: int, db: Session = Depends(get_db)):
    """Backfill customers.whatsapp_no by querying WhatsApp connector for this user."""
    # Build base URL from env or default to traefik
    base = os.getenv("WHATSAPP_CONNECTOR_URL", "http://whatsapp-connector-service:8002")
    url = f"{base}/api/v1/whatsapp/users/{user_id}/customers"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    customers = r.json() or []

    updated = 0
    # Map orchestrator customer.id == whatsapp customer.id by design
    from .crud import customer as customer_crud
    for c in customers:
        cid = c.get("id")
        wno = c.get("whatsapp_no")
        if not cid:
            continue
        cust = customer_crud.get_customer(db, customer_id=cid)
        if cust and wno and getattr(cust, "whatsapp_no", None) != wno:
            cust.whatsapp_no = wno
            db.commit()
            db.refresh(cust)
            updated += 1
    return {"updated": updated}
