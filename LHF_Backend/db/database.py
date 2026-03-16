
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    DB_URL = "postgresql+psycopg2://postgres.rrlkbnrbhvrurlnecfqx:Jeeva_2910_A@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

if "?" not in DB_URL:
    DB_URL += "?sslmode=require"

engine = create_engine(
    DB_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


