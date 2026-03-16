# This is the main file that starts your backend server
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import sys
import os

# Tell Python where to find our project folders
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import Base, engine
from routers import customer, worker, booking, contact, admin
from sqlalchemy import text

# This part runs when the server starts up
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create all database tables automatically
        Base.metadata.create_all(bind=engine)
        
        # Add new columns to tables if they are missing
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhar_photo VARCHAR"))
                conn.commit()
            except Exception: pass
            
            try:
                conn.execute(text("ALTER TABLE workers ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending'"))
                conn.commit()
            except Exception: pass

            try:
                conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_photo VARCHAR"))
                conn.commit()
            except Exception: pass
            
    except Exception as e:
        print(f"Database error: {e}")
    yield

# Create the FastAPI app
app = FastAPI(title="Local Help Finder", lifespan=lifespan)

# Allow the frontend website to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

# Check if the server is running
@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Server is running smoothly"}

# Check if the database is connected
@app.get("/api/db-test")
def db_test():
    try:
        with engine.connect() as conn:
            return {"status": "connected", "detail": "Database is working!"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# Handle errors if something goes wrong
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Error: {str(exc)}",
            "type": type(exc).__name__,
            "traceback": traceback.format_exc()
        },
    )

# Connect all our different route files (Customer, Worker, etc.)
api_router = APIRouter(prefix="/api")
api_router.include_router(customer.router)
api_router.include_router(worker.router)
api_router.include_router(booking.router)
api_router.include_router(contact.router)
api_router.include_router(admin.router)

app.include_router(api_router)

# Also allow direct access without /api for testing
app.include_router(customer.router)
app.include_router(worker.router)
app.include_router(booking.router)
app.include_router(contact.router)
app.include_router(admin.router)

