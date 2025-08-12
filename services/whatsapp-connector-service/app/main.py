from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.models import user, customer, message
import threading
from . import messaging

def init_db():
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WhatsApp Connector Service",
    description="Handles communication with the WhatsApp API.",
    version="0.1.0"
)

@app.on_event("startup")
async def startup_event():
    init_db()
    consumer_thread = threading.Thread(target=messaging.start_consumer, daemon=True)
    consumer_thread.start()

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
