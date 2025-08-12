from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base
from app.models import user, customer, message

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

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
