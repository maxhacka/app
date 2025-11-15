from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

class ScheduleBase(BaseModel):
    group_name: str
    day_of_week: str
    time_start: str
    time_end: str
    subject: str
    teacher: str
    teacher_id: Optional[int] = None
    room: str
    type: str = "lecture"
    week_type: Optional[str] = None
    date_created_on: date

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    group_name: Optional[str] = None
    day_of_week: Optional[str] = None
    time_start: Optional[str] = None
    time_end: Optional[str] = None
    subject: Optional[str] = None
    teacher: Optional[str] = None
    teacher_id: Optional[int] = None
    room: Optional[str] = None
    type: Optional[str] = None
    week_type: Optional[str] = None
    date_created_on: Optional[date] = None

class Schedule(ScheduleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    date_created_on: date

    class Config:
        from_attributes = True

class ScheduleTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = None
    is_active: int = 0

class ScheduleTemplateCreate(ScheduleTemplateBase):
    pass

class ScheduleTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = None
    is_active: Optional[int] = None

class ScheduleTemplate(ScheduleTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ScheduleChangeBase(BaseModel):
    schedule_id: int
    date: date
    change_type: str
    new_time_start: Optional[str] = None
    new_time_end: Optional[str] = None
    new_room: Optional[str] = None
    new_teacher: Optional[str] = None
    reason: Optional[str] = None

class ScheduleChangeCreate(ScheduleChangeBase):
    pass

class ScheduleChangeUpdate(BaseModel):
    schedule_id: Optional[int] = None
    date: Optional[date] = None
    change_type: Optional[str] = None
    new_time_start: Optional[str] = None
    new_time_end: Optional[str] = None
    new_room: Optional[str] = None
    new_teacher: Optional[str] = None
    reason: Optional[str] = None

class ScheduleChange(ScheduleChangeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: int = 1

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[int] = None

class Group(GroupBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: int = 1

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[int] = None

class Subject(SubjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

