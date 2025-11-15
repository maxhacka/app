from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CertificateBase(BaseModel):
    max_user_id: int
    user_type: str
    certificate_type: str
    purpose: Optional[str] = None
    status: str = "processing"
    delivery_method: str = "pickup"
    delivery_address: Optional[str] = None
    price: float = 0.0
    comments: Optional[str] = None
    document_url: Optional[str] = None

class CertificateCreate(BaseModel):
    max_user_id: int
    user_type: str
    certificate_type: str
    purpose: Optional[str] = None
    delivery_method: str = "pickup"
    delivery_address: Optional[str] = None
    comments: Optional[str] = None


class CertificateUpdate(BaseModel):
    status: Optional[str] = None
    ready_date: Optional[datetime] = None
    issue_date: Optional[datetime] = None
    delivery_method: Optional[str] = None
    delivery_address: Optional[str] = None
    price: Optional[float] = None
    comments: Optional[str] = None
    document_url: Optional[str] = None

class Certificate(CertificateBase):
    id: int
    max_user_id: int
    request_date: datetime
    ready_date: Optional[datetime] = None
    issue_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CertificateTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    processing_days: int = 3
    is_active: int = 1

class CertificateTypeCreate(CertificateTypeBase):
    pass

class CertificateTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    processing_days: Optional[int] = None
    is_active: Optional[int] = None

class CertificateType(CertificateTypeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CertificateStatistics(BaseModel):
    total_certificates: int
    pending_certificates: int
    processing_certificates: int
    ready_certificates: int
    issued_certificates: int
    cancelled_certificates: int
    certificates_by_type: dict
    total_revenue: float

