from sqlalchemy import text
from db.database import engine, Base
from models.worker import Worker
from models.admin import Admin

def migrate():
    print("Checking for missing columns...")
    with engine.connect() as conn:
        # Add aadhar_photo if missing
        try:
            conn.execute(text("ALTER TABLE workers ADD COLUMN aadhar_photo VARCHAR"))
            conn.commit()
            print("Added aadhar_photo column.")
        except Exception as e:
            if "already exists" in str(e):
                print("aadhar_photo column already exists.")
            else:
                print(f"Error adding aadhar_photo: {e}")

        # Add status if missing
        try:
            conn.execute(text("ALTER TABLE workers ADD COLUMN status VARCHAR DEFAULT 'pending'"))
            conn.commit()
            print("Added status column.")
        except Exception as e:
            if "already exists" in str(e):
                print("status column already exists.")
            else:
                print(f"Error adding status: {e}")
                
    # Also ensure Admin table is created
    Base.metadata.create_all(bind=engine)
    print("Migration check complete.")

if __name__ == "__main__":
    migrate()
