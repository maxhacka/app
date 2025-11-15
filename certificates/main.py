from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from database import get_db, init_db
from init_data import init_test_data
from auth_dependency import get_current_user

app = FastAPI(title="Certificates Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    init_test_data()
    print("✅ Certificates Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "certificates", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/certificates", response_model=List[schemas.Certificate])
async def get_certificates(
    max_user_id: Optional[int] = None,
    certificate_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_certificates(
        db,
        max_user_id=max_user_id,
        certificate_type=certificate_type,
        status=status,
        skip=skip,
        limit=limit
    )

@app.get("/api/certificates/{certificate_id}", response_model=schemas.Certificate)
async def get_certificate(certificate_id: int, db: Session = Depends(get_db)):
    certificate = crud.get_certificate_by_id(db, certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate

@app.post("/api/certificates", response_model=schemas.Certificate)
async def create_certificate(
    certificate: schemas.CertificateCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_certificate(db, certificate)

@app.put("/api/certificates/{certificate_id}", response_model=schemas.Certificate)
async def update_certificate(
    certificate_id: int,
    certificate: schemas.CertificateUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_certificate(db, certificate_id, certificate)
    if not updated:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return updated

@app.delete("/api/certificates/{certificate_id}")
async def delete_certificate(certificate_id: int, db: Session = Depends(get_db)):
    if not crud.delete_certificate(db, certificate_id):
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"message": "Certificate deleted successfully"}

@app.get("/api/certificate-types", response_model=List[schemas.CertificateType])
async def get_certificate_types(
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_certificate_types(db, is_active=is_active, skip=skip, limit=limit)

@app.get("/api/certificate-types/{cert_type_id}", response_model=schemas.CertificateType)
async def get_certificate_type(cert_type_id: int, db: Session = Depends(get_db)):
    cert_type = crud.get_certificate_type_by_id(db, cert_type_id)
    if not cert_type:
        raise HTTPException(status_code=404, detail="Certificate type not found")
    return cert_type

@app.post("/api/certificate-types", response_model=schemas.CertificateType)
async def create_certificate_type(
    cert_type: schemas.CertificateTypeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_certificate_type(db, cert_type)

@app.put("/api/certificate-types/{cert_type_id}", response_model=schemas.CertificateType)
async def update_certificate_type(
    cert_type_id: int,
    cert_type: schemas.CertificateTypeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_certificate_type(db, cert_type_id, cert_type)
    if not updated:
        raise HTTPException(status_code=404, detail="Certificate type not found")
    return updated

@app.delete("/api/certificate-types/{cert_type_id}")
async def delete_certificate_type(cert_type_id: int, db: Session = Depends(get_db)):
    if not crud.delete_certificate_type(db, cert_type_id):
        raise HTTPException(status_code=404, detail="Certificate type not found")
    return {"message": "Certificate type deleted successfully"}

@app.get("/api/statistics", response_model=schemas.CertificateStatistics)
async def get_statistics(db: Session = Depends(get_db)):
    return crud.get_certificate_statistics(db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)

