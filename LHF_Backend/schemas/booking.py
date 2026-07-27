
from pydantic import BaseModel
from typing import Optional

class BookingCreate(BaseModel):
    service: str
    problem: str
    date: str
    time: str
    address: str
    phone: str
    problem_photo: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str
    worker_id: Optional[int] = None
    rejection_reason: Optional[str] = None
    cancellation_reason: Optional[str] = None
    price: Optional[float] = None

class BookingCancelRequest(BaseModel):
    cancellation_reason: str

