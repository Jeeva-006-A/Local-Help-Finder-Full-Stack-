# This file handles the Database connection (Handles Database connection).
# It connects the backend to the database using SQLAlchemy.

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. DATABASE URL: Specify where the database is located.
# Use an environment variable in production, otherwise support direct URL.
DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    # Manual Supabase URL (Jeeva's Supabase link)
    DB_URL = "postgresql+psycopg2://postgres.rrlkbnrbhvrurlnecfqx:Jeeva_2910_A@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

# 2. Compatibility check: Format the Postgres connection string.
if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

if "?" not in DB_URL:
    DB_URL += "?sslmode=require"

# 3. ENGINE: Create the engine to actually interface with the database.
engine = create_engine(
    DB_URL,
    pool_pre_ping=True,  # Check connection health before use
    pool_recycle=300,    # Refresh connection every 5 minutes
)

# 4. SESSION: Session maker to perform database commands (CRUD).
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# 5. BASE: Root class to create Models (Tables).
Base = declarative_base()


