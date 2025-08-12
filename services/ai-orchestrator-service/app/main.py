from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import message_processor
from .db import get_db, Base, engine
from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    id: int
    user_id: int
    message: str
    response: str | None = None
    created_at: str

    class Config:
        orm_mode = True

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Orchestrator Service",
    description="Orchestrates AI models and services.",
    version="0.1.0"
)

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

@app.get("/api/v1/messages", response_model=List[Message])
async def get_messages(db: Session = Depends(get_db)):
    """
    Fetch all messages with their responses.
    """
    # This is a placeholder for fetching messages from the database
    return [
        Message(id=1, user_id=123, message="Do you have any laptops in stock?", response="Yes, we have laptops in stock.", created_at="2024-01-01T12:00:00Z"),
        Message(id=2, user_id=456, message="I need a new mouse.", response="We have a variety of mice available.", created_at="2024-01-01T12:05:00Z"),
    ]

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
