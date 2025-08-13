from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate

def get_customer_by_whatsapp_no(db: Session, whatsapp_no: str):
    return db.query(Customer).filter(Customer.whatsapp_no == whatsapp_no).first()

def create_customer(db: Session, customer: CustomerCreate):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer
