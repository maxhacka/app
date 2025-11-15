from database import SessionLocal, init_db
from auth_utils import get_password_hash
import models

def init_test_data():
    init_db()
    db = SessionLocal()
    
    try:
        existing_admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
        if existing_admin:
            return
        
        admin = models.Admin(
            username="admin",
            name="Администратор",
            role="superadmin",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin)
        
        db.commit()
        
    except Exception as e:
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_test_data()

