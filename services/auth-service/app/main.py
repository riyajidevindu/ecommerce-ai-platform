from fastapi import FastAPI
from app.api.v1 import auth
from app.db.session import engine
from app.models import user

user.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service",
    description="Handles user authentication and authorization.",
    version="0.1.0"
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
