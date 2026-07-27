from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("customers.id"))
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)

    service = Column(String)
    problem = Column(String)
    date = Column(String)
    time = Column(String)
    address = Column(String)
    phone = Column(String)
    problem_photo = Column(String, nullable=True)
    status = Column(String, default="pending")
    rejection_reason = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())
    accepted_at = Column(DateTime, nullable=True)
    on_the_way_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(String, nullable=True)

    customer = relationship("Customer", back_populates="bookings")
    worker = relationship("Worker", back_populates="bookings")

