# This file handles Admin operations (Login, Worker status).
# (Handles Admin features like login and managing workers)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.admin import Admin
from models.worker import Worker
from schemas.admin import AdminLogin, WorkerStatusUpdate

# 1. Create the Admin Router
router = APIRouter(prefix="/admin", tags=["Admin"])

# 2. Database session helper function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ROUTES ---

# A. LOGIN: Admin login logic
@router.post("/login")
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    # Check if the username and password exist in the database
    admin = db.query(Admin).filter(
        Admin.username == data.username,
        Admin.password == data.password
    ).first()

    if not admin:
        # Simple Logic: If no admin exists in the database, create one with the login credentials
        if db.query(Admin).count() == 0:
            new_admin = Admin(username=data.username, password=data.password)
            db.add(new_admin)
            db.commit()
            return {"message": "Admin account created and logged in!", "username": data.username}
        
        # Error if admin account exists but credentials are incorrect
        raise HTTPException(401, "Invalid admin credentials (Incorrect username or password)")

    return {"message": "Admin login successful!", "username": admin.username}

# B. GET ALL WORKERS: Fetch details for all workers (for Admin dashboard)
@router.get("/workers/all")
def get_all_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all() # Fetch details for all workers from the database
    return workers

# C. UPDATE WORKER STATUS: Logic for admin to verify a worker
@router.put("/workers/{worker_id}/status")
def update_worker_status(worker_id: int, data: WorkerStatusUpdate, db: Session = Depends(get_db)):
    # Find the worker by ID
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found (Incorrect Worker ID)")
    
    # Update status (e.g., 'pending' -> 'verified')
    worker.status = data.status
    db.commit() # Save permanently to the database
    return {"message": f"Worker status updated to {data.status} successfully!"}

