from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
import re

class StudentBase(BaseModel):
    student_number: str
    name: str
    group_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str = "active"
    enrollment_year: Optional[int] = None
    faculty: Optional[str] = None
    specialization: Optional[str] = None
    course: Optional[int] = None

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

class StudentCreate(StudentBase):
    max_user_id: Optional[int] = None

class StudentUpdate(BaseModel):
    student_number: Optional[str] = None
    name: Optional[str] = None
    group_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    enrollment_year: Optional[int] = None
    faculty: Optional[str] = None
    specialization: Optional[str] = None
    course: Optional[int] = None
    max_user_id: Optional[int] = None

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

class Student(StudentBase):
    id: int
    max_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

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

class TeacherBase(BaseModel):
    teacher_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str = "active"
    department: Optional[str] = None
    position: Optional[str] = None
    academic_degree: Optional[str] = None
    subjects: Optional[str] = None

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

class TeacherCreate(TeacherBase):
    max_user_id: Optional[int] = None

class TeacherUpdate(BaseModel):
    teacher_number: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    academic_degree: Optional[str] = None
    subjects: Optional[str] = None
    max_user_id: Optional[int] = None

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

class Teacher(TeacherBase):
    id: int
    max_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StaffStatistics(BaseModel):
    total_students: int
    total_teachers: int
    active_students: int
    active_teachers: int
    students_by_course: dict
    students_by_faculty: dict

