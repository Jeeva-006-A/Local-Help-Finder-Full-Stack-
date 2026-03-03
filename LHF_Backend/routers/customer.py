# This file handles customer-related backend logic (Handles Customer backend logic).
# It's simplified for beginner understanding.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerLogin, CustomerUpdate

# 1. Create a router to group customer links
# It handles all requests starting with /api/customers.
router = APIRouter(prefix="/customers", tags=["Customers"])

# 2. Database connection function (Logic to connect to the DB)
# Helps open the database for each request and closes it once finished.
def get_db():
    db = SessionLocal() # Open the DB
    try:
        yield db # Provide the connection to the route function
    finally:
        db.close() # Close the connection after logic is complete

# --- ROUTES (API Endpoints) ---

# A. REGISTER: Save a new customer (Register a new customer)
@router.post("/register")
def register_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    # Convert incoming data to a Customer object
    new_user = Customer(**data.model_dump())
    
    db.add(new_user) # Add to session
    db.commit()      # Save permanently to the database
    
    return {"message": "Customer registered successfully!"}

# B. LOGIN: Check Email & Password (Check login credentials)
@router.post("/login")
def login_customer(data: CustomerLogin, db: Session = Depends(get_db)):
    # Check if the email & password exist in the database
    user = db.query(Customer).filter(
        Customer.email == data.email,
        Customer.password == data.password
    ).first()

    # Throw an error if user is not found
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password"
        )

    # Success-na user details return panu
    return {
        "customer_id": user.id, 
        "name": user.full_name
    }

# C. UPDATE: Change profile details (Update customer profile)
@router.put("/{customer_id}")
def update_customer_profile(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    # First, check if a user exists with the given ID
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Update the data
    update_data = data.model_dump()
    customer.full_name = update_data["full_name"]
    customer.phone = update_data["phone"]
    customer.address = update_data["address"]

    db.commit()      # Save changes
    db.refresh(customer) # Fetch updated data

    return {"message": "Profile updated successfully!"}

# D. GET: Fetch details of a single customer (Fetch one customer)
@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    # Search for user by ID
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Send details in JSON format
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address
    }


