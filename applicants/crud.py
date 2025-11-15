from datetime import datetime
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
import models
import schemas
import uuid

def get_applicant_by_id(db: Session, applicant_id: int) -> Optional[models.Applicant]:
    return db.query(models.Applicant).filter(models.Applicant.id == applicant_id).first()

def get_applicant_by_applicant_id(db: Session, applicant_id: str) -> Optional[models.Applicant]:
    return db.query(models.Applicant).filter(models.Applicant.applicant_id == applicant_id).first()

def get_applicant_by_phone(db: Session, phone: str) -> Optional[models.Applicant]:
    return db.query(models.Applicant).filter(models.Applicant.phone == phone).first()

def get_applicant_by_snils_and_program(db: Session, snils: str, program: str) -> Optional[models.Applicant]:
    """Найти абитуриента по СНИЛС и программе"""
    return db.query(models.Applicant).filter(
        models.Applicant.snils == snils,
        models.Applicant.program == program
    ).first()

def update_applicant_max_id_by_phone(db: Session, phone: str, max_user_id: Optional[int]) -> List[models.Applicant]:
    """
    Обновляет max_user_id для всех записей с указанным номером телефона.
    Если max_user_id равен None, устанавливает значение в None.
    Возвращает список всех обновленных записей.
    """
    applicants = db.query(models.Applicant).filter(models.Applicant.phone == phone).all()
    if not applicants:
        return []
    
    # Обновляем все найденные записи
    for applicant in applicants:
        applicant.max_user_id = str(max_user_id) if max_user_id is not None else None
        applicant.updated_at = datetime.now()
    
    db.commit()
    
    # Обновляем объекты в сессии
    for applicant in applicants:
        db.refresh(applicant)
    
    return applicants

def get_applicants(
    db: Session,
    status: Optional[str] = None,
    program: Optional[str] = None,
    source: Optional[str] = None,
    program_limit: Optional[int] = None,
    sort_by_exam_results: Optional[bool] = False,
    max_user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Applicant]:
    query = db.query(models.Applicant)
    
    if status:
        query = query.filter(models.Applicant.status == status)
    if program:
        query = query.filter(models.Applicant.program == program)
    if source:
        query = query.filter(models.Applicant.source == source)
    if program_limit is not None:
        query = query.filter(models.Applicant.program_limit == program_limit)
    
    if max_user_id is not None:
        query = query.filter(models.Applicant.max_user_id == str(max_user_id))
    
    if sort_by_exam_results:
        query = query.order_by(models.Applicant.exam_results.desc())
    
    return query.offset(skip).limit(limit).all()

def create_applicant(db: Session, applicant: schemas.ApplicantCreate) -> models.Applicant:
    if not applicant.applicant_id:
        applicant.applicant_id = str(uuid.uuid4())[:8].upper()
    
    # Проверка уникальности номера абитуриента
    existing = get_applicant_by_applicant_id(db, applicant.applicant_id)
    if existing:
        raise ValueError(f"Абитуриент с номером {applicant.applicant_id} уже существует")
    
    # Проверка уникальности связки СНИЛС + программа
    existing_snils_program = get_applicant_by_snils_and_program(db, applicant.snils, applicant.program)
    if existing_snils_program:
        raise ValueError(f"Абитуриент с СНИЛС {applicant.snils} уже зарегистрирован на программу '{applicant.program}'")
    
    db_applicant = models.Applicant(**applicant.model_dump())
    db.add(db_applicant)
    db.commit()
    db.refresh(db_applicant)
    return db_applicant

