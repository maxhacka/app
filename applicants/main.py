from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uuid
from pathlib import Path
from datetime import datetime

import schemas
import crud
from database import get_db, init_db
from init_data import init_test_data
from auth_dependency import get_current_user
from enrollment import calculate_enrollment
from excel_generator import generate_enrollment_excel
from enrollment_status import status_manager, EnrollmentStatus

app = FastAPI(title="Applicants Service", version="1.0.0")

# Создаем директории для загрузки файлов
UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

EXCEL_DIR = Path("uploads/enrollment")
EXCEL_DIR.mkdir(parents=True, exist_ok=True)

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
    print("✅ Applicants Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "applicants", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/applicants/applicants", response_model=List[schemas.Applicant])
async def get_applicants(
    status: Optional[str] = None,
    program: Optional[str] = None,
    source: Optional[str] = None,
    program_limit: Optional[int] = None,
    sort_by_exam_results: Optional[bool] = False,
    max_user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_applicants(
        db,
        status=status,
        program=program,
        source=source,
        program_limit=program_limit,
        sort_by_exam_results=sort_by_exam_results,
        max_user_id=max_user_id,
        skip=skip,
        limit=limit
    )

@app.get("/api/applicants/applicants-grouped", response_model=List[schemas.GroupedApplicant])
async def get_grouped_applicants(
    status: Optional[str] = None,
    program: Optional[str] = None,
    source: Optional[str] = None,
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Получить абитуриентов, сгруппированных по телефону и СНИЛС.
    Каждый абитуриент возвращается один раз со списком всех его программ.
    """
    return crud.get_grouped_applicants(
        db,
        status=status,
        program=program,
        source=source,
        skip=skip,
        limit=limit
    )

@app.put("/api/applicants/applicants-programs", response_model=List[schemas.Applicant])
async def update_applicant_programs(
    data: schemas.UpdateApplicantPrograms,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Обновить программы и приоритеты абитуриента.
    """
    try:
        return crud.update_applicant_programs(db, data.phone, data.programs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/applicants/applicants/{applicant_id}", response_model=schemas.Applicant)
async def get_applicant(
    applicant_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    applicant = crud.get_applicant_by_id(db, applicant_id)
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return applicant

@app.post("/api/applicants/applicants", response_model=schemas.Applicant)
async def create_applicant(
    applicant: schemas.ApplicantCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        return crud.create_applicant(db, applicant)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/applicants/applicants/{applicant_id}", response_model=schemas.Applicant)
async def update_applicant(
    applicant_id: int,
    applicant: schemas.ApplicantUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        updated = crud.update_applicant(db, applicant_id, applicant)
        if not updated:
            raise HTTPException(status_code=404, detail="Applicant not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/applicants/applicants/{applicant_id}")
async def delete_applicant(
    applicant_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_applicant(db, applicant_id):
        raise HTTPException(status_code=404, detail="Applicant not found")
    return {"message": "Applicant deleted successfully"}

@app.post("/api/applicants/applicants/update-max-id", response_model=List[schemas.Applicant])
async def update_applicant_max_id_by_phone(
    data: schemas.UpdateMaxIdByPhone,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update max_user_id for all applicants with the specified phone number (for bot integration)
    This endpoint updates all records with the given phone number.
    If max_user_id is None, it will be set to None (clearing the value).
    Returns a list of all updated applicants.
    """
    applicants = crud.update_applicant_max_id_by_phone(db, data.phone, data.max_user_id)
    if not applicants:
        raise HTTPException(status_code=404, detail="No applicants found with this phone number")
    return applicants

@app.get("/api/applicants/documents", response_model=List[schemas.ApplicantDocument])
async def get_documents(
    applicant_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_documents(db, applicant_id=applicant_id, skip=skip, limit=limit)

@app.get("/api/applicants/documents/{document_id}", response_model=schemas.ApplicantDocument)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    document = crud.get_document_by_id(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@app.post("/api/applicants/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    applicant_id: int = Form(...),
    document_type: str = Form(...),
    document_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Загрузить файл документа на сервер"""
    try:
        # Генерируем уникальное имя файла
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Формируем URL для доступа к файлу
        file_url = f"/uploads/documents/{unique_filename}"
        
        # Создаем запись в БД
        document_data = schemas.ApplicantDocumentCreate(
            applicant_id=applicant_id,
            document_type=document_type,
            document_name=document_name,
            file_url=file_url
        )
        
        return crud.create_document(db, document_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

@app.post("/api/applicants/documents", response_model=schemas.ApplicantDocument)
async def create_document(
    document: schemas.ApplicantDocumentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_document(db, document)

@app.put("/api/applicants/documents/{document_id}", response_model=schemas.ApplicantDocument)
async def update_document(
    document_id: int,
    document: schemas.ApplicantDocumentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_document(db, document_id, document)
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated

@app.delete("/api/applicants/documents/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_document(db, document_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

@app.get("/api/applicants/exams", response_model=List[schemas.ApplicantExam])
async def get_exams(
    applicant_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_exams(db, applicant_id=applicant_id, skip=skip, limit=limit)

@app.get("/api/applicants/exams/{exam_id}", response_model=schemas.ApplicantExam)
async def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    exam = crud.get_exam_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@app.post("/api/applicants/exams", response_model=schemas.ApplicantExam)
async def create_exam(
    exam: schemas.ApplicantExamCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_exam(db, exam)

@app.put("/api/applicants/exams/{exam_id}", response_model=schemas.ApplicantExam)
async def update_exam(
    exam_id: int,
    exam: schemas.ApplicantExamUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_exam(db, exam_id, exam)
    if not updated:
        raise HTTPException(status_code=404, detail="Exam not found")
    return updated

@app.delete("/api/applicants/exams/{exam_id}")
async def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_exam(db, exam_id):
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam deleted successfully"}

@app.get("/api/applicants/statistics", response_model=schemas.ApplicantStatistics)
async def get_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_applicant_statistics(db)

@app.get("/api/applicants/programs", response_model=List[schemas.Program])
async def get_programs(
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_programs(db, is_active=is_active, skip=skip, limit=limit)

@app.get("/api/applicants/programs/{program_id}", response_model=schemas.Program)
async def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    program = crud.get_program_by_id(db, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program

@app.post("/api/applicants/programs", response_model=schemas.Program)
async def create_program(
    program: schemas.ProgramCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing = crud.get_program_by_name(db, program.name)
    if existing:
        raise HTTPException(status_code=400, detail="Program with this name already exists")
    return crud.create_program(db, program)

@app.put("/api/applicants/programs/{program_id}", response_model=schemas.Program)
async def update_program(
    program_id: int,
    program: schemas.ProgramUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_program(db, program_id, program)
    if not updated:
        raise HTTPException(status_code=404, detail="Program not found")
    return updated

@app.delete("/api/applicants/programs/{program_id}")
async def delete_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_program(db, program_id):
        raise HTTPException(status_code=404, detail="Program not found")
    return {"message": "Program deleted successfully"}


# ============= РАСЧЕТ ЗАЧИСЛЕНИЯ =============

def process_enrollment_calculation(task_id: str):
    """Асинхронная функция для расчета зачисления"""
    from database import SessionLocal
    
    # Создаем новую сессию БД для фоновой задачи
    db = SessionLocal()
    try:
        status_manager.update_status(
            task_id,
            EnrollmentStatus.PROCESSING,
            progress=10,
            message="Начало расчета зачисления..."
        )
        
        # Рассчитываем зачисление
        status_manager.update_status(
            task_id,
            EnrollmentStatus.PROCESSING,
            progress=30,
            message="Обработка данных абитуриентов..."
        )
        
        enrollment_results = calculate_enrollment(db)
        
        status_manager.update_status(
            task_id,
            EnrollmentStatus.PROCESSING,
            progress=60,
            message="Генерация Excel файла..."
        )
        
        # Генерируем Excel файл
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"enrollment_{timestamp}.xlsx"
        file_path = EXCEL_DIR / filename
        
        generate_enrollment_excel(enrollment_results, str(file_path))
        
        status_manager.update_status(
            task_id,
            EnrollmentStatus.COMPLETED,
            progress=100,
            message="Расчет завершен успешно!",
            file_path=f"/uploads/enrollment/{filename}"
        )
    except Exception as e:
        status_manager.update_status(
            task_id,
            EnrollmentStatus.ERROR,
            progress=0,
            message="Ошибка при расчете",
            error=str(e)
        )
    finally:
        db.close()


@app.post("/api/applicants/enrollment/calculate")
async def start_enrollment_calculation(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Запустить расчет зачисления по алгоритму высшего приоритета.
    Расчет выполняется асинхронно в фоновом режиме.
    """
    import uuid as uuid_lib
    
    # Генерируем уникальный ID задачи
    task_id = str(uuid_lib.uuid4())
    
    # Создаем задачу
    status_manager.create_task(task_id)
    
    # Запускаем расчет в фоновом режиме
    background_tasks.add_task(process_enrollment_calculation, task_id)
    
    return {
        "task_id": task_id,
        "status": "pending",
        "message": "Расчет начат. Используйте task_id для проверки статуса."
    }


@app.get("/api/applicants/enrollment/status/{task_id}")
async def get_enrollment_status(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получить статус расчета зачисления"""
    status = status_manager.get_status(task_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return status


@app.get("/api/applicants/enrollment/download/{filename}")
async def download_enrollment_file(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Скачать Excel файл с результатами зачисления"""
    file_path = EXCEL_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)

