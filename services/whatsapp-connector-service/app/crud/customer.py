from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate

def get_customer_by_whatsapp_no(db: Session, whatsapp_no: str):
    return db.query(Customer).filter(Customer.whatsapp_no == whatsapp_no).first()

def get_customer_by_whatsapp_no_for_user(db: Session, user_id: int, whatsapp_no: str):
    """Fetch a customer by number scoped to a specific user.

    This prevents cross-user collisions when the same customer number chats with multiple users.
    """
    return (
        db.query(Customer)
        .filter(Customer.user_id == user_id, Customer.whatsapp_no == whatsapp_no)
        .first()
    )

def create_customer(db: Session, customer: CustomerCreate):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_connected_numbers_for_user(db: Session, user_id: int) -> list[str]:
    rows = db.query(Customer.whatsapp_no).filter(Customer.user_id == user_id, Customer.whatsapp_no.isnot(None)).all()
    # rows is list of tuples like [("+123",), ("+456",)]
    # Return unique numbers preserving order of first appearance
    seen = set()
    result = []
    for (num,) in rows:
        if num and num not in seen:
            seen.add(num)
            result.append(num)
    return result
