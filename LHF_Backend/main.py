from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from routers import customer, worker, booking, contact

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Local Help Finder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

