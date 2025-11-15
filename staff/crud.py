from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas

def get_student_by_id(db: Session, student_id: int) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_number(db: Session, student_number: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.student_number == student_number).first()

def get_student_by_max_id(db: Session, max_user_id: int) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.max_user_id == str(max_user_id)).first()

def get_student_by_phone(db: Session, phone: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.phone == phone).first()

def update_student_max_id_by_phone(db: Session, phone: str, max_user_id: Optional[int]) -> Optional[models.Student]:
    """
    Обновляет max_user_id для студента с указанным номером телефона.
    Если max_user_id равен None, устанавливает значение в None.
    """
    student = get_student_by_phone(db, phone)
    if not student:
        return None
    
    student.max_user_id = str(max_user_id) if max_user_id is not None else None
    student.updated_at = datetime.now()
    db.commit()
    db.refresh(student)
    return student

def get_students(
    db: Session,
    group_name: Optional[str] = None,
    status: Optional[str] = None,
    faculty: Optional[str] = None,
    course: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Student]:
    query = db.query(models.Student)
    
    if group_name:
        query = query.filter(models.Student.group_name == group_name)
    if status:
        query = query.filter(models.Student.status == status)
    if faculty:
        query = query.filter(models.Student.faculty == faculty)
    if course:
        query = query.filter(models.Student.course == course)
    
    return query.offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate) -> models.Student:
    # Проверка уникальности номера студента
    existing = get_student_by_number(db, student.student_number)
    if existing:
        raise ValueError(f"Студент с номером студенческого билета {student.student_number} уже существует")
    
    # Проверка уникальности телефона
    if student.phone:
        existing_phone = get_student_by_phone(db, student.phone)
        if existing_phone:
            raise ValueError(f"Студент с номером телефона {student.phone} уже существует")
    
    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(
    db: Session, student_id: int, student: schemas.StudentUpdate
) -> Optional[models.Student]:
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return None
    
    update_data = student.model_dump(exclude_unset=True)
    
    # Проверка уникальности номера студента при обновлении
    if 'student_number' in update_data:
        existing_number = get_student_by_number(db, update_data['student_number'])
        if existing_number and existing_number.id != student_id:
            raise ValueError(f"Студент с номером студенческого билета {update_data['student_number']} уже существует")
    
    # Проверка уникальности телефона при обновлении
    if 'phone' in update_data and update_data['phone']:
        existing_phone = get_student_by_phone(db, update_data['phone'])
        if existing_phone and existing_phone.id != student_id:
            raise ValueError(f"Студент с номером телефона {update_data['phone']} уже существует")
    
    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db_student.updated_at = datetime.now()
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> bool:
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True

def get_teacher_by_id(db: Session, teacher_id: int) -> Optional[models.Teacher]:
    return db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()

def get_teacher_by_number(db: Session, teacher_number: str) -> Optional[models.Teacher]:
    return db.query(models.Teacher).filter(models.Teacher.teacher_number == teacher_number).first()

def get_teacher_by_max_id(db: Session, max_user_id: int) -> Optional[models.Teacher]:
    return db.query(models.Teacher).filter(models.Teacher.max_user_id == str(max_user_id)).first()

def get_teacher_by_phone(db: Session, phone: str) -> Optional[models.Teacher]:
    return db.query(models.Teacher).filter(models.Teacher.phone == phone).first()

def update_teacher_max_id_by_phone(db: Session, phone: str, max_user_id: Optional[int]) -> Optional[models.Teacher]:
    """
    Обновляет max_user_id для преподавателя с указанным номером телефона.
    Если max_user_id равен None, устанавливает значение в None.
    """
    teacher = get_teacher_by_phone(db, phone)
    if not teacher:
        return None
    
    teacher.max_user_id = str(max_user_id) if max_user_id is not None else None
    teacher.updated_at = datetime.now()
    db.commit()
    db.refresh(teacher)
    return teacher

