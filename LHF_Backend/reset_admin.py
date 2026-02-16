from db.database import SessionLocal
from models.admin import Admin

def reset_admin():
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == "Jeeva").first()
        if admin:
            admin.password = "Jeeva_1629"
        else:
            admin = Admin(username="Jeeva", password="Jeeva_1629")
            db.add(admin)
        db.commit()
        print("Admin user 'Jeeva' password set to 'Jeeva_1629'")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
