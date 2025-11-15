from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import schemas
import crud
from database import get_db, init_db
from init_data import init_test_data
from auth_dependency import get_current_user

app = FastAPI(title="Staff Service", version="1.0.0")

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
    print("✅ Staff Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "staff", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/staff/students", response_model=List[schemas.Student])
async def get_students(
    group_name: Optional[str] = None,
    status: Optional[str] = None,
    faculty: Optional[str] = None,
    course: Optional[int] = None,
    student_number: Optional[str] = None,
    max_user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if student_number:
        student = crud.get_student_by_number(db, student_number)
        return [student] if student else []
    
    if max_user_id:
        student = crud.get_student_by_max_id(db, max_user_id)
        return [student] if student else []
    
    return crud.get_students(
        db,
        group_name=group_name,
        status=status,
        faculty=faculty,
        course=course,
        skip=skip,
        limit=limit
    )

@app.get("/api/staff/students/{student_id}", response_model=schemas.Student)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = crud.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.post("/api/staff/students", response_model=schemas.Student)
async def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        return crud.create_student(db, student)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/staff/students/{student_id}", response_model=schemas.Student)
async def update_student(
    student_id: int,
    student: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        updated = crud.update_student(db, student_id, student)
        if not updated:
            raise HTTPException(status_code=404, detail="Student not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/staff/students/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_student(db, student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}

@app.post("/api/staff/students/update-max-id", response_model=schemas.Student)
async def update_student_max_id_by_phone(
    data: schemas.UpdateMaxIdByPhone,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update student's max_user_id by phone number (for bot integration)
    If max_user_id is None, it will be set to None (clearing the value).
    This endpoint does not require authentication for bot first-time login
    """
    student = crud.update_student_max_id_by_phone(db, data.phone, data.max_user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found with this phone number")
    return student

@app.get("/api/staff/teachers", response_model=List[schemas.Teacher])
async def get_teachers(
    department: Optional[str] = None,
    status: Optional[str] = None,
    teacher_number: Optional[str] = None,
    max_user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if teacher_number:
        teacher = crud.get_teacher_by_number(db, teacher_number)
        return [teacher] if teacher else []
    
    if max_user_id:
        teacher = crud.get_teacher_by_max_id(db, max_user_id)
        return [teacher] if teacher else []
    
    return crud.get_teachers(
        db,
        department=department,
        status=status,
        skip=skip,
        limit=limit
    )

@app.get("/api/staff/teachers/{teacher_id}", response_model=schemas.Teacher)
async def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    teacher = crud.get_teacher_by_id(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@app.post("/api/staff/teachers", response_model=schemas.Teacher)
async def create_teacher(
    teacher: schemas.TeacherCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        return crud.create_teacher(db, teacher)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/staff/teachers/{teacher_id}", response_model=schemas.Teacher)
async def update_teacher(
    teacher_id: int,
    teacher: schemas.TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        updated = crud.update_teacher(db, teacher_id, teacher)
        if not updated:
            raise HTTPException(status_code=404, detail="Teacher not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/staff/teachers/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_teacher(db, teacher_id):
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher deleted successfully"}

@app.post("/api/staff/teachers/update-max-id", response_model=schemas.Teacher)
async def update_teacher_max_id_by_phone(
    data: schemas.UpdateMaxIdByPhone,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update teacher's max_user_id by phone number (for bot integration)
    If max_user_id is None, it will be set to None (clearing the value).
    This endpoint does not require authentication for bot first-time login
    """
    teacher = crud.update_teacher_max_id_by_phone(db, data.phone, data.max_user_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found with this phone number")
    return teacher

@app.get("/api/staff/statistics", response_model=schemas.StaffStatistics)
async def get_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_staff_statistics(db)

@app.get("/api/staff/groups")
async def get_groups(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Получить список всех уникальных групп"""
    groups = crud.get_all_groups(db)
    return {"groups": groups}

@app.get("/api/staff/departments")
async def get_departments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Получить список всех уникальных кафедр"""
    departments = crud.get_all_departments(db)
    return {"departments": departments}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

