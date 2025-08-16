from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.user import User, UserCreate
from app.schemas.token import Token
from app.crud import user as user_crud
from app.db.session import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, get_current_user_from_refresh_token, revoke_refresh_token, revoke_access_token, oauth2_scheme
from app.core.oauth import oauth
from app.messaging import publish_user_created

router = APIRouter()

@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user_by_email = user_crud.get_user_by_username_or_email(db, email=user.email)
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user_by_username = user_crud.get_user_by_username_or_email(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = user_crud.create_user(db=db, user=user)
    publish_user_created(user_data={"id": new_user.id, "username": new_user.username, "email": new_user.email})
    return new_user

@router.post("/login", response_model=Token)
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_crud.get_user_by_username_or_email(db, username=form_data.username)
    if not user:
        user = user_crud.get_user_by_username_or_email(db, email=form_data.username)
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(db=db, user_id=user.id)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
def refresh_access_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_current_user_from_refresh_token(token=refresh_token, db=db)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        revoke_refresh_token(db=db, token=refresh_token)
    revoke_access_token(db=db, token=token)
    response.delete_cookie(key="refresh_token")
    return {"message": "Logout successful"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

from fastapi.responses import RedirectResponse
import os
import uuid

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.userinfo(token=token)
    
    user = user_crud.get_user_by_username_or_email(db, email=user_info['email'])
    if not user:
        # Create a new user with a random, unusable password
        user = user_crud.create_user(db, user=UserCreate(username=user_info['name'], email=user_info['email'], password=None), auth_provider="google")

    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(db=db, user_id=user.id)
    
    response = RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/dashboard?access_token={access_token}")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")
    return response
