from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import httpx
import os
import logging

from app.db.session import get_db
from app.models.user import User
from app.crud import user as user_crud
from app.schemas import user as user_schema

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")
logger = logging.getLogger(__name__)

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    logger.info(f"Attempting to authenticate with Authorization header: {auth_header}")
    if auth_header is None:
        logger.error("No Authorization header found in request.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    async with httpx.AsyncClient() as client:
        try:
            logger.info(f"Validating token with auth service at {AUTH_SERVICE_URL}")
            headers = {"Authorization": auth_header}
            response = await client.get(
                f"{AUTH_SERVICE_URL}/api/v1/users/me",
                headers=headers,
            )
            logger.info(f"Auth service response status: {response.status_code}")
            response.raise_for_status()
            user_data = response.json()
            logger.info(f"Auth service returned user data: {user_data}")
        except httpx.RequestError as exc:
            logger.error(f"Request to auth service failed: {exc}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is unavailable.",
            )
        except httpx.HTTPStatusError as exc:
            logger.error(f"Auth service returned error status {exc.response.status_code}: {exc.response.text}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

    user = db.query(User).filter(User.id == user_data["id"]).first()
    if user is None:
        # Just-in-time user creation
        new_user = User(id=user_data["id"], username=user_data["username"])
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
        
    return user
