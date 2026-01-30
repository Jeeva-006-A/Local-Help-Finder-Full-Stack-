from sqlalchemy import Column, Integer, String,Text
from db.database import Base

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    subject = Column(String)
    message = Column(Text)
