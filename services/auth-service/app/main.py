from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api.v1 import auth, users
from app.db.session import engine
from app.models import user, refresh_token, revoked_token
import os

user.Base.metadata.create_all(bind=engine)
refresh_token.Base.metadata.create_all(bind=engine)
revoked_token.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service",
    description="Handles user authentication and authorization.",
    version="0.1.0"
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

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
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
    
    # Expose health on the ingress path prefix without requiring path rewriting
    from fastapi import APIRouter
    _health_router = APIRouter(prefix="/api/v1/auth")
    
    @_health_router.get("/health")
    def health_check_prefixed():
        return {"status": "ok"}
    
    app.include_router(_health_router, tags=["health"]) 
