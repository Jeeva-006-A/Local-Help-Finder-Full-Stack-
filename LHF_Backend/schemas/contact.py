# This file helps validate 'Contact Us' form data.
# (Defines the structure for Contact Us messages)

from pydantic import BaseModel

# 1. What data is needed from the user when sending a message?
class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str

