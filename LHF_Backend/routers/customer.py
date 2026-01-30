from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerLogin,CustomerUpdate

router = APIRouter(prefix="/customers", tags=["Customers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    db.add(Customer(**data.model_dump()))
    db.commit()
    return {"message": "Customer registered"}


@router.post("/login")
def login_customer(data: CustomerLogin, db: Session = Depends(get_db)):
    user = db.query(Customer).filter(
        Customer.email == data.email,
        Customer.password == data.password
    ).first()

    if not user:
        raise HTTPException(401, "Invalid email or password")

    return {"customer_id": user.id, "name": user.full_name}

@router.put("/{customer_id}")
def update_customer_profile(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = data.model_dump()

    customer.full_name = update_data["full_name"]
    customer.phone = update_data["phone"]
    customer.address = update_data["address"]

    db.commit()
    db.refresh(customer)

    return {"message": "Customer profile updated successfully"}

@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(404, "Customer not found")

    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address
    }
