from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerLogin, CustomerUpdate

# This router handles all Customer related requests (like /customers/register)
router = APIRouter(prefix="/customers", tags=["Customers"])

# Helper function to get the database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# This route saves a new Customer to the database
@router.post("/register")
def register_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    # Create a new Customer entry
    new_user = Customer(**data.model_dump())
    
    # Save it to the database
    db.add(new_user)
    db.commit()
    
    return {"message": "Customer registered successfully!"}

# This route checks if email and password are correct for login
@router.post("/login")
def login_customer(data: CustomerLogin, db: Session = Depends(get_db)):
    # Look for a user with the matching email and password
    user = db.query(Customer).filter(
        Customer.email == data.email,
        Customer.password == data.password
    ).first()

    # If no user is found, send an error
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password"
        )

    # If user is found, send back their ID and name
    return {
        "customer_id": user.id, 
        "name": user.full_name
    }

# This route updates the customer's profile info
@router.put("/{customer_id}")
def update_customer_profile(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    # Find the customer by their ID
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Change the values to the new ones
    update_data = data.model_dump()
    customer.full_name = update_data["full_name"]
    customer.phone = update_data["phone"]
    customer.address = update_data["address"]

    # Save the changes
    db.commit()
    db.refresh(customer)

    return {"message": "Profile updated successfully!"}

# This route gets a single customer's details
@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
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



