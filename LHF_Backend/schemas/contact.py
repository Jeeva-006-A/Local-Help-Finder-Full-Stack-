from pydantic import BaseModel

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str
