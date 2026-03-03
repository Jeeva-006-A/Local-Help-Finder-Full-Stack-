# This is the Main Entry Point of the project (Main starting file).
# This file contains the backend server's working logic.

from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import sys
import os

# --- 1. LOCAL IMPORTS SETUP ---
# This code supports importing files from the project folders.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import Base, engine
from routers import customer, worker, booking, contact, admin
from sqlalchemy import text

# --- 2. STARTUP LOGIC (LIFESPAN) ---
# Define what should happen when the server starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Try to create database tables.
    try:
        # Create tables if they do not exist
        Base.metadata.create_all(bind=engine)
        
        # Migration helper to add missing columns to SQL tables.
        with engine.connect() as conn:
            # Add aadhar_photo column to workers table if it's missing
            try:
                conn.execute(text("ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhar_photo VARCHAR"))
                conn.commit()
            except Exception: pass
            
            # Add status column to workers table if it's missing
            try:
                conn.execute(text("ALTER TABLE workers ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending'"))
                conn.commit()
            except Exception: pass
            
    except Exception as e:
        print(f"Database setup error (DB failed to initialize): {e}")
    yield

# --- 3. APP INITIALIZATION ---
# Start the FastAPI app here.
app = FastAPI(title="Local Help Finder", lifespan=lifespan)

# CORS Middleware: Grant permission for the frontend to access the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Public permission (Allow all)
    allow_credentials=True,
    allow_methods=["*"], # Permission for all methods like GET, POST, etc.
    allow_headers=["*"], 
)

# --- 4. BASIC ROUTES ---

# Health Check: Check if the server is running
@app.get("/api/health")
def health():
    return {"status": "ok", "message": "API is running (Server is running smoothly)"}

# DB Test: Check if there is a database connection
@app.get("/api/db-test")
def db_test():
    try:
        with engine.connect() as conn:
            return {"status": "connected", "detail": "Database is working!"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# Error Handler: Handles and breaks down logic failures
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal Server Error: {str(exc)}",
            "type": type(exc).__name__,
            "traceback": traceback.format_exc() # Breakdown of where the error occurred
        },
    )

# --- 5. CONNECTING ROUTERS ---
# Create separate paths for each feature (Customer, Worker, etc.).

# Option 1: Using /api prefix (Recommended)
api_router = APIRouter(prefix="/api")
api_router.include_router(customer.router)
api_router.include_router(worker.router)
api_router.include_router(booking.router)
api_router.include_router(contact.router)
api_router.include_router(admin.router)

app.include_router(api_router)

# Option 2: No prefix (Simplified call for local testing)
app.include_router(customer.router)
app.include_router(worker.router)
app.include_router(booking.router)
app.include_router(contact.router)
app.include_router(admin.router)
