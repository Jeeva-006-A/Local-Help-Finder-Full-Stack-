# This file defines the data format for Admin functions.
# (Defines data formats for Admin operations)

from pydantic import BaseModel

# 1. Inputs required for Admin login.
class AdminLogin(BaseModel):
    username: str
    password: str

# 2. Schema to update worker verification status (e.g., verified or rejected).
class WorkerStatusUpdate(BaseModel):
    status: str

