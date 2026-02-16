from db.database import SessionLocal
from models.admin import Admin

def check_admins():
    db = SessionLocal()
    try:
        admins = db.query(Admin).all()
        print(f"Total admins: {len(admins)}")
        for admin in admins:
            print(f"ID: {admin.id}, Username: {admin.username}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admins()
