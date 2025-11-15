from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean
from database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(50), unique=True, index=True, nullable=True)
    title = Column(String(300), nullable=False, index=True)
    author = Column(String(200), nullable=False, index=True)
    publisher = Column(String(200), nullable=True)
    year = Column(Integer, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    language = Column(String(50), default="ru")
    pages = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    cover_url = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    is_electronic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())


