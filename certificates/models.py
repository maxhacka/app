from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    max_user_id = Column(Integer, nullable=False, index=True)
    user_type = Column(String(50), nullable=False)
    certificate_type = Column(String(100), nullable=False, index=True)
    purpose = Column(String(200), nullable=True)
    status = Column(String(50), default="processing", index=True)
    request_date = Column(DateTime, default=datetime.now())
    ready_date = Column(DateTime, nullable=True)
    issue_date = Column(DateTime, nullable=True)
    delivery_method = Column(String(50), default="pickup")
    delivery_address = Column(String(500), nullable=True)
    price = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    comments = Column(String(500))
    
class CertificateType(Base):
    __tablename__ = "certificate_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    price = Column(Float, default=0.0)
    processing_days = Column(Integer, default=3)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now())


