from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator
import re

class ApplicantBase(BaseModel):
    applicant_id: str
    name: str
    phone: str
    email: Optional[str] = None
    snils: str
    program: str
    program_limit: Optional[int] = None
    status: str = "new"
    priority: int = 3
    source: str = "bot"
    comments: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    documents: Optional[str] = None
    exam_results: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            raise ValueError('Телефон обязателен для абитуриента')
        # Формат: +7XXXXXXXXXX (11 цифр после +7)
        pattern = r'^\+7\d{10}$'
        if not re.match(pattern, v):
            raise ValueError('Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)')
        return v

class ApplicantCreate(BaseModel):
    applicant_id: Optional[str] = None
    max_user_id: Optional[int] = None
    name: str
    phone: str
    email: Optional[str] = None
    snils: str
    program: str
    program_limit: Optional[int] = None
    status: str = "new"
    priority: int = 3
    source: str = "bot"
    comments: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    documents: Optional[str] = None
    exam_results: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            raise ValueError('Телефон обязателен для абитуриента')
        # Формат: +7XXXXXXXXXX (11 цифр после +7)
        pattern = r'^\+7\d{10}$'
        if not re.match(pattern, v):
            raise ValueError('Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)')
        return v

class ApplicantUpdate(BaseModel):
    applicant_id: Optional[str] = None
    max_user_id: Optional[int] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    snils: Optional[str] = None
    program: Optional[str] = None
    program_limit: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    source: Optional[str] = None
    comments: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    documents: Optional[str] = None
    exam_results: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            return v
        # Формат: +7XXXXXXXXXX (11 цифр после +7)
        pattern = r'^\+7\d{10}$'
        if not re.match(pattern, v):
            raise ValueError('Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)')
        return v

class Applicant(ApplicantBase):
    id: int
    program_limit: Optional[int] = None
    max_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    priority: int
    exam_results: Optional[int] = None

    class Config:
        from_attributes = True

class UpdateMaxIdByPhone(BaseModel):
    phone: str
    max_user_id: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            raise ValueError('Телефон обязателен')
        # Формат: +7XXXXXXXXXX (11 цифр после +7)
        pattern = r'^\+7\d{10}$'
        if not re.match(pattern, v):
            raise ValueError('Телефон должен быть в формате +7XXXXXXXXXX (11 цифр после +7)')
        return v

class ApplicantDocumentBase(BaseModel):
    applicant_id: int
    document_type: str
    document_name: str
    file_url: Optional[str] = None
    status: str = "pending"

class ApplicantDocumentCreate(ApplicantDocumentBase):
    pass

class ApplicantDocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    document_name: Optional[str] = None
    file_url: Optional[str] = None
    status: Optional[str] = None
    verified_by: Optional[int] = None

class ApplicantDocument(ApplicantDocumentBase):
    id: int
    uploaded_at: datetime
    verified_at: Optional[datetime] = None
    verified_by: Optional[int] = None

    class Config:
        from_attributes = True

class ApplicantExamBase(BaseModel):
    applicant_id: int
    subject: str
    score: float
    max_score: float = 100.0
    exam_date: Optional[datetime] = None

class ApplicantExamCreate(ApplicantExamBase):
    pass

class ApplicantExamUpdate(BaseModel):
    subject: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = None
    exam_date: Optional[datetime] = None

class ApplicantExam(ApplicantExamBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicantStatistics(BaseModel):
    total_applicants: int
    new_applicants: int
    contacted_applicants: int
    enrolled_applicants: int
    rejected_applicants: int
    applicants_by_program: dict
    applicants_by_source: dict

class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    total_places: int = 0
    budget_places: int = 0
    paid_places: int = 0
    is_active: int = 1
    min_score: Optional[int] = None

class ProgramCreate(ProgramBase):
    pass

class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_places: Optional[int] = None
    budget_places: Optional[int] = None
    paid_places: Optional[int] = None
    is_active: Optional[int] = None
    min_score: Optional[int] = None

class Program(ProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplicantProgram(BaseModel):
    """Информация о программе абитуриента"""
    id: int  # ID записи в базе
    program: str
    priority: int
    status: str
    program_limit: Optional[int] = None
    exam_results: Optional[int] = None
    source: str = "bot"
    comments: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GroupedApplicant(BaseModel):
    """Сгруппированный абитуриент с массивом программ"""
    phone: str
    snils: str
    name: str
    email: Optional[str] = None
    applicant_id: str  # Первый applicant_id из группы
    max_user_id: Optional[str] = None
    programs: List[ApplicantProgram]  # Массив всех программ абитуриента
    
    class Config:
        from_attributes = True

class UpdateApplicantPrograms(BaseModel):
    """Обновление программ и приоритетов абитуриента"""
    phone: str
    programs: List[dict]  # [{"id": 1, "program": "Программа 1", "priority": 1}, ...]

