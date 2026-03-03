# This file defines the 'Worker' table structure in the database.
# (Defines the 'Worker' table structure in the database)

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.database import Base

class Worker(Base):
    __tablename__ = "workers" # Table identity in DB

    # Worker attributes (Columns)
    id = Column(Integer, primary_key=True, index=True) # Unique ID
    full_name = Column(String)     # Worker name
    email = Column(String)         # Worker email
    phone = Column(String)         # Contact number
    category = Column(String)      # Job type (e.g. Plumber)
    experience = Column(Integer)   # Years of experience
    address = Column(String)       # Home address
    password = Column(String)      # Login password
    aadhar_photo = Column(String, nullable=True) # Stores photo link from Cloudinary
    status = Column(String, default="pending")   # 'pending' initially, then 'verified' by Admin

    # Relationship: A worker can be connected to many jobs
    bookings = relationship("Booking", back_populates="worker")

