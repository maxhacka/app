from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Date
from database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    time = Column(String(10), nullable=False)
    location = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    max_participants = Column(Integer, nullable=True)
    registration_url = Column(String(500), nullable=True)
    status = Column(String(50), default="published", index=True)
    tags = Column(Text, nullable=True)
    participants_count = Column(Integer, default=0)
    organizer = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())


