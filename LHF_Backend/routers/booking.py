
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.booking import Booking
from schemas.booking import BookingCreate, BookingStatusUpdate
import cloudinary
import cloudinary.uploader
import os

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

cloudinary.config(
    cloud_name="drwxklysw",
    api_key="774271779353514",
    api_secret="FJuEmGfhFcN1yVPSjFpsS3f-0mY",
    secure=True
)


@router.post("/")
def create_booking(
    customer_id: int,
    data: BookingCreate,
    db: Session = Depends(get_db)
):
    booking_data = data.model_dump()

    if data.problem_photo:
        try:
            upload_result = cloudinary.uploader.upload(data.problem_photo, folder="lhf_booking_problems")
            booking_data["problem_photo"] = upload_result["secure_url"]
        except Exception as e:
            raise HTTPException(500, f"Photo upload failed: {str(e)}")

    new_booking = Booking(
        customer_id=customer_id,
        service=booking_data["service"],
        problem=booking_data["problem"],
        date=booking_data["date"],
        time=booking_data["time"],
        address=booking_data["address"],
        phone=booking_data["phone"],
        problem_photo=booking_data.get("problem_photo"),
        status="pending"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {"message": "Booking created successfully!"}

@router.put("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    update_data = data.model_dump()
    booking.status = update_data["status"]

    if update_data["status"] == "accepted":
         if update_data.get("worker_id") is None:
             raise HTTPException(400, "Worker ID required to accept job")

    booking.worker_id = update_data["worker_id"]

    db.commit()
    return {"message": f"Booking {update_data['status']} successfully!"}

@router.get("/customer/{customer_id}")
def customer_bookings(
    customer_id: int,
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(
        Booking.customer_id == customer_id
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
            "worker": {
                "id": b.worker.id,
                "name": b.worker.full_name,
                "phone": b.worker.phone,
                "address": b.worker.address
            } if b.worker else None
        }
        for b in bookings
    ]

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

