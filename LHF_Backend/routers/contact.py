# This file handles storing contact messages in the backend.
# (Handles saving contact messages to the database)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.contact import ContactMessage
from schemas.contact import ContactCreate

# 1. Create the Contact Router
router = APIRouter(prefix="/contact", tags=["Contact"])

# 2. Database session connection helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ROUTES ---

# A. SEND MESSAGE: Save the message sent by the customer into the DB
@router.post("/")
def send_message(data: ContactCreate, db: Session = Depends(get_db)):
    # Convert data to DB model format and save
    new_message = ContactMessage(**data.model_dump())
    db.add(new_message)
    db.commit() # Save permanently to the database
    
    return {"message": "Message successfully saved! We will respond soon."}

