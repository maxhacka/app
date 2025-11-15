from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas

def get_event_by_id(db: Session, event_id: int) -> Optional[models.Event]:
    return db.query(models.Event).filter(models.Event.id == event_id).first()

def get_events(
    db: Session,
    category: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Event]:
    query = db.query(models.Event)
    
    if category:
        query = query.filter(models.Event.category == category)
    if status:
        query = query.filter(models.Event.status == status)
    if date_from:
        query = query.filter(models.Event.date >= date_from)
    if date_to:
        query = query.filter(models.Event.date <= date_to)
    
    return query.order_by(models.Event.date).offset(skip).limit(limit).all()

def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    db_event = models.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def update_event(
    db: Session, event_id: int, event: schemas.EventUpdate
) -> Optional[models.Event]:
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return None
    
    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db_event.updated_at = datetime.now()
    db.commit()
    db.refresh(db_event)
    return db_event

def delete_event(db: Session, event_id: int) -> bool:
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return False
    db.delete(db_event)
    db.commit()
    return True

def get_event_statistics(db: Session) -> schemas.EventStatistics:
    total_events = db.query(func.count(models.Event.id)).scalar() or 0

    published_events = db.query(func.count(models.Event.id)).filter(
        models.Event.status == "published"
    ).scalar() or 0

    completed_events = db.query(func.count(models.Event.id)).filter(
        models.Event.status == "completed"
    ).scalar() or 0

    events_by_category = {}
    category_data = db.query(
        models.Event.category, func.count(models.Event.id)
    ).group_by(models.Event.category).all()
    for category, count in category_data:
        if category:
            events_by_category[category] = count

    return schemas.EventStatistics(
        total_events=total_events,
        published_events=published_events,
        completed_events=completed_events,
        events_by_category=events_by_category,
    )

