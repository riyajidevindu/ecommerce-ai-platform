from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.user import User, UserCreate
from app.schemas.session import SessionCreate
from app.crud import user as user_crud
from app.crud import session as session_crud
from app.db.session import get_db
from app.core.security import verify_password
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

@router.post("/login")
def login_for_access_token(response: Response, request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_crud.get_user_by_username_or_email(db, username=form_data.username)
    if not user:
        user = user_crud.get_user_by_username_or_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    session = session_crud.create_session(db, session=SessionCreate(user_id=user.id, user_agent=request.headers.get("user-agent")))
    response.set_cookie(key="session_id", value=session.id, httponly=True)
    return {"message": "Login successful"}

@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if session_id:
        session_crud.delete_session(db, session_id=session_id)
    response.delete_cookie(key="session_id")
    return {"message": "Logout successful"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

from fastapi.responses import RedirectResponse
import os

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.userinfo(token=token)
    
    user = user_crud.get_user_by_username_or_email(db, email=user_info['email'])
    if not user:
        # Create a new user with a placeholder for the password
        user = user_crud.create_user(db, user=UserCreate(username=user_info['name'], email=user_info['email'], password="google-oauth-placeholder"))

    session = session_crud.create_session(db, session=SessionCreate(user_id=user.id, user_agent=request.headers.get("user-agent")))
    response = RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/dashboard")
    response.set_cookie(key="session_id", value=session.id, httponly=True)
    return response
