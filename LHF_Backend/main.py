from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from routers import customer, worker, booking, contact
import traceback

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Local Help Finder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}", "traceback": traceback.format_exc()},
    )

# Create a main API router with prefix /api
api_router = APIRouter(prefix="/api")
api_router.include_router(customer.router)
api_router.include_router(worker.router)
api_router.include_router(booking.router)
api_router.include_router(contact.router)

app.include_router(api_router)

# Also include them without prefix for local development flexibility
app.include_router(customer.router)
app.include_router(worker.router)
app.include_router(booking.router)
app.include_router(contact.router)


