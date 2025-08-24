from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Notification Service",
    description="Handles sending notifications (email, SMS, etc.).",
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

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
