from sqlalchemy.orm import Session
from ..models.conversation_state import ConversationState


def get_state(db: Session, customer_id: int) -> ConversationState | None:
    return db.query(ConversationState).filter(ConversationState.customer_id == customer_id).first()


def set_last_product(db: Session, customer_id: int, product_id: int | None) -> ConversationState:
    state = get_state(db, customer_id)
    if state is None:
        state = ConversationState(customer_id=customer_id, last_product_id=product_id)
        db.add(state)
    else:
        state.last_product_id = product_id
    db.commit()
    db.refresh(state)
    return state
