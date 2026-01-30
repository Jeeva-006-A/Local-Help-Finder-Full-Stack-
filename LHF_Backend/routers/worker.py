from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.worker import Worker
from models.booking import Booking
from schemas.worker import WorkerCreate, WorkerLogin ,WorkerUpdate

router = APIRouter(prefix="/workers", tags=["Workers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register_worker(data: WorkerCreate, db: Session = Depends(get_db)):
    db.add(Worker(**data.dict()))
    db.commit()
    return {"message": "Worker registered"}

@router.post("/login")
def login_worker(data: WorkerLogin, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(
        Worker.email == data.email,
        Worker.password == data.password
    ).first()

    if not worker:
        raise HTTPException(401, "Invalid email or password")

    return {
        "worker_id": worker.id,
        "name": worker.full_name,
        "category": worker.category,
        "address": worker.address
    }
@router.put("/{worker_id}")
def update_worker_profile(
    worker_id: int,
    data: WorkerUpdate,
    db: Session = Depends(get_db)
):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    update_data = data.model_dump()  

    worker.full_name = update_data["full_name"]
    worker.phone = update_data["phone"]
    worker.address = update_data["address"]

    db.commit()
    db.refresh(worker)

    return {"message": "Worker profile updated successfully"}

@router.get("/worker/{worker_id}")
def get_incoming_jobs(worker_id: int, db: Session = Depends(get_db)):

    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

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
            "date": b.date,
            "time": b.time,
            "address": b.address,
            "phone": b.phone,
            "status": b.status
        }
        for b in bookings
    ]


@router.get("/{worker_id}")
def get_worker_profile(worker_id: int, db: Session = Depends(get_db)):
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
        "experience": worker.experience
    }
