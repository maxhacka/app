from datetime import datetime
from datetime import date as DateType
from typing import Optional, Union
from pydantic import BaseModel, field_validator

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: DateType
    time: str
    location: str
    category: str
    image_url: Optional[str] = None
    max_participants: Optional[int] = None
    registration_url: Optional[str] = None
    status: str = "published"
    tags: Optional[str] = None
    participants_count: int = 0
    organizer: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[Union[DateType, str]] = None
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    max_participants: Optional[int] = None
    registration_url: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    participants_count: Optional[int] = None
    organizer: Optional[str] = None

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            return DateType.fromisoformat(v)
        return v

class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EventStatistics(BaseModel):
    total_events: int
    published_events: int
    completed_events: int
    events_by_category: dict

