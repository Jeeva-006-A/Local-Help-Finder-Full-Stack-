
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.admin import Admin
from models.worker import Worker
from schemas.admin import AdminLogin, WorkerStatusUpdate
from core.security import get_password_hash, verify_password, create_access_token
from core.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == data.username).first()

    if not admin:
        if db.query(Admin).count() == 0:
            new_admin = Admin(username=data.username, password=get_password_hash(data.password))
            db.add(new_admin)
            db.commit()
            access_token = create_access_token(data={"sub": str(new_admin.id), "role": "admin"})
            return {"message": "Admin account created and logged in!", "username": data.username, "access_token": access_token}

        raise HTTPException(401, "Invalid admin credentials (Incorrect username or password)")

    if not verify_password(data.password, admin.password):
        raise HTTPException(401, "Invalid admin credentials (Incorrect username or password)")

    access_token = create_access_token(data={"sub": str(admin.id), "role": "admin"})
    return {"message": "Admin login successful!", "username": admin.username, "access_token": access_token}

@router.get("/workers/all")
def get_all_workers(db: Session = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    workers = db.query(Worker).all()
    return workers

@router.put("/workers/{worker_id}/status")
def update_worker_status(
    worker_id: int, 
    data: WorkerStatusUpdate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found (Incorrect Worker ID)")

    worker.status = data.status
    db.commit()
    return {"message": f"Worker status updated to {data.status} successfully!"}

@router.delete("/workers/{worker_id}")
def delete_worker(
    worker_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    db.delete(worker)
    db.commit()
    return {"message": "Worker deleted successfully!"}

