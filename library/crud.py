from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import models
import schemas

def get_book_by_id(db: Session, book_id: int) -> Optional[models.Book]:
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def get_book_by_isbn(db: Session, isbn: str) -> Optional[models.Book]:
    return db.query(models.Book).filter(models.Book.isbn == isbn).first()

def get_books(
    db: Session,
    category: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    is_electronic: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Book]:
    query = db.query(models.Book)
    
    if category:
        query = query.filter(models.Book.category == category)
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if search:
        query = query.filter(
            or_(
                models.Book.title.ilike(f"%{search}%"),
                models.Book.author.ilike(f"%{search}%"),
                models.Book.description.ilike(f"%{search}%")
            )
        )
    if is_electronic is not None:
        query = query.filter(models.Book.is_electronic == is_electronic)
    
    return query.offset(skip).limit(limit).all()

def create_book(db: Session, book: schemas.BookCreate) -> models.Book:
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def update_book(
    db: Session, book_id: int, book: schemas.BookUpdate
) -> Optional[models.Book]:
    db_book = get_book_by_id(db, book_id)
    if not db_book:
        return None
    
    update_data = book.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_book, key, value)
    
    db_book.updated_at = datetime.now()
    db.commit()
    db.refresh(db_book)
    return db_book

def delete_book(db: Session, book_id: int) -> bool:
    db_book = get_book_by_id(db, book_id)
    if not db_book:
        return False
    
    # Удаляем PDF файл с диска, если он существует
    if db_book.pdf_url:
        try:
            from pathlib import Path
            file_path = Path("uploads/books") / Path(db_book.pdf_url).name
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Ошибка удаления файла: {e}")
    
    db.delete(db_book)
    db.commit()
    return True

def get_library_statistics(db: Session) -> schemas.LibraryStatistics:
    total_books = db.query(func.count(models.Book.id)).scalar() or 0
    total_copies = db.query(func.sum(models.Book.total_copies)).scalar() or 0
    available_copies = db.query(func.sum(models.Book.available_copies)).scalar() or 0

    books_by_category = {}
    category_data = db.query(
        models.Book.category, func.count(models.Book.id)
    ).group_by(models.Book.category).all()
    for category, count in category_data:
        if category:
            books_by_category[category] = count

    return schemas.LibraryStatistics(
        total_books=int(total_books),
        total_copies=int(total_copies),
        available_copies=int(available_copies),
        books_by_category=books_by_category
    )

