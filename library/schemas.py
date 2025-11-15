from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BookBase(BaseModel):
    isbn: Optional[str] = None
    title: str
    author: str
    publisher: Optional[str] = None
    year: Optional[int] = None
    category: str
    language: str = "ru"
    pages: Optional[int] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    pdf_url: Optional[str] = None
    total_copies: int = 1
    available_copies: int = 1
    is_electronic: bool = False

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    year: Optional[int] = None
    category: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    pdf_url: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    is_electronic: Optional[bool] = None

class Book(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BookLoanBase(BaseModel):
    book_id: int
    user_id: int
    user_type: str
    due_date: datetime
    status: str = "active"
    fine_amount: float = 0.0
    comments: Optional[str] = None

class BookLoanCreate(BaseModel):
    book_id: int
    user_id: int
    user_type: str
    due_date: datetime
    comments: Optional[str] = None

class BookLoanUpdate(BaseModel):
    return_date: Optional[datetime] = None
    status: Optional[str] = None
    fine_amount: Optional[float] = None
    comments: Optional[str] = None

class BookReservationBase(BaseModel):
    book_id: int
    user_id: int
    user_type: str
    expiry_date: datetime
    status: str = "active"

class BookReservationCreate(BaseModel):
    book_id: int
    user_id: int
    user_type: str
    expiry_date: datetime

class BookReservationUpdate(BaseModel):
    status: Optional[str] = None
    expiry_date: Optional[datetime] = None

class BookReservation(BookReservationBase):
    id: int
    reservation_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class BookReviewBase(BaseModel):
    book_id: int
    user_id: int
    user_type: str
    rating: int
    review: Optional[str] = None

class BookReviewCreate(BookReviewBase):
    pass

class BookReviewUpdate(BaseModel):
    rating: Optional[int] = None
    review: Optional[str] = None

class BookReview(BookReviewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LibraryStatistics(BaseModel):
    total_books: int
    total_copies: int
    available_copies: int
    books_by_category: dict

