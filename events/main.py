from typing import List, Optional
from datetime import date
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
from database import get_db, init_db
from init_data import init_test_data
from auth_dependency import get_current_user

app = FastAPI(title="Events Service", version="1.0.0")

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
    print("✅ Events Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "events", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/events/events", response_model=List[schemas.Event])
async def get_events(
    category: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_events(
        db,
        category=category,
        status=status,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )

@app.get("/api/events/events/{event_id}", response_model=schemas.Event)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.post("/api/events/events", response_model=schemas.Event)
async def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    return crud.create_event(db, event)

@app.put("/api/events/events/{event_id}", response_model=schemas.Event)
async def update_event(
    event_id: int,
    event: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    updated = crud.update_event(db, event_id, event)
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated

@app.delete("/api/events/events/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    if not crud.delete_event(db, event_id):
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

@app.get("/api/events/statistics", response_model=schemas.EventStatistics)
async def get_statistics(db: Session = Depends(get_db)):
    return crud.get_event_statistics(db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
