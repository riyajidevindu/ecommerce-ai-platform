from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth
from app.db.session import engine
from app.models import user

user.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service",
    description="Handles user authentication and authorization.",
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

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