def update_applicant(
    db: Session, applicant_id: int, applicant: schemas.ApplicantUpdate
) -> Optional[models.Applicant]:
    db_applicant = get_applicant_by_id(db, applicant_id)
    if not db_applicant:
        return None
    
    update_data = applicant.model_dump(exclude_unset=True)
    
    # Проверка уникальности номера абитуриента при обновлении
    if 'applicant_id' in update_data:
        existing = get_applicant_by_applicant_id(db, update_data['applicant_id'])
        if existing and existing.id != applicant_id:
            raise ValueError(f"Абитуриент с номером {update_data['applicant_id']} уже существует")
    
    # Проверка уникальности связки СНИЛС + программа при обновлении
    # Получаем значения СНИЛС и программы (новые или текущие)
    snils = update_data.get('snils', db_applicant.snils)
    program = update_data.get('program', db_applicant.program)
    
    # Проверяем, если меняется СНИЛС или программа
    if 'snils' in update_data or 'program' in update_data:
        existing_snils_program = get_applicant_by_snils_and_program(db, snils, program)
        if existing_snils_program and existing_snils_program.id != applicant_id:
            raise ValueError(f"Абитуриент с СНИЛС {snils} уже зарегистрирован на программу '{program}'")
    
    for key, value in update_data.items():
        setattr(db_applicant, key, value)
    
    db_applicant.updated_at = datetime.now()
    db.commit()
    db.refresh(db_applicant)
    return db_applicant

def delete_applicant(db: Session, applicant_id: int) -> bool:
    """
    Удаляет абитуриента по ID.
    Если у абитуриента несколько программ (записей с одинаковым телефоном и СНИЛС),
    удаляет все связанные записи.
    """
    db_applicant = get_applicant_by_id(db, applicant_id)
    if not db_applicant:
        return False
    
    # Получаем телефон и СНИЛС для удаления всех связанных записей
    phone = db_applicant.phone
    snils = db_applicant.snils
    
    # Находим все записи абитуриента с таким же телефоном и СНИЛС
    all_applicants = db.query(models.Applicant).filter(
        models.Applicant.phone == phone,
        models.Applicant.snils == snils
    ).all()
    
    # Удаляем все найденные записи
    for applicant in all_applicants:
        # Также удаляем связанные документы и экзамены
        documents = get_documents(db, applicant_id=applicant.id)
        for doc in documents:
            delete_document(db, doc.id)
        
        exams = get_exams(db, applicant_id=applicant.id)
        for exam in exams:
            delete_exam(db, exam.id)
        
        db.delete(applicant)
    
    db.commit()
    return True

def get_document_by_id(db: Session, document_id: int) -> Optional[models.ApplicantDocument]:
    return db.query(models.ApplicantDocument).filter(models.ApplicantDocument.id == document_id).first()

def get_documents(
    db: Session,
    applicant_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.ApplicantDocument]:
    query = db.query(models.ApplicantDocument)
    
    if applicant_id:
        query = query.filter(models.ApplicantDocument.applicant_id == applicant_id)
    
    return query.offset(skip).limit(limit).all()

def create_document(db: Session, document: schemas.ApplicantDocumentCreate) -> models.ApplicantDocument:
    db_document = models.ApplicantDocument(**document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_document(
    db: Session, document_id: int, document: schemas.ApplicantDocumentUpdate
) -> Optional[models.ApplicantDocument]:
    db_document = get_document_by_id(db, document_id)
    if not db_document:
        return None
    
    update_data = document.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_document, key, value)
    
    if update_data.get("status") == "approved" and not db_document.verified_at:
        db_document.verified_at = datetime.now()
    
    db.commit()
    db.refresh(db_document)
    return db_document

def delete_document(db: Session, document_id: int) -> bool:
    db_document = get_document_by_id(db, document_id)
    if not db_document:
        return False
    
    # Удаляем файл с диска, если он существует
    if db_document.file_url:
        try:
            from pathlib import Path
            file_path = Path("uploads/documents") / Path(db_document.file_url).name
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Ошибка удаления файла: {e}")
    
    db.delete(db_document)
    db.commit()
    return True

def get_exam_by_id(db: Session, exam_id: int) -> Optional[models.ApplicantExam]:
    return db.query(models.ApplicantExam).filter(models.ApplicantExam.id == exam_id).first()

