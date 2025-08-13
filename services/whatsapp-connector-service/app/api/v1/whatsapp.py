from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud import customer as customer_crud
from app.crud import message as message_crud
from app.crud import user as user_crud
from app.schemas import user as user_schema
from app.schemas.customer import CustomerCreate
from app.schemas.message import MessageCreate
import requests

router = APIRouter()

AI_ORCHESTRATOR_URL = "http://localhost:8010/api/v1/process-messages"

@router.post("/webhook")
async def whatsapp_webhook(request: dict, db: Session = Depends(get_db)):
    # Extract message details from the request
    # This is a simplified example, you'll need to adapt it to the actual WhatsApp webhook payload
    whatsapp_no = request.get("whatsapp_no")
    user_message = request.get("message")

    if not whatsapp_no or not user_message:
        raise HTTPException(status_code=400, detail="Missing whatsapp_no or message")

    # Get or create the user
    user = user_crud.get_user(db, user_id=1)
    if not user:
        user = user_crud.create_user(db, user=user_schema.UserCreate(id=1, name="Test User"))

    # Get or create the customer
    customer = customer_crud.get_customer_by_whatsapp_no(db, whatsapp_no=whatsapp_no)
    if not customer:
        # This is a simplified example, you might need to get the user_id from the request
        # or have a default user_id for new customers
        customer = customer_crud.create_customer(db, customer=CustomerCreate(whatsapp_no=whatsapp_no, user_id=user.id))

    # Create the message
    message = message_crud.create_message(db, message=MessageCreate(customer_id=customer.id, message=user_message))

    # Trigger the AI orchestrator
    try:
        response = requests.post(AI_ORCHESTRATOR_URL)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger AI orchestrator: {e}")

    return {"status": "ok", "message_id": message.id}
