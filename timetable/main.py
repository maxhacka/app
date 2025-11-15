from typing import List, Optional
from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import schemas
import crud
from database import get_db, init_db
from init_data import init_test_data
from auth_dependency import get_current_user

app = FastAPI(title="Timetable Service", version="1.0.0")

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
    print("✅ Timetable Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "timetable", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/timetable/schedule", response_model=List[schemas.Schedule])
async def get_schedules(
    group_name: Optional[str] = None,
    day_of_week: Optional[str] = None,
    teacher_id: Optional[int] = None,
    date_created_on: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_schedules(
        db,
        group_name=group_name,
        day_of_week=day_of_week,
        teacher_id=teacher_id,
        date_created_on=date_created_on,
        skip=skip,
        limit=limit
    )

@app.get("/api/timetable/schedule/{schedule_id}", response_model=schemas.Schedule)
async def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    schedule = crud.get_schedule_by_id(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@app.post("/api/timetable/schedule", response_model=schemas.Schedule)
async def create_schedule(
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_schedule(db, schedule)

@app.put("/api/timetable/schedule/{schedule_id}", response_model=schemas.Schedule)
async def update_schedule(
    schedule_id: int,
    schedule: schemas.ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_schedule(db, schedule_id, schedule)
    if not updated:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return updated

@app.delete("/api/timetable/schedule/{schedule_id}")
async def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_schedule(db, schedule_id):
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted successfully"}

@app.get("/api/timetable/templates", response_model=List[schemas.ScheduleTemplate])
async def get_templates(
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_templates(db, is_active=is_active, skip=skip, limit=limit)

@app.get("/api/timetable/templates/{template_id}", response_model=schemas.ScheduleTemplate)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    template = crud.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@app.post("/api/timetable/templates", response_model=schemas.ScheduleTemplate)
async def create_template(
    template: schemas.ScheduleTemplateCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_template(db, template)

@app.put("/api/timetable/templates/{template_id}", response_model=schemas.ScheduleTemplate)
async def update_template(
    template_id: int,
    template: schemas.ScheduleTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_template(db, template_id, template)
    if not updated:
        raise HTTPException(status_code=404, detail="Template not found")
    return updated

@app.delete("/api/timetable/templates/{template_id}")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_template(db, template_id):
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template deleted successfully"}

@app.get("/api/timetable/changes", response_model=List[schemas.ScheduleChange])
async def get_changes(
    schedule_id: Optional[int] = None,
    date_from: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_changes(
        db,
        schedule_id=schedule_id,
        date_from=date_from,
        skip=skip,
        limit=limit
    )

@app.get("/api/timetable/changes/{change_id}", response_model=schemas.ScheduleChange)
async def get_change(
    change_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    change = crud.get_change_by_id(db, change_id)
    if not change:
        raise HTTPException(status_code=404, detail="Change not found")
    return change

@app.post("/api/timetable/changes", response_model=schemas.ScheduleChange)
async def create_change(
    change: schemas.ScheduleChangeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_change(db, change)

@app.put("/api/timetable/changes/{change_id}", response_model=schemas.ScheduleChange)
async def update_change(
    change_id: int,
    change: schemas.ScheduleChangeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_change(db, change_id, change)
    if not updated:
        raise HTTPException(status_code=404, detail="Change not found")
    return updated

@app.delete("/api/timetable/changes/{change_id}")
async def delete_change(
    change_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_change(db, change_id):
        raise HTTPException(status_code=404, detail="Change not found")
    return {"message": "Change deleted successfully"}

# ============= ГРУППЫ =============

@app.get("/api/timetable/groups", response_model=List[schemas.Group])
async def get_groups(
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_groups(db, is_active=is_active, skip=skip, limit=limit)

@app.get("/api/timetable/groups/{group_id}", response_model=schemas.Group)
async def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    group = crud.get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@app.post("/api/timetable/groups", response_model=schemas.Group)
async def create_group(
    group: schemas.GroupCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Проверяем, не существует ли уже группа с таким именем
    existing_group = crud.get_group_by_name(db, group.name)
    if existing_group:
        raise HTTPException(status_code=400, detail="Group with this name already exists")
    return crud.create_group(db, group)

@app.put("/api/timetable/groups/{group_id}", response_model=schemas.Group)
async def update_group(
    group_id: int,
    group: schemas.GroupUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Если обновляется имя, проверяем уникальность
    if group.name:
        existing_group = crud.get_group_by_name(db, group.name)
        if existing_group and existing_group.id != group_id:
            raise HTTPException(status_code=400, detail="Group with this name already exists")
    
    updated = crud.update_group(db, group_id, group)
    if not updated:
        raise HTTPException(status_code=404, detail="Group not found")
    return updated

@app.delete("/api/timetable/groups/{group_id}")
async def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_group(db, group_id):
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

# ============= ПРЕДМЕТЫ =============

@app.get("/api/timetable/subjects", response_model=List[schemas.Subject])
async def get_subjects(
    is_active: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_subjects(db, is_active=is_active, skip=skip, limit=limit)

@app.get("/api/timetable/subjects/{subject_id}", response_model=schemas.Subject)
async def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    subject = crud.get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@app.post("/api/timetable/subjects", response_model=schemas.Subject)
async def create_subject(
    subject: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Проверяем, не существует ли уже предмет с таким именем
    existing_subject = crud.get_subject_by_name(db, subject.name)
    if existing_subject:
        raise HTTPException(status_code=400, detail="Subject with this name already exists")
    return crud.create_subject(db, subject)

@app.put("/api/timetable/subjects/{subject_id}", response_model=schemas.Subject)
async def update_subject(
    subject_id: int,
    subject: schemas.SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Если обновляется имя, проверяем уникальность
    if subject.name:
        existing_subject = crud.get_subject_by_name(db, subject.name)
        if existing_subject and existing_subject.id != subject_id:
            raise HTTPException(status_code=400, detail="Subject with this name already exists")
    
    updated = crud.update_subject(db, subject_id, subject)
    if not updated:
        raise HTTPException(status_code=404, detail="Subject not found")
    return updated

@app.delete("/api/timetable/subjects/{subject_id}")
async def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not crud.delete_subject(db, subject_id):
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)

