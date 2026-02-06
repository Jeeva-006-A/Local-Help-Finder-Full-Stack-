from pydantic import BaseModel

class AdminLogin(BaseModel):
    username: str
    password: str

class WorkerStatusUpdate(BaseModel):
    status: str # verified or rejected
