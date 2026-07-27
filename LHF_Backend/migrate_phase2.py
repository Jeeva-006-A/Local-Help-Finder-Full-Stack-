from sqlalchemy import text
from db.database import engine

def migrate():
    queries = [
        "ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price FLOAT",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS on_the_way_at TIMESTAMP",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS started_at TIMESTAMP",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP"
    ]

    with engine.begin() as conn:
        for q in queries:
            try:
                conn.execute(text(q))
                print(f"Executed: {q}")
            except Exception as e:
                print(f"Error on {q}: {e}")

if __name__ == "__main__":
    migrate()
