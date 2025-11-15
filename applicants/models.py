from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from database import Base

class Applicant(Base):
    __tablename__ = "applicants"

    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(String(50), unique=True, index=True, nullable=False)
    max_user_id = Column(String(100), index=True, nullable=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(200), nullable=True)
    snils = Column(String(20), nullable=False, index=True)
    program = Column(String(200), nullable=False, index=True)
    
    program_limit = Column(Integer)
    
    status = Column(String(50), default="new", index=True)
    priority = Column(Integer, default=1)
    source = Column(String(50), default="bot")
    comments = Column(Text, nullable=True)
    last_contact_date = Column(DateTime, nullable=True)
    assigned_to = Column(Integer, nullable=True)
    documents = Column(Text, nullable=True)
    
    exam_results = Column(Integer, nullable=True) # final_result
    
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

# 1. Иванов Иван - 300
# ... ... ...
# 298.
# 299.
# 300. Вадим Сорокин - 19
# 301.
# 302.

# Вы на 300 месте из 2 доступных 

class ApplicantDocument(Base):
    __tablename__ = "applicant_documents"

    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(Integer, nullable=False, index=True)
    document_type = Column(String(100), nullable=False)
    document_name = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=True)
    status = Column(String(50), default="pending")
    uploaded_at = Column(DateTime, default=datetime.now())
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, nullable=True)

class ApplicantExam(Base):
    __tablename__ = "applicant_exams"

    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(Integer, nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=100.0)
    exam_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now())

class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    total_places = Column(Integer, nullable=False, default=0)
    budget_places = Column(Integer, nullable=False, default=0)
    paid_places = Column(Integer, nullable=False, default=0)
    is_active = Column(Integer, default=1)
    min_score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

