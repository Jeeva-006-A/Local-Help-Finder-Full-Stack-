import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use environment variable for production (e.g. Vercel Postgres), fallback to local for dev
DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    DB_USERNAME = "postgres"
    DB_PASSWORD = "AcademyRootPassword"
    DB_HOSTNAME = "localhost" 
    DATABASE = "LHF_db"
    DB_PORT = "5432"
    DB_URL = f"postgresql+psycopg2://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOSTNAME}:{DB_PORT}/{DATABASE}"

# For neon/vercel postgres, we might need to swap postgres:// to postgresql://
if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DB_URL)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()
