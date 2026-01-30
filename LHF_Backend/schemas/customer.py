from pydantic import BaseModel, EmailStr


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address: str
    password: str


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str



class CustomerUpdate(BaseModel):
    full_name: str
    phone: str
    address: str
