import logging
from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.models import user, customer, message
from app.api.v1 import users, whatsapp
import threading
from . import messaging
from fastapi.middleware.cors import CORSMiddleware
import time
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WhatsApp Connector Service",
    description="Handles communication with the WhatsApp API.",
    version="0.1.0"
)

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_scheduler():
    while True:
        time.sleep(300)  # 5 minutes
        try:
            requests.post("http://localhost:8002/api/v1/whatsapp/sync-missed-messages")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to sync missed messages: {e}")

@app.on_event("startup")
async def startup_event():
    init_db()
    consumer_thread = threading.Thread(target=messaging.start_consumer, daemon=True)
    consumer_thread.start()
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()

app.include_router(users.router, prefix="/api/v1/whatsapp/users", tags=["users"])
app.include_router(whatsapp.router, prefix="/api/v1/whatsapp", tags=["whatsapp"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
