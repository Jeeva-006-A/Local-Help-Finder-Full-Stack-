
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from sqlalchemy import func
from datetime import date, datetime, time
from models.worker import Worker
from models.booking import Booking
from schemas.worker import WorkerCreate, WorkerLogin, WorkerUpdate, WorkerAvailabilityUpdate
from core.security import get_password_hash, verify_password, create_access_token
from core.auth import get_current_worker
import cloudinary
import cloudinary.uploader
import os

router = APIRouter(prefix="/workers", tags=["Workers"])

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


@router.post("/register")
def register_worker(data: WorkerCreate, db: Session = Depends(get_db)):
    worker_data = data.model_dump()
    worker_data["password"] = get_password_hash(worker_data["password"])

    if data.aadhar_photo:
        try:
            upload_result = cloudinary.uploader.upload(data.aadhar_photo, folder="lhf_aadhar_cards")
            worker_data["aadhar_photo"] = upload_result["secure_url"]
        except Exception as e:
            raise HTTPException(500, f"Photo upload failed: {str(e)}")

    db.add(Worker(**worker_data))
    db.commit()
    return {"message": "Worker registered successfully!"}

@router.post("/login")
def login_worker(data: WorkerLogin, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.email == data.email).first()

    if not worker or not verify_password(data.password, worker.password):
        raise HTTPException(401, "Invalid email or password")

    if worker.status in ["rejected", "blocked"]:
        raise HTTPException(403, "Your account has been restricted by the admin. Please contact support.")

    access_token = create_access_token(data={"sub": str(worker.id), "role": "worker"})

    return {
        "worker_id": worker.id,
        "name": worker.full_name,
        "category": worker.category,
        "address": worker.address,
        "status": worker.status,
        "access_token": access_token
    }

@router.put("/{worker_id}")
def update_worker_profile(
    worker_id: int,
    data: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    if current_user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this worker profile")

    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    update_data = data.model_dump()
    worker.full_name = update_data["full_name"]
    worker.phone = update_data["phone"]
    worker.address = update_data["address"]

    db.commit()
    db.refresh(worker)
    return {"message": "Profile updated successfully!"}

@router.put("/{worker_id}/availability")
def update_worker_availability(
    worker_id: int,
    data: WorkerAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    if current_user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this worker availability")

    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    worker.is_online = data.is_online
    db.commit()
    db.refresh(worker)

    return {
        "worker_id": worker.id,
        "is_online": worker.is_online,
        "availability": "online" if worker.is_online else "offline"
    }

@router.get("/worker/{worker_id}")
def get_incoming_jobs(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    if current_user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these incoming jobs")

    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    if worker.status != "verified" or not worker.is_online:
        return []

    bookings = db.query(Booking).filter(
        Booking.status == "pending",
        Booking.service == worker.category,
        Booking.worker_id.is_(None)
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
            "status": b.status
        }
        for b in bookings
    ]

@router.get("/{worker_id}")
def get_worker_profile(
    worker_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    if current_user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this worker profile")

    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    return {
        "id": worker.id,
        "full_name": worker.full_name,
        "email": worker.email,
        "phone": worker.phone,
        "address": worker.address,
        "category": worker.category,
        "experience": worker.experience,
        "status": worker.status
    }

@router.get("/{worker_id}/stats")
def get_worker_stats(
    worker_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_worker)
):
    if current_user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these stats")

    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    pending_jobs = 0
    if worker.status == "verified" and worker.is_online:
        pending_jobs = db.query(Booking).filter(
            Booking.status == "pending",
            Booking.service == worker.category,
            Booking.worker_id.is_(None)
        ).count()

    total_jobs = db.query(Booking).filter(
        Booking.worker_id == worker_id
    ).count()

    total_completed = db.query(Booking).filter(
        Booking.worker_id == worker_id,
        Booking.status == "completed"
    ).count()

    accepted_jobs = db.query(Booking).filter(
        Booking.worker_id == worker_id,
        Booking.status.in_(["accepted", "on_the_way", "service_started"])
    ).count()

    today_start = datetime.combine(date.today(), time.min)
    
    today_earnings_query = db.query(func.sum(Booking.price)).filter(
        Booking.worker_id == worker_id,
        Booking.status == "completed",
        Booking.completed_at >= today_start
    ).scalar()
    
    today_earnings = today_earnings_query if today_earnings_query else 0.0

    return {
        "is_online": worker.is_online,
        "total_jobs_completed": total_jobs,
        "pending_requests": pending_jobs,
        "accepted_jobs": accepted_jobs,
        "completed_jobs": total_completed,
        "today_earnings": today_earnings
    }

