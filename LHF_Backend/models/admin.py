# This file defines the 'Admin' credentials table structure in the database.
# (Defines the database table structure for 'Admin' credentials)

from sqlalchemy import Column, Integer, String
from db.database import Base

class Admin(Base):
    __tablename__ = "admins" # Admin table identity in DB

    # Columns: Admin details
    id = Column(Integer, primary_key=True, index=True) # Unique ID
    username = Column(String, unique=True, index=True)   # Admin sign-in name
    password = Column(String)                         # Admin secret password

