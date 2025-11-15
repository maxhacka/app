from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
import models
import schemas

def get_admin_by_username(db: Session, username: str) -> Optional[models.Admin]:
    return db.query(models.Admin).filter(models.Admin.username == username).first()

def get_admin_by_id(db: Session, admin_id: int) -> Optional[models.Admin]:
    return db.query(models.Admin).filter(models.Admin.id == admin_id).first()

def get_admins(db: Session, skip: int = 0, limit: int = 100) -> List[models.Admin]:
    return db.query(models.Admin).offset(skip).limit(limit).all()

def create_admin(db: Session, admin: schemas.AdminCreate, hashed_password: str) -> models.Admin:
    db_admin = models.Admin(
        username=admin.username,
        name=admin.name,
        role=admin.role,
        hashed_password=hashed_password
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

def update_admin(
    db: Session, admin_id: int, admin: schemas.AdminUpdate, hashed_password: Optional[str] = None
) -> Optional[models.Admin]:
    db_admin = get_admin_by_id(db, admin_id)
    if not db_admin:
        return None
    
    update_data = admin.model_dump(exclude_unset=True, exclude={"password"})
    for key, value in update_data.items():
        setattr(db_admin, key, value)
    
    if hashed_password:
        db_admin.hashed_password = hashed_password
    
    db_admin.updated_at = datetime.now()
    db.commit()
    db.refresh(db_admin)
    return db_admin

def delete_admin(db: Session, admin_id: int) -> bool:
    db_admin = get_admin_by_id(db, admin_id)
    if not db_admin:
        return False
    db.delete(db_admin)
    db.commit()
    return True

def create_session(db: Session, session: schemas.SessionCreate) -> models.Session:
    db_session = models.Session(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_session_by_token(db: Session, token: str) -> Optional[models.Session]:
    return db.query(models.Session).filter(models.Session.token == token).first()

def delete_session(db: Session, token: str) -> bool:
    db_session = get_session_by_token(db, token)
    if not db_session:
        return False
    db.delete(db_session)
    db.commit()
    return True

def delete_expired_sessions(db: Session) -> int:
    now = datetime.now()
    count = db.query(models.Session).filter(models.Session.expires_at < now).delete()
    db.commit()
    return count

