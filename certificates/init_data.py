from datetime import datetime
from database import SessionLocal, init_db
import models
import random

def init_test_data():
    db = SessionLocal()
    
    try:
        existing_type = db.query(models.CertificateType).filter(models.CertificateType.name == "Справка об обучении").first()
        if not existing_type:
            cert_type1 = models.CertificateType(
                name="Справка об обучении",
                description="Справка, подтверждающая факт обучения в ВУЗе.",
                price=0.0,
                processing_days=3
            )
            cert_type2 = models.CertificateType(
                name="Справка об успеваемости",
                description="Справка с оценками за период обучения.",
                price=100.0,
                processing_days=5
            )
            db.add_all([cert_type1, cert_type2])

        if db.query(models.Certificate).count() == 0:
            certificates_to_add = []
            
            student_user_ids = list(range(1001, 1031))  # Assuming max_user_id for students from 1001 to 1030
            certificate_types = ["Справка об обучении", "Справка об успеваемости"]
            statuses = ["processing", "ready", "issued"]
            
            for _ in range(6): # Add 6 certificates
                user_id = random.choice(student_user_ids)
                cert_type = random.choice(certificate_types)
                status = random.choice(statuses)
                
                certificates_to_add.append(models.Certificate(
                    max_user_id=user_id,
                    user_type="student",
                    certificate_type=cert_type,
                    purpose="Для предоставления по месту требования",
                    status=status,
                    delivery_method="pickup",
                    price=0.0,
                ))
            db.add_all(certificates_to_add)

        db.commit()
        print("Test data initialized successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error initializing test data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    init_test_data()
