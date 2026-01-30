from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from routers import customer, worker, booking, contact

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Local Help Finder ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

app.include_router(customer.router)
app.include_router(worker.router)
app.include_router(booking.router)
app.include_router(contact.router)
