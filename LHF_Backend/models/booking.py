from sqlalchemy import Column, Integer, String, Date, ForeignKey
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

    status = Column(String, default="pending")

    customer = relationship("Customer", back_populates="bookings")
    worker = relationship("Worker", back_populates="bookings")
