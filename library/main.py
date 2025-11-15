from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uuid
from pathlib import Path

import models
import schemas
import crud
from database import get_db, init_db
from init_data import init_test_data
from auth_dependency import get_current_user

app = FastAPI(title="Library Service", version="1.0.0")

# Создаем директорию для загрузки файлов книг
UPLOAD_DIR = Path("uploads/books")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Подключаем статические файлы для доступа к загруженным файлам
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    init_test_data()
    print("✅ Library Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "library", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/books", response_model=List[schemas.Book])
async def get_books(
    category: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    is_electronic: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_books(
        db,
        category=category,
        author=author,
        search=search,
        is_electronic=is_electronic,
        skip=skip,
        limit=limit
    )

@app.get("/api/books/{book_id}", response_model=schemas.Book)
async def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    book = crud.get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.post("/api/books", response_model=schemas.Book)
async def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_book(db, book)

@app.put("/api/books/{book_id}", response_model=schemas.Book)
async def update_book(
    book_id: int,
    book: schemas.BookUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_book(db, book_id, book)
    if not updated:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated

@app.delete("/api/books/{book_id}")
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_book(db, book_id):
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book deleted successfully"}

@app.post("/api/books/{book_id}/upload-pdf")
async def upload_book_pdf(
    book_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Загрузить PDF файл книги на сервер"""
    try:
        # Проверяем, что файл - PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Файл должен быть в формате PDF")
        
        # Проверяем существование книги
        book = crud.get_book_by_id(db, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Генерируем уникальное имя файла
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Формируем URL для доступа к файлу
        pdf_url = f"/uploads/books/{unique_filename}"
        
        # Обновляем книгу с URL PDF
        # Не меняем is_electronic, если у книги есть бумажные экземпляры
        # is_electronic=True только если книга ТОЛЬКО электронная (без бумажных экземпляров)
        book = crud.get_book_by_id(db, book_id)
        is_electronic_only = book.total_copies == 0
        update_data = schemas.BookUpdate(pdf_url=pdf_url, is_electronic=is_electronic_only)
        updated_book = crud.update_book(db, book_id, update_data)
        
        return updated_book
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

@app.get("/api/statistics", response_model=schemas.LibraryStatistics)
async def get_statistics(db: Session = Depends(get_db)):
    return crud.get_library_statistics(db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)

