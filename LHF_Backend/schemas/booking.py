# This file handles the data structure for Booking models.
# (Handles validation for Service Booking data)

from pydantic import BaseModel
from typing import Optional

# 1. Required details to create a new service request.
class BookingCreate(BaseModel):
    service: str # e.g. Plumber
    problem: str # Description of the issue
    date: str
    time: str
    address: str
    phone: str

# 2. Schema to change booking status (e.g., Pending -> Accepted).
class BookingStatusUpdate(BaseModel):
    status: str                 
    worker_id: Optional[int] = None # Worker ID is optional (Required when status is Accepted)

