from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import message_processor
from .db.session import get_db, engine
from .db.base import Base
from .models import user, customer, message, product
from .schemas.message import Conversation
from .crud.message import get_conversations
from pydantic import BaseModel
from typing import List
import threading
from . import messaging
from .db.session import SessionLocal

def init_db():
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Orchestrator Service",
    description="Orchestrates AI models and services.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Adjust this to your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    consumer_thread = threading.Thread(target=messaging.start_consumer, daemon=True)
    consumer_thread.start()

@app.post("/api/v1/process-messages")
async def process_new_messages(db: Session = Depends(get_db)):
    """
    Processes messages that have not yet been responded to.
    """
    # This is a placeholder for fetching new messages from the database
    new_messages = [
        {"id": 1, "message": "Do you have any laptops in stock?"},
        {"id": 2, "message": "I need a new mouse."},
    ]
    
    for msg in new_messages:
        message_processor.process_message(msg, db)
        
    return {"status": "ok", "processed_messages": len(new_messages)}

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
