from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session
import models
import schemas

def get_schedule_by_id(db: Session, schedule_id: int) -> Optional[models.Schedule]:
    return db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()

def get_schedules(
    db: Session,
    group_name: Optional[str] = None,
    day_of_week: Optional[str] = None,
    teacher_id: Optional[int] = None,
    date_created_on: Optional[date] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Schedule]:
    query = db.query(models.Schedule)
    
    if group_name:
        query = query.filter(models.Schedule.group_name == group_name)
    if day_of_week:
        query = query.filter(models.Schedule.day_of_week == day_of_week)
    if teacher_id:
        query = query.filter(models.Schedule.teacher_id == teacher_id)
    if date_created_on:
        query = query.filter(models.Schedule.date_created_on == date_created_on)
    
    return query.offset(skip).limit(limit).all()

def create_schedule(db: Session, schedule: schemas.ScheduleCreate) -> models.Schedule:
    db_schedule = models.Schedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(
    db: Session, schedule_id: int, schedule: schemas.ScheduleUpdate
) -> Optional[models.Schedule]:
    db_schedule = get_schedule_by_id(db, schedule_id)
    if not db_schedule:
        return None
    
    update_data = schedule.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_schedule, key, value)
    
    db_schedule.updated_at = datetime.now()
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: int) -> bool:
    db_schedule = get_schedule_by_id(db, schedule_id)
    if not db_schedule:
        return False
    db.delete(db_schedule)
    db.commit()
    return True

def get_template_by_id(db: Session, template_id: int) -> Optional[models.ScheduleTemplate]:
    return db.query(models.ScheduleTemplate).filter(models.ScheduleTemplate.id == template_id).first()

def get_templates(
    db: Session,
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.ScheduleTemplate]:
    query = db.query(models.ScheduleTemplate)
    
    if is_active is not None:
        query = query.filter(models.ScheduleTemplate.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def create_template(db: Session, template: schemas.ScheduleTemplateCreate) -> models.ScheduleTemplate:
    db_template = models.ScheduleTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_template(
    db: Session, template_id: int, template: schemas.ScheduleTemplateUpdate
) -> Optional[models.ScheduleTemplate]:
    db_template = get_template_by_id(db, template_id)
    if not db_template:
        return None
    
    update_data = template.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_template, key, value)
    
    db_template.updated_at = datetime.now()
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_id: int) -> bool:
    db_template = get_template_by_id(db, template_id)
    if not db_template:
        return False
    db.delete(db_template)
    db.commit()
    return True

def get_change_by_id(db: Session, change_id: int) -> Optional[models.ScheduleChange]:
    return db.query(models.ScheduleChange).filter(models.ScheduleChange.id == change_id).first()

def get_changes(
    db: Session,
    schedule_id: Optional[int] = None,
    date_from: Optional[date] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.ScheduleChange]:
    query = db.query(models.ScheduleChange)
    
    if schedule_id:
        query = query.filter(models.ScheduleChange.schedule_id == schedule_id)
    if date_from:
        query = query.filter(models.ScheduleChange.date >= date_from)
    
    return query.order_by(models.ScheduleChange.date).offset(skip).limit(limit).all()

def create_change(db: Session, change: schemas.ScheduleChangeCreate) -> models.ScheduleChange:
    db_change = models.ScheduleChange(**change.model_dump())
    db.add(db_change)
    db.commit()
    db.refresh(db_change)
    return db_change

def update_change(
    db: Session, change_id: int, change: schemas.ScheduleChangeUpdate
) -> Optional[models.ScheduleChange]:
    db_change = get_change_by_id(db, change_id)
    if not db_change:
        return None
    
    update_data = change.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_change, key, value)
    
    db.commit()
    db.refresh(db_change)
    return db_change

def delete_change(db: Session, change_id: int) -> bool:
    db_change = get_change_by_id(db, change_id)
    if not db_change:
        return False
    db.delete(db_change)
    db.commit()
    return True

# ============= ГРУППЫ =============

def get_group_by_id(db: Session, group_id: int) -> Optional[models.Group]:
    return db.query(models.Group).filter(models.Group.id == group_id).first()

def get_group_by_name(db: Session, name: str) -> Optional[models.Group]:
    return db.query(models.Group).filter(models.Group.name == name).first()

def get_groups(
    db: Session,
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Group]:
    query = db.query(models.Group)
    
    if is_active is not None:
        query = query.filter(models.Group.is_active == is_active)
    
    return query.order_by(models.Group.name).offset(skip).limit(limit).all()

def create_group(db: Session, group: schemas.GroupCreate) -> models.Group:
    db_group = models.Group(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def update_group(
    db: Session, group_id: int, group: schemas.GroupUpdate
) -> Optional[models.Group]:
    db_group = get_group_by_id(db, group_id)
    if not db_group:
        return None
    
    update_data = group.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_group, key, value)
    
    db_group.updated_at = datetime.now()
    db.commit()
    db.refresh(db_group)
    return db_group

def delete_group(db: Session, group_id: int) -> bool:
    db_group = get_group_by_id(db, group_id)
    if not db_group:
        return False
    db.delete(db_group)
    db.commit()
    return True

# ============= ПРЕДМЕТЫ =============

def get_subject_by_id(db: Session, subject_id: int) -> Optional[models.Subject]:
    return db.query(models.Subject).filter(models.Subject.id == subject_id).first()

def get_subject_by_name(db: Session, name: str) -> Optional[models.Subject]:
    return db.query(models.Subject).filter(models.Subject.name == name).first()

def get_subjects(
    db: Session,
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Subject]:
    query = db.query(models.Subject)
    
    if is_active is not None:
        query = query.filter(models.Subject.is_active == is_active)
    
    return query.order_by(models.Subject.name).offset(skip).limit(limit).all()

def create_subject(db: Session, subject: schemas.SubjectCreate) -> models.Subject:
    db_subject = models.Subject(**subject.model_dump())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def update_subject(
    db: Session, subject_id: int, subject: schemas.SubjectUpdate
) -> Optional[models.Subject]:
    db_subject = get_subject_by_id(db, subject_id)
    if not db_subject:
        return None
    
    update_data = subject.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subject, key, value)
    
    db_subject.updated_at = datetime.now()
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int) -> bool:
    db_subject = get_subject_by_id(db, subject_id)
    if not db_subject:
        return False
    db.delete(db_subject)
    db.commit()
    return True

