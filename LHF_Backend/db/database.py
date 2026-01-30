from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_USERNAME = "postgres"
DB_PASSWORD = "AcademyRootPassword"
DB_HOSTNAME = "localhost" 
DATABASE = "LHF_db"
DB_PORT = "5432"

DB_URL = f"postgresql+psycopg2://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOSTNAME}:{DB_PORT}/{DATABASE}"

engine = create_engine(DB_URL)

SessionLocal = sessionmaker(bind=engine,autoflush=False,autocommit=False)

Base = declarative_base()