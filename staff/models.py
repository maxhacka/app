from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    max_user_id = Column(String(100), unique=True, index=True, nullable=True)
    student_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    group_name = Column(String(100), nullable=False, index=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    status = Column(String(50), default="active", index=True)
    enrollment_year = Column(Integer, nullable=True)
    faculty = Column(String(200), nullable=True)
    specialization = Column(String(200), nullable=True)
    course = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    max_user_id = Column(String(100), unique=True, index=True, nullable=True)
    teacher_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    status = Column(String(50), default="active", index=True)
    department = Column(String(200), nullable=True)
    position = Column(String(100), nullable=True)
    academic_degree = Column(String(100), nullable=True)
    subjects = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

