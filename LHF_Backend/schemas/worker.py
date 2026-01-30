from pydantic import BaseModel

class WorkerCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    category: str
    experience: int
    address: str
    password: str

class WorkerLogin(BaseModel):
    email: str
    password: str

class WorkerUpdate(BaseModel):
    full_name: str
    phone: str
    address: str