"""
Phase 3A Migration: Booking Cancellation

Adds support for customer booking cancellation:
- cancelled_at: Timestamp when booking was cancelled
- cancellation_reason: String reason for cancellation

Run this migration before deploying Phase 3A:
    python migrate_phase3.py
"""

from sqlalchemy import text
from db.database import engine


def migrate_up():
    """Apply Phase 3A migration"""
    print("Applying Phase 3A migration...")

    try:
        with engine.connect() as conn:

            # Add cancelled_at column
            print("  Adding cancelled_at column...")
            conn.execute(text("""
                ALTER TABLE bookings
                ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
            """))

            # Add cancellation_reason column
            print("  Adding cancellation_reason column...")
            conn.execute(text("""
                ALTER TABLE bookings
                ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR;
            """))

            conn.commit()

        print("✓ Phase 3A migration completed successfully!")
        return True

    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        return False


def migrate_down():
    """Rollback Phase 3A migration"""

    print("Rolling back Phase 3A migration...")

    try:
        with engine.connect() as conn:

            print("  Removing cancellation_reason column...")
            conn.execute(text("""
                ALTER TABLE bookings
                DROP COLUMN IF EXISTS cancellation_reason;
            """))

            print("  Removing cancelled_at column...")
            conn.execute(text("""
                ALTER TABLE bookings
                DROP COLUMN IF EXISTS cancelled_at;
            """))

            conn.commit()

        print("✓ Phase 3A migration rolled back successfully!")
        return True

    except Exception as e:
        print(f"✗ Rollback failed: {str(e)}")
        return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1].lower() == "rollback":
        migrate_down()
    else:
        migrate_up()