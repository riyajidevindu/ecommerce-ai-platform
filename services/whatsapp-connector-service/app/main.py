from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.models import user, customer, message
from app.api.v1 import users
import threading
from . import messaging
from fastapi.middleware.cors import CORSMiddleware

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

@app.on_event("startup")
async def startup_event():
    init_db()
    consumer_thread = threading.Thread(target=messaging.start_consumer, daemon=True)
    consumer_thread.start()

app.include_router(users.router, prefix="/api/v1/whatsapp/users", tags=["users"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
