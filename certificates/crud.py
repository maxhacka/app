from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas

def get_certificate_by_id(db: Session, certificate_id: int) -> Optional[models.Certificate]:
    return db.query(models.Certificate).filter(models.Certificate.id == certificate_id).first()

def get_certificates(
    db: Session,
    max_user_id: Optional[int] = None,
    certificate_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Certificate]:
    query = db.query(models.Certificate)
    
    if max_user_id:
        query = query.filter(models.Certificate.max_user_id == max_user_id)
    if certificate_type:
        query = query.filter(models.Certificate.certificate_type == certificate_type)
    if status:
        query = query.filter(models.Certificate.status == status)
    
    return query.order_by(models.Certificate.request_date.desc()).offset(skip).limit(limit).all()

def create_certificate(db: Session, certificate: schemas.CertificateCreate) -> models.Certificate:
    cert_type = db.query(models.CertificateType).filter(
        models.CertificateType.name == certificate.certificate_type
    ).first()
    
    price = cert_type.price if cert_type else 0.0
    
    db_certificate = models.Certificate(
        **certificate.model_dump(),
        price=price
    )
    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)
    return db_certificate

def update_certificate(
    db: Session, certificate_id: int, certificate: schemas.CertificateUpdate
) -> Optional[models.Certificate]:
    db_certificate = get_certificate_by_id(db, certificate_id)
    if not db_certificate:
        return None
    
    update_data = certificate.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_certificate, key, value)
    
    db_certificate.updated_at = datetime.now()
    db.commit()
    db.refresh(db_certificate)
    return db_certificate

def delete_certificate(db: Session, certificate_id: int) -> bool:
    db_certificate = get_certificate_by_id(db, certificate_id)
    if not db_certificate:
        return False
    db.delete(db_certificate)
    db.commit()
    return True

def get_certificate_type_by_id(db: Session, cert_type_id: int) -> Optional[models.CertificateType]:
    return db.query(models.CertificateType).filter(models.CertificateType.id == cert_type_id).first()

def get_certificate_types(
    db: Session,
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.CertificateType]:
    query = db.query(models.CertificateType)
    
    if is_active is not None:
        query = query.filter(models.CertificateType.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def create_certificate_type(db: Session, cert_type: schemas.CertificateTypeCreate) -> models.CertificateType:
    db_cert_type = models.CertificateType(**cert_type.model_dump())
    db.add(db_cert_type)
    db.commit()
    db.refresh(db_cert_type)
    return db_cert_type

def update_certificate_type(
    db: Session, cert_type_id: int, cert_type: schemas.CertificateTypeUpdate
) -> Optional[models.CertificateType]:
    db_cert_type = get_certificate_type_by_id(db, cert_type_id)
    if not db_cert_type:
        return None
    
    update_data = cert_type.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cert_type, key, value)
    
    db.commit()
    db.refresh(db_cert_type)
    return db_cert_type

def delete_certificate_type(db: Session, cert_type_id: int) -> bool:
    db_cert_type = get_certificate_type_by_id(db, cert_type_id)
    if not db_cert_type:
        return False
    db.delete(db_cert_type)
    db.commit()
    return True

def get_certificate_statistics(db: Session) -> schemas.CertificateStatistics:
    total_certificates = db.query(func.count(models.Certificate.id)).scalar() or 0
    
    pending_certificates = db.query(func.count(models.Certificate.id)).filter(
        models.Certificate.status == "pending"
    ).scalar() or 0
    
    processing_certificates = db.query(func.count(models.Certificate.id)).filter(
        models.Certificate.status == "processing"
    ).scalar() or 0
    
    ready_certificates = db.query(func.count(models.Certificate.id)).filter(
        models.Certificate.status == "ready"
    ).scalar() or 0
    
    issued_certificates = db.query(func.count(models.Certificate.id)).filter(
        models.Certificate.status == "issued"
    ).scalar() or 0
    
    cancelled_certificates = db.query(func.count(models.Certificate.id)).filter(
        models.Certificate.status == "cancelled"
    ).scalar() or 0
    
    certificates_by_type = {}
    type_data = db.query(
        models.Certificate.certificate_type, func.count(models.Certificate.id)
    ).group_by(models.Certificate.certificate_type).all()
    for cert_type, count in type_data:
        if cert_type:
            certificates_by_type[cert_type] = count
    
    total_revenue = 0.0
    
    return schemas.CertificateStatistics(
        total_certificates=total_certificates,
        pending_certificates=pending_certificates,
        processing_certificates=processing_certificates,
        ready_certificates=ready_certificates,
        issued_certificates=issued_certificates,
        cancelled_certificates=cancelled_certificates,
        certificates_by_type=certificates_by_type,
        total_revenue=total_revenue
    )

