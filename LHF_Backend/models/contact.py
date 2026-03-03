# This file defines the database table for 'Contact Us' page messages.
# (Defines the database table structure for messages sent from the 'Contact Us' page)

from sqlalchemy import Column, Integer, String, Text
from db.database import Base

class ContactMessage(Base):
    __tablename__ = "contact_messages" # Table name in database

    # Columns: What data should be stored?
    id = Column(Integer, primary_key=True) # Unique ID for each message
    name = Column(String)    # Name of the person who sent the message
    email = Column(String)   # Contact email
    phone = Column(String)   # Contact person phone number
    subject = Column(String) # Meeting/Service request subejct
    message = Column(Text)   # Full details of the message

