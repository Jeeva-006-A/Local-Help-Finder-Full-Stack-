# This file handles booking-related backend logic (Handles Bookings logic).
# It includes logic for customer service requests and worker job acceptance.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.booking import Booking
from schemas.booking import BookingCreate, BookingStatusUpdate
import cloudinary
import cloudinary.uploader
import os

# 1. Create the router
router = APIRouter(prefix="/bookings", tags=["Bookings"])

# 2. Database connection helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 3. Cloudinary Setup: Helps store images in the cloud.
cloudinary.config(
    cloud_name="drwxklysw",
    api_key="774271779353514",
    api_secret="FJuEmGfhFcN1yVPSjFpsS3f-0mY",
    secure=True
)

# --- ROUTES ---

# A. CREATE: Create a new service booking (New Booking)
@router.post("/")
def create_booking(
    customer_id: int,
    data: BookingCreate,
    db: Session = Depends(get_db)
):
    booking_data = data.model_dump()
    
    # If a problem photo is sent (Base64 string), upload it to Cloudinary
    if data.problem_photo:
        try:
            upload_result = cloudinary.uploader.upload(data.problem_photo, folder="lhf_booking_problems")
            booking_data["problem_photo"] = upload_result["secure_url"]
        except Exception as e:
            raise HTTPException(500, f"Photo upload failed: {str(e)}")

    # Convert data sent by the customer to the DB model
    new_booking = Booking(
        customer_id=customer_id,
        service=booking_data["service"],
        problem=booking_data["problem"],
        date=booking_data["date"],
        time=booking_data["time"],
        address=booking_data["address"],
        phone=booking_data["phone"],
        problem_photo=booking_data.get("problem_photo"),
        status="pending" # Default status is always pending at the start
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {"message": "Booking created successfully!"}

# B. UPDATE STATUS: Update booking status (e.g., Pending -> Accepted -> Completed)
@router.put("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db)
):
    # Check if the booking exists for the given ID
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    update_data = data.model_dump()
    booking.status = update_data["status"]

    # Worker ID is required to accept a job
    if update_data["status"] == "accepted":
         if update_data.get("worker_id") is None:
             raise HTTPException(400, "Worker ID required to accept job")
    
    booking.worker_id = update_data["worker_id"]

    db.commit()
    return {"message": f"Booking {update_data['status']} successfully!"}

# C. CUSTOMER BOOKINGS: Fetch all bookings made by a specific customer
@router.get("/customer/{customer_id}")
def customer_bookings(
    customer_id: int,
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(
        Booking.customer_id == customer_id
    ).all()

    # Send the data in list format
    return [
        {
            "booking_id": b.id,
            "service": b.service,
            "problem": b.problem,
            "problem_photo": b.problem_photo,
            "date": b.date,
            "time": b.time,
            "address": b.address,
            "phone": b.phone,
            "status": b.status,
            "worker": {
                "id": b.worker.id,
                "name": b.worker.full_name,
                "phone": b.worker.phone,
                "address": b.worker.address
            } if b.worker else None
        }
        for b in bookings
    ]

# D. WORKER BOOKINGS: Fetch all bookings accepted by a specific worker
@router.get("/worker/{worker_id}")
def worker_bookings(
    worker_id: int,
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(
        Booking.worker_id == worker_id
    ).all()

    return [
        {
            "booking_id": b.id,
            "service": b.service,
            "problem": b.problem,
            "problem_photo": b.problem_photo,
            "date": b.date,
            "time": b.time,
            "address": b.address,
            "phone": b.phone,
            "status": b.status,
            "customer": {
                "name": b.customer.full_name,
                "phone": b.customer.phone
            } if b.customer else None
        }
        for b in bookings
    ]

