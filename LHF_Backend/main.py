from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import sys
import os

# Import routers from the local directory
# We add the current directory to sys.path to ensure absolute imports work on Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import Base, engine
from routers import customer, worker, booking, contact

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup safely
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database initialization error: {e}")
    yield

app = FastAPI(title="Local Help Finder", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "API is running"}

@app.get("/api/db-test")
def db_test():
    try:
        with engine.connect() as conn:
            return {"status": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# Debug Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal Server Error: {str(exc)}",
            "type": type(exc).__name__,
            "traceback": traceback.format_exc()
        },
    )

# Create a main API router with prefix /api
api_router = APIRouter(prefix="/api")
api_router.include_router(customer.router)
api_router.include_router(worker.router)
api_router.include_router(booking.router)
api_router.include_router(contact.router)

app.include_router(api_router)

# Primary app entry point for Vercel
# (Optional: include routers without prefix if needed locally)
app.include_router(customer.router)
app.include_router(worker.router)
app.include_router(booking.router)
app.include_router(contact.router)



