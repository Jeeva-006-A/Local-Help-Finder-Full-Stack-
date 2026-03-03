# This file defines the 'Customer' table in the database.
# (Defines how the 'Customer' table looks in the database)

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.database import Base

class Customer(Base):
    __tablename__ = "customers" # Table name in DB

    # Table columns (Fields)
    id = Column(Integer, primary_key=True, index=True) # Unique ID for each customer
    full_name = Column(String, nullable=False)        # Customer full name
    email = Column(String, unique=True, index=True, nullable=False) # Unique email
    phone = Column(String, nullable=False)            # Contact number
    address = Column(String, nullable=False)          # Home address
    password = Column(String, nullable=False)         # Secret password

    # Relationship: A customer can have many bookings
    bookings = relationship("Booking", back_populates="customer")

