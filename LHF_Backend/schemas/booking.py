from pydantic import BaseModel
from typing import Optional

class BookingCreate(BaseModel):
    service: str
    problem: str
    date: str
    time: str
    address: str
    phone: str


class BookingStatusUpdate(BaseModel):
    status: str                 
    worker_id: Optional[int] = None