def get_exams(
    db: Session,
    applicant_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.ApplicantExam]:
    query = db.query(models.ApplicantExam)
    
    if applicant_id:
        query = query.filter(models.ApplicantExam.applicant_id == applicant_id)
    
    return query.offset(skip).limit(limit).all()

def create_exam(db: Session, exam: schemas.ApplicantExamCreate) -> models.ApplicantExam:
    db_exam = models.ApplicantExam(**exam.model_dump())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

def update_exam(
    db: Session, exam_id: int, exam: schemas.ApplicantExamUpdate
) -> Optional[models.ApplicantExam]:
    db_exam = get_exam_by_id(db, exam_id)
    if not db_exam:
        return None
    
    update_data = exam.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_exam, key, value)
    
    db.commit()
    db.refresh(db_exam)
    return db_exam

def delete_exam(db: Session, exam_id: int) -> bool:
    db_exam = get_exam_by_id(db, exam_id)
    if not db_exam:
        return False
    db.delete(db_exam)
    db.commit()
    return True

def get_applicant_statistics(db: Session) -> schemas.ApplicantStatistics:
    total_applicants = db.query(func.count(models.Applicant.id)).scalar() or 0
    
    new_applicants = db.query(func.count(models.Applicant.id)).filter(
        models.Applicant.status == "new"
    ).scalar() or 0
    
    contacted_applicants = db.query(func.count(models.Applicant.id)).filter(
        models.Applicant.status == "contacted"
    ).scalar() or 0
    
    documents_pending_applicants = db.query(func.count(models.Applicant.id)).filter(
        models.Applicant.status == "documents_pending"
    ).scalar() or 0
    
    enrolled_applicants = db.query(func.count(models.Applicant.id)).filter(
        models.Applicant.status == "enrolled"
    ).scalar() or 0
    
    rejected_applicants = db.query(func.count(models.Applicant.id)).filter(
        models.Applicant.status == "rejected"
    ).scalar() or 0
    
    applicants_by_program = {}
    program_data = db.query(
        models.Applicant.program, func.count(models.Applicant.id)
    ).group_by(models.Applicant.program).all()
    for program, count in program_data:
        if program:
            applicants_by_program[program] = count
    
    applicants_by_source = {}
    source_data = db.query(
        models.Applicant.source, func.count(models.Applicant.id)
    ).group_by(models.Applicant.source).all()
    for source, count in source_data:
        if source:
            applicants_by_source[source] = count
    
    return schemas.ApplicantStatistics(
        total_applicants=total_applicants,
        new_applicants=new_applicants,
        contacted_applicants=contacted_applicants,
        enrolled_applicants=enrolled_applicants,
        rejected_applicants=rejected_applicants,
        applicants_by_program=applicants_by_program,
        applicants_by_source=applicants_by_source
    )

# ============= ПРОГРАММЫ =============

def get_programs(
    db: Session,
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Program]:
    query = db.query(models.Program)
    
    if is_active is not None:
        query = query.filter(models.Program.is_active == is_active)
    
    return query.order_by(models.Program.name).offset(skip).limit(limit).all()

def get_program_by_id(db: Session, program_id: int) -> Optional[models.Program]:
    return db.query(models.Program).filter(models.Program.id == program_id).first()

def get_program_by_name(db: Session, name: str) -> Optional[models.Program]:
    return db.query(models.Program).filter(models.Program.name == name).first()

def create_program(db: Session, program: schemas.ProgramCreate) -> models.Program:
    db_program = models.Program(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

def update_program(
    db: Session, program_id: int, program: schemas.ProgramUpdate
) -> Optional[models.Program]:
    db_program = get_program_by_id(db, program_id)
    if not db_program:
        return None
    
    update_data = program.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_program, key, value)
    
    db_program.updated_at = datetime.now()
    db.commit()
    db.refresh(db_program)
    return db_program

