# This file handles the data format (schemas) for Worker data.
# (Handles validation for Worker data using Pydantic)

from pydantic import BaseModel

# 1. Required data format to create a new Worker account.
class WorkerCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    category: str
    experience: int # Experience value must be a Number (Integer)
    address: str
    password: str
    aadhar_photo: str | None = None # Image optional (Initial case)

# 2. Schema to check Worker Login.
class WorkerLogin(BaseModel):
    email: str
    password: str

# 3. Schema to change worker profile values.
class WorkerUpdate(BaseModel):
    full_name: str
    phone: str
    address: str
