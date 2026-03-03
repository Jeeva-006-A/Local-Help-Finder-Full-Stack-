# This file defines the 'Booking' (Service requests) table in the database.
# (Defines the 'Booking' table for service requests in the database)

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class Booking(Base):
    __tablename__ = "bookings" # Table identity in DB

    id = Column(Integer, primary_key=True, index=True) # Unique Booking ID

    # Foreign Keys: This tells us which customer and worker this booking is connected to.
    customer_id = Column(Integer, ForeignKey("customers.id"))
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True) # Initially None

    # Service details
    service = Column(String)  # Type of service (e.g. Electrician)
    problem = Column(String)  # Short description of the issue
    date = Column(String)     # Booking date (e.g. 2024-03-03)
    time = Column(String)     # Booking time (e.g. 10:00 AM)
    address = Column(String)  # Service location address
    phone = Column(String)    # Customer/Worker contact phone
    status = Column(String, default="pending") # Status: pending, accepted, completed

    # Relationships: To link the DB models
    customer = relationship("Customer", back_populates="bookings")
    worker = relationship("Worker", back_populates="bookings")