def delete_program(db: Session, program_id: int) -> bool:
    db_program = get_program_by_id(db, program_id)
    if not db_program:
        return False
    db.delete(db_program)
    db.commit()
    return True

def get_grouped_applicants(
    db: Session,
    status: Optional[str] = None,
    program: Optional[str] = None,
    source: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[schemas.GroupedApplicant]:
    """
    Получить абитуриентов, сгруппированных по телефону и СНИЛС.
    Каждый абитуриент возвращается один раз со списком всех его программ.
    """
    # Получаем все записи абитуриентов
    query = db.query(models.Applicant)
    
    if status:
        query = query.filter(models.Applicant.status == status)
    if program:
        query = query.filter(models.Applicant.program == program)
    if source:
        query = query.filter(models.Applicant.source == source)
    
    all_applicants = query.order_by(models.Applicant.phone, models.Applicant.snils, models.Applicant.priority).all()
    
    # Группируем по телефону и СНИЛС
    grouped_dict: Dict[str, Dict] = {}
    
    for applicant in all_applicants:
        # Используем комбинацию телефона и СНИЛС как ключ
        key = f"{applicant.phone}_{applicant.snils}"
        
        if key not in grouped_dict:
            grouped_dict[key] = {
                "phone": applicant.phone,
                "snils": applicant.snils,
                "name": applicant.name,
                "email": applicant.email,
                "applicant_id": applicant.applicant_id,
                "max_user_id": applicant.max_user_id,
                "programs": []
            }
        
        # Добавляем программу в список
        program_data = schemas.ApplicantProgram(
            id=applicant.id,
            program=applicant.program,
            priority=applicant.priority,
            status=applicant.status,
            program_limit=applicant.program_limit,
            exam_results=applicant.exam_results,
            source=applicant.source,
            comments=applicant.comments,
            created_at=applicant.created_at,
            updated_at=applicant.updated_at
        )
        grouped_dict[key]["programs"].append(program_data)
    
    # Преобразуем в список GroupedApplicant
    grouped_list = [
        schemas.GroupedApplicant(**data) for data in grouped_dict.values()
    ]
    
    # Применяем пагинацию
    return grouped_list[skip:skip + limit]

def update_applicant_programs(
    db: Session,
    phone: str,
    programs: List[dict]
) -> List[models.Applicant]:
    """
    Обновить программы и приоритеты абитуриента.
    programs: список словарей вида [{"id": 1, "program": "Программа 1", "priority": 1}, ...]
    Если id отсутствует или равен null, создается новая запись.
    """
    # Проверка уникальности программ
    program_names = [p.get("program") for p in programs if p.get("program")]
    if len(program_names) != len(set(program_names)):
        raise ValueError("Программы должны быть уникальными для каждого абитуриента")
    
    # Проверка уникальности приоритетов
    priorities = [p.get("priority") for p in programs if p.get("priority") is not None]
    if len(priorities) != len(set(priorities)):
        raise ValueError("Приоритеты должны быть уникальными для каждого абитуриента")
    
    # Получаем первую существующую запись абитуриента для получения базовых данных
    existing_applicant = db.query(models.Applicant).filter(
        models.Applicant.phone == phone
    ).first()
    
    if not existing_applicant:
        raise ValueError(f"Абитуриент с телефоном {phone} не найден")
    
    # Получаем все существующие записи абитуриента
    all_existing_applicants = db.query(models.Applicant).filter(
        models.Applicant.phone == phone
    ).all()
    
    # Собираем ID программ, которые должны остаться
    programs_to_keep_ids = set()
    for program_data in programs:
        applicant_id = program_data.get("id")
        if applicant_id is not None and applicant_id != "null" and applicant_id != "":
            try:
                applicant_id_int = int(applicant_id) if isinstance(applicant_id, str) else applicant_id
                programs_to_keep_ids.add(applicant_id_int)
            except (ValueError, TypeError):
                pass
    
    # Удаляем программы, которых нет в новом списке
    for existing_applicant_record in all_existing_applicants:
        if existing_applicant_record.id not in programs_to_keep_ids:
            db.delete(existing_applicant_record)
    
    updated_applicants = []
    
    for program_data in programs:
        applicant_id = program_data.get("id")
        
        # Если есть ID (не None и не null) - обновляем существующую запись
        if applicant_id is not None and applicant_id != "null" and applicant_id != "":
            try:
                # Преобразуем ID в int, если это возможно
                applicant_id_int = int(applicant_id) if isinstance(applicant_id, str) else applicant_id
                applicant = get_applicant_by_id(db, applicant_id_int)
                if not applicant or applicant.phone != phone:
                    continue
            except (ValueError, TypeError):
                # Если ID не может быть преобразован в int, пропускаем эту запись
                continue
            
            # Проверка уникальности программы среди других записей этого абитуриента
            if "program" in program_data:
                existing = db.query(models.Applicant).filter(
                    models.Applicant.phone == phone,
                    models.Applicant.program == program_data["program"],
                    models.Applicant.id != applicant_id_int
                ).first()
                if existing:
                    raise ValueError(f"Программа '{program_data['program']}' уже существует у этого абитуриента")
            
            # Проверка уникальности приоритета среди других записей этого абитуриента
            if "priority" in program_data:
                existing = db.query(models.Applicant).filter(
                    models.Applicant.phone == phone,
                    models.Applicant.priority == program_data["priority"],
                    models.Applicant.id != applicant_id_int
                ).first()
                if existing:
                    raise ValueError(f"Приоритет {program_data['priority']} уже используется у этого абитуриента")
            
            # Обновляем программу и приоритет
            if "program" in program_data:
                applicant.program = program_data["program"]
            if "priority" in program_data:
                applicant.priority = program_data["priority"]
            if "status" in program_data:
                applicant.status = program_data["status"]
            
            applicant.updated_at = datetime.now()
            updated_applicants.append(applicant)
        
        # Если нет ID - создаем новую запись
        else:
            # Проверка уникальности программы перед созданием
            if "program" in program_data:
                existing = db.query(models.Applicant).filter(
                    models.Applicant.phone == phone,
                    models.Applicant.program == program_data["program"]
                ).first()
                if existing:
                    raise ValueError(f"Программа '{program_data['program']}' уже существует у этого абитуриента")
            
            # Проверка уникальности приоритета перед созданием
            if "priority" in program_data:
                existing = db.query(models.Applicant).filter(
                    models.Applicant.phone == phone,
                    models.Applicant.priority == program_data["priority"]
                ).first()
                if existing:
                    raise ValueError(f"Приоритет {program_data['priority']} уже используется у этого абитуриента")
            
            # Находим максимальные баллы из всех существующих записей абитуриента
            max_exam_results = db.query(func.max(models.Applicant.exam_results)).filter(
                models.Applicant.phone == phone
            ).scalar()
            
            # Создаем новую запись на основе существующей
            new_applicant = models.Applicant(
                applicant_id=str(uuid.uuid4())[:8].upper(),
                max_user_id=existing_applicant.max_user_id,
                name=existing_applicant.name,
                phone=existing_applicant.phone,
                email=existing_applicant.email,
                snils=existing_applicant.snils,
                program=program_data.get("program", ""),
                priority=program_data.get("priority", 1),
                status=program_data.get("status", "new"),
                source=existing_applicant.source or "bot",
                program_limit=None,
                exam_results=max_exam_results,  # Копируем максимальные баллы из существующих записей
                comments=None,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            db.add(new_applicant)
            updated_applicants.append(new_applicant)
    
    db.commit()
    
    # Обновляем объекты в сессии
    for applicant in updated_applicants:
        db.refresh(applicant)
    
    return updated_applicants

