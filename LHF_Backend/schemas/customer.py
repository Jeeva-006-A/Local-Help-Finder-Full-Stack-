# This file handles the data format (schemas) for Customer data.
# (Handles validation for Customer data using Pydantic)

from pydantic import BaseModel, EmailStr

# 1. Required data format for signup (New Account).
class CustomerCreate(BaseModel):
    full_name: str # Full name must be a string (Text)
    email: EmailStr # Validates that the email is in the correct format
    phone: str
    address: str
    password: str

# 2. Required details for login.
class CustomerLogin(BaseModel):
    email: str
    password: str

# 3. Schema to change profile details (Update).
class CustomerUpdate(BaseModel):
    full_name: str
    phone: str
    address: str

