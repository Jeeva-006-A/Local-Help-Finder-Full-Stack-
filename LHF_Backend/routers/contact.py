
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.contact import ContactMessage
from schemas.contact import ContactCreate

router = APIRouter(prefix="/contact", tags=["Contact"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def send_message(data: ContactCreate, db: Session = Depends(get_db)):
    new_message = ContactMessage(**data.model_dump())
    db.add(new_message)
    db.commit()

    return {"message": "Message successfully saved! We will respond soon."}

