from sqlalchemy.orm import Session
from app.models.session import Session
from app.schemas.session import SessionCreate
import uuid

def get_session(db: Session, session_id: str):
    return db.query(Session).filter(Session.id == session_id).first()

def create_session(db: Session, session: SessionCreate):
    db_session = Session(id=str(uuid.uuid4()), user_id=session.user_id, user_agent=session.user_agent)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def delete_session(db: Session, session_id: str):
    db_session = db.query(Session).filter(Session.id == session_id).first()
    if db_session:
        db.delete(db_session)
        db.commit()
    return db_session
