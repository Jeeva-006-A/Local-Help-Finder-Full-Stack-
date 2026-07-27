
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.booking import Booking
from models.worker import Worker
from schemas.booking import BookingCreate, BookingStatusUpdate, BookingCancelRequest
from datetime import datetime
import math
import cloudinary
import cloudinary.uploader
import os
from core.auth import get_current_customer, get_current_worker

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def get_customer_booking_status(status: str):
    if status in ["on_the_way", "service_started"]:
        return "accepted"
    return status

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


@router.post("/")
def create_booking(
    customer_id: int,
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_customer)
):
    if current_user["id"] != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized to create booking for this customer")

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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    update_data = data.model_dump()
    new_status = update_data["status"]
    rejection_reason = None

    if new_status == "rejected":
        rejection_reason = (update_data.get("rejection_reason") or "").strip()
        if not rejection_reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")

    if new_status in ["accepted", "rejected"]:
        if booking.worker_id is not None:
            raise HTTPException(status_code=409, detail="Booking is no longer available")

        worker = db.query(Worker).filter(Worker.id == current_user["id"]).first()
        if not worker or not worker.is_online:
            raise HTTPException(status_code=403, detail="You must be online to update new booking requests")

        booking.worker_id = current_user["id"]

    if new_status == "rejected":
        booking.rejection_reason = rejection_reason
        booking.rejected_at = datetime.utcnow()

    if new_status == "completed":
        price = update_data.get("price")
        if price is None or not math.isfinite(price) or price <= 0:
            raise HTTPException(status_code=400, detail="Service price must be a positive value")
        booking.price = price
        booking.completed_at = datetime.utcnow()

    if new_status == "accepted":
        booking.accepted_at = datetime.utcnow()
    elif new_status == "on_the_way":
        booking.on_the_way_at = datetime.utcnow()
    elif new_status == "service_started":
        booking.started_at = datetime.utcnow()

    booking.status = new_status
    db.commit()
    return {"message": f"Booking {new_status} successfully!"}

@router.put("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    data: BookingCancelRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_customer)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorization: customer can only cancel their own booking
    if booking.customer_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    # Check if booking can be cancelled based on current status
    cancellable_statuses = ["pending", "accepted"]
    if booking.status not in cancellable_statuses:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot cancel booking with status '{booking.status}'. Only pending or accepted bookings can be cancelled."
        )

    # Get cancellation reason from request
    cancellation_reason = data.cancellation_reason.strip()
    if not cancellation_reason:
        raise HTTPException(status_code=400, detail="Cancellation reason is required")

    # Update booking
    booking.status = "cancelled"
    booking.cancellation_reason = cancellation_reason
    booking.cancelled_at = datetime.utcnow()
    db.commit()

    return {"message": "Booking cancelled successfully!"}

@router.get("/customer/{customer_id}")
def customer_bookings(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_customer)
):
    if current_user["id"] != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these bookings")

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
            "status": get_customer_booking_status(b.status),
            "cancellation_reason": b.cancellation_reason,
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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    if current_user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these bookings")

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
            "rejection_reason": b.rejection_reason,
            "price": b.price,
            "customer": {
                "name": b.customer.full_name,
                "phone": b.customer.phone
            } if b.customer else None
        }
        for b in bookings
    ]

