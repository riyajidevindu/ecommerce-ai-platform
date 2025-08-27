from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud import customer as customer_crud
from app.crud import message as message_crud
from app.crud import user as user_crud
from app.crud import whatsapp as whatsapp_crud
from app.schemas import user as user_schema
from app.schemas.customer import CustomerCreate
from app.schemas.message import MessageCreate
from app.schemas.whatsapp import WhatsAppUser, WhatsAppUserCreate
from app import messaging
import requests
from app.config import WHATSAPP_VERIFY_TOKEN
from fastapi.responses import PlainTextResponse

router = APIRouter()

@router.get("/user/{user_id}", response_model=WhatsAppUser)
def get_whatsapp_user(user_id: int, db: Session = Depends(get_db)):
    db_user = whatsapp_crud.get_whatsapp_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/user/{user_id}", response_model=WhatsAppUser)
def create_or_update_whatsapp_user(user_id: int, whatsapp_user: WhatsAppUserCreate, db: Session = Depends(get_db)):
    return whatsapp_crud.create_or_update_whatsapp_user(db=db, user_id=user_id, whatsapp_user=whatsapp_user)

@router.get("/user/{user_id}/connected-numbers", response_model=list[str])
def list_connected_numbers(user_id: int, db: Session = Depends(get_db)):
    numbers = customer_crud.get_connected_numbers_for_user(db, user_id=user_id)
    return numbers

@router.get("/user/{user_id}/message-stats")
def list_message_stats(user_id: int, db: Session = Depends(get_db)):
    return message_crud.get_message_stats_for_user(db, user_id=user_id)

@router.get("/webhook")
async def whatsapp_webhook_verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token and token == WHATSAPP_VERIFY_TOKEN:
        return PlainTextResponse(content=str(challenge or ""))
    raise HTTPException(status_code=403, detail="Verification failed")

# Accept trailing slash variants to avoid 404s from strict-slash clients
@router.get("/webhook/")
async def whatsapp_webhook_verify_slash(request: Request):
    return await whatsapp_webhook_verify(request)


@router.post("/webhook")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()

    # Support simple dev payload { receiver_number, sender_number, message }
    receiver_number = payload.get("receiver_number")
    sender_number = payload.get("sender_number")
    user_message = payload.get("message")

    # If not present, try to parse WhatsApp Cloud API webhook structure
    if not (receiver_number and sender_number and user_message):
        try:
            entry = (payload.get("entry") or [])[0]
            changes = (entry.get("changes") or [])[0]
            value = changes.get("value") or {}
            messages = value.get("messages") or []
            contacts = value.get("contacts") or []
            metadata = value.get("metadata") or {}
            if messages:
                msg = messages[0]
                if msg.get("type") == "text":
                    user_message = msg["text"]["body"]
                else:
                    # Non-text: fallback to a generic marker
                    user_message = f"[Unsupported message type: {msg.get('type')}]"
                sender_number = msg.get("from")
                # Receiver number best-effort from metadata
                receiver_number = metadata.get("display_phone_number") or metadata.get("phone_number_id")
        except Exception:
            pass

    if not receiver_number or not sender_number or not user_message:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    # Prefer mapping by phone_number_id if present
    matched_user = None
    # If the payload contained metadata, try matching by phone_number_id
    try:
        if 'value' in locals() and isinstance(value, dict):
            phone_number_id = value.get("metadata", {}).get("phone_number_id")
            if phone_number_id:
                matched_user = user_crud.get_user_by_phone_number_id(db, phone_number_id=phone_number_id)
    except Exception:
        pass
    # Fallback to display phone number mapping
    if not matched_user:
        matched_user = user_crud.get_user_by_whatsapp_no(db, whatsapp_no=receiver_number)
    if not matched_user:
        # If metadata.phone_number_id was provided, your data model should map it to user
        raise HTTPException(status_code=404, detail="User not found for receiver number")

    # Get or create the customer by sender's number, scoped to this user
    customer = customer_crud.get_customer_by_whatsapp_no_for_user(db, user_id=matched_user.id, whatsapp_no=sender_number)
    if not customer:
        customer = customer_crud.create_customer(
            db,
            customer=CustomerCreate(whatsapp_no=sender_number, user_id=matched_user.id),
        )

    # Persist inbound message
    message = message_crud.create_message(db, message=MessageCreate(customer_id=customer.id, message=user_message))

    # Publish to orchestrator for AI response
    message_data = {
        "id": message.id,
        "customer_id": customer.id,
        "whatsapp_no": customer.whatsapp_no,
    "user_id": matched_user.id,
        "user_message": message.message,
    }
    messaging.publish_message(message_data)

    return {"status": "ok", "message_id": message.id}

# Accept trailing slash variants to avoid 404s from strict-slash clients
@router.post("/webhook/")
async def whatsapp_webhook_slash(request: Request, db: Session = Depends(get_db)):
    return await whatsapp_webhook(request, db)
