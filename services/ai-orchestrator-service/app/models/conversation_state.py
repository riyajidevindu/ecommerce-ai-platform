from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from ..db.base import Base


class ConversationState(Base):
    __tablename__ = "conversation_state"

    # One row per customer
    customer_id = Column(Integer, ForeignKey("customers.id"), primary_key=True, index=True)
    last_product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    __table_args__ = (
        UniqueConstraint("customer_id", name="uq_conversation_state_customer"),
    )
