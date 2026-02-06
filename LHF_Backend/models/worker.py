from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.database import Base

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String)
    phone = Column(String)
    category = Column(String)
    experience = Column(Integer)
    address = Column(String)
    password = Column(String)
    aadhar_photo = Column(String, nullable=True) # Stores base64 string
    status = Column(String, default="pending") # pending, verified, rejected

    bookings = relationship("Booking", back_populates="worker")
