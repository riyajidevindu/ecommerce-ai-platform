from fastapi import APIRouter, Depends, HTTPException
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

@router.post("/webhook")
async def whatsapp_webhook(request: dict, db: Session = Depends(get_db)):
    # Extract message details from the request
    receiver_number = request.get("receiver_number")
    sender_number = request.get("sender_number")
    user_message = request.get("message")

    if not receiver_number or not sender_number or not user_message:
        raise HTTPException(status_code=400, detail="Missing receiver_number, sender_number, or message")

    # Get the user
    user = user_crud.get_user_by_whatsapp_no(db, whatsapp_no=receiver_number)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get or create the customer
    customer = customer_crud.get_customer_by_whatsapp_no(db, whatsapp_no=sender_number)
    if not customer:
        customer = customer_crud.create_customer(db, customer=CustomerCreate(whatsapp_no=sender_number, user_id=user.id))

    # Create the message
    message = message_crud.create_message(db, message=MessageCreate(customer_id=customer.id, message=user_message))

    # Trigger the AI orchestrator by publishing a message to RabbitMQ
    message_data = {
        "id": message.id,
        "customer_id": customer.id,
        "whatsapp_no": customer.whatsapp_no,
        "user_id": user.id,
        "user_message": message.message
    }
    messaging.publish_message(message_data)

    return {"status": "ok", "message_id": message.id}

@router.post("/sync-missed-messages")
async def sync_missed_messages(db: Session = Depends(get_db)):
    unsent_messages = message_crud.get_unsent_messages(db)
    for message in unsent_messages:
        message_data = {
            "id": message.id,
            "customer_id": message.customer.id,
            "whatsapp_no": message.customer.whatsapp_no,
            "user_id": message.customer.user.id,
            "user_message": message.message
        }
        messaging.publish_message(message_data)
    return {"status": "ok", "sent_messages": len(unsent_messages)}
