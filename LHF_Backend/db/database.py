import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use environment variable for production, fallback to Supabase URL
DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    # User-provided Supabase Session Pooler URL
    DB_URL = "postgresql://postgres.rrlkbnrbhvrurlnecfqx:Jeeva_2910_A@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# For compatibility with some platforms (like Vercel/Supabase), swap postgres:// to postgresql://
if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DB_URL,
    pool_pre_ping=True,  # Check connection health before using
    pool_recycle=300,    # Refresh connections every 5 minutes
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

