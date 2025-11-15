from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Date
from database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String(100), nullable=False, index=True)
    day_of_week = Column(String(20), nullable=False, index=True)
    time_start = Column(String(10), nullable=False)
    time_end = Column(String(10), nullable=False)
    subject = Column(String(200), nullable=False)
    teacher = Column(String(200), nullable=False)
    teacher_id = Column(Integer, nullable=True)
    room = Column(String(50), nullable=False)
    type = Column(String(50), default="lecture")
    week_type = Column(String(20), nullable=True)
    date_created_on = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

class ScheduleTemplate(Base):
    __tablename__ = "schedule_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    semester = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    is_active = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

class ScheduleChange(Base):
    __tablename__ = "schedule_changes"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    change_type = Column(String(50), nullable=False)
    new_time_start = Column(String(10), nullable=True)
    new_time_end = Column(String(10), nullable=True)
    new_room = Column(String(50), nullable=True)
    new_teacher = Column(String(200), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now())

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

