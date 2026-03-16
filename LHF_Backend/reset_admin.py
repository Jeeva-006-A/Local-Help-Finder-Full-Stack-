from db.database import SessionLocal
from models.admin import Admin

def reset_admin():
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == "jeeva1629@gmail.com").first()
        if admin:
            admin.password = "Jeeva_1629_A"
        else:
            old_admin = db.query(Admin).filter(Admin.username == "Jeeva").first()
            if old_admin:
                old_admin.username = "jeeva1629@gmail.com"
                old_admin.password = "Jeeva_1629_A"
            else:
                admin = Admin(username="jeeva1629@gmail.com", password="Jeeva_1629_A")
                db.add(admin)
        db.commit()
        print("Admin user 'jeeva1629@gmail.com' password set to 'Jeeva_1629_A'")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
