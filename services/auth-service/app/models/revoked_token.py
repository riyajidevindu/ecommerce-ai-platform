from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.user import Base

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    jti = Column(String, primary_key=True, index=True)
    exp = Column(DateTime(timezone=True), nullable=False)
