from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.admin import Admin
from models.worker import Worker
from schemas.admin import AdminLogin, WorkerStatusUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(
        Admin.username == data.username,
        Admin.password == data.password
    ).first()

    if not admin:
        # If no admin exists at all, we'll allow the first login attempt to create the admin
        # This is a simple way for the user to set their credentials
        if db.query(Admin).count() == 0:
            new_admin = Admin(username=data.username, password=data.password)
            db.add(new_admin)
            db.commit()
            return {"message": "Admin created and logged in", "username": data.username}
        
        raise HTTPException(401, "Invalid admin credentials")

    return {"message": "Login successful", "username": admin.username}

@router.get("/workers/pending")
def get_pending_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).filter(Worker.status == "pending").all()
    return workers

@router.put("/workers/{worker_id}/status")
def update_worker_status(worker_id: int, data: WorkerStatusUpdate, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found")
    
    worker.status = data.status
    db.commit()
    return {"message": f"Worker status updated to {data.status}"}