def get_teachers(
    db: Session,
    department: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Teacher]:
    query = db.query(models.Teacher)
    
    if department:
        query = query.filter(models.Teacher.department == department)
    if status:
        query = query.filter(models.Teacher.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_teacher(db: Session, teacher: schemas.TeacherCreate) -> models.Teacher:
    # Проверка уникальности номера преподавателя
    existing = get_teacher_by_number(db, teacher.teacher_number)
    if existing:
        raise ValueError(f"Преподаватель с номером {teacher.teacher_number} уже существует")
    
    # Проверка уникальности телефона
    if teacher.phone:
        existing_phone = get_teacher_by_phone(db, teacher.phone)
        if existing_phone:
            raise ValueError(f"Преподаватель с номером телефона {teacher.phone} уже существует")
    
    db_teacher = models.Teacher(**teacher.model_dump())
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def update_teacher(
    db: Session, teacher_id: int, teacher: schemas.TeacherUpdate
) -> Optional[models.Teacher]:
    db_teacher = get_teacher_by_id(db, teacher_id)
    if not db_teacher:
        return None
    
    update_data = teacher.model_dump(exclude_unset=True)
    
    # Проверка уникальности номера преподавателя при обновлении
    if 'teacher_number' in update_data:
        existing_number = get_teacher_by_number(db, update_data['teacher_number'])
        if existing_number and existing_number.id != teacher_id:
            raise ValueError(f"Преподаватель с номером {update_data['teacher_number']} уже существует")
    
    # Проверка уникальности телефона при обновлении
    if 'phone' in update_data and update_data['phone']:
        existing_phone = get_teacher_by_phone(db, update_data['phone'])
        if existing_phone and existing_phone.id != teacher_id:
            raise ValueError(f"Преподаватель с номером телефона {update_data['phone']} уже существует")
    
    for key, value in update_data.items():
        setattr(db_teacher, key, value)
    
    db_teacher.updated_at = datetime.now()
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def delete_teacher(db: Session, teacher_id: int) -> bool:
    db_teacher = get_teacher_by_id(db, teacher_id)
    if not db_teacher:
        return False
    db.delete(db_teacher)
    db.commit()
    return True

def get_staff_statistics(db: Session) -> schemas.StaffStatistics:
    total_students = db.query(func.count(models.Student.id)).scalar() or 0
    total_teachers = db.query(func.count(models.Teacher.id)).scalar() or 0
    
    active_students = db.query(func.count(models.Student.id)).filter(
        models.Student.status == "active"
    ).scalar() or 0
    
    active_teachers = db.query(func.count(models.Teacher.id)).filter(
        models.Teacher.status == "active"
    ).scalar() or 0
    
    students_by_course = {}
    course_data = db.query(
        models.Student.course, func.count(models.Student.id)
    ).group_by(models.Student.course).all()
    for course, count in course_data:
        if course:
            students_by_course[str(course)] = count
    
    students_by_faculty = {}
    faculty_data = db.query(
        models.Student.faculty, func.count(models.Student.id)
    ).group_by(models.Student.faculty).all()
    for faculty, count in faculty_data:
        if faculty:
            students_by_faculty[faculty] = count
    
    return schemas.StaffStatistics(
        total_students=total_students,
        total_teachers=total_teachers,
        active_students=active_students,
        active_teachers=active_teachers,
        students_by_course=students_by_course,
        students_by_faculty=students_by_faculty
    )

def get_all_groups(db: Session) -> List[str]:
    """Получить список всех уникальных групп студентов"""
    groups = db.query(models.Student.group_name)\
        .distinct()\
        .order_by(models.Student.group_name)\
        .all()
    return [g[0] for g in groups if g[0]]

def get_all_departments(db: Session) -> List[str]:
    """Получить список всех уникальных кафедр преподавателей"""
    departments = db.query(models.Teacher.department)\
        .distinct()\
        .order_by(models.Teacher.department)\
        .all()
    return [d[0] for d in departments if d[0]]

