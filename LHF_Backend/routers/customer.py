from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerLogin, CustomerUpdate
from core.security import get_password_hash, verify_password, create_access_token
from core.auth import get_current_customer

router = APIRouter(prefix="/customers", tags=["Customers"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.post("/register")
def register_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    user_data = data.model_dump()
    user_data["password"] = get_password_hash(user_data["password"])
    new_user = Customer(**user_data)
    db.add(new_user)
    db.commit()

    return {"message": "Customer registered successfully!"}
@router.post("/login")
def login_customer(data: CustomerLogin, db: Session = Depends(get_db)):
    user = db.query(Customer).filter(Customer.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": "customer"})
    
    return {
        "customer_id": user.id,
        "name": user.full_name,
        "access_token": access_token
    }
@router.put("/{customer_id}")
def update_customer_profile(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_customer)
):
    if current_user["id"] != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this customer profile")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    update_data = data.model_dump()
    customer.full_name = update_data["full_name"]
    customer.phone = update_data["phone"]
    customer.address = update_data["address"]
    db.commit()
    db.refresh(customer)

    return {"message": "Profile updated successfully!"}
@router.get("/{customer_id}")
def get_customer_profile(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_customer)
):
    if current_user["id"] != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this customer profile")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address
    }



