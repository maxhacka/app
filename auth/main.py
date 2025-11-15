from datetime import timedelta, datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import crud
import auth_utils
from database import get_db, init_db
from init_data import init_test_data

app = FastAPI(title="Auth Service", version="1.0.0")

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
    print("✅ Auth Service: Database initialized")

@app.get("/")
async def root():
    return {"service": "auth", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/auth/login", response_model=schemas.LoginResponse)
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    admin = auth_utils.authenticate_admin(db, login_data.username, login_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.now() + access_token_expires
    
    access_token = auth_utils.create_access_token(
        data={
            "sub": admin.username,
            "user_id": admin.id,
            "user_type": "admin"
        },
        expires_delta=access_token_expires
    )
    
    session_create = schemas.SessionCreate(
        user_id=admin.id,
        user_type="admin",
        token=access_token,
        expires_at=expires_at
    )
    crud.create_session(db, session_create)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": admin
    }

@app.post("/api/auth/logout")
async def logout(token: str, db: Session = Depends(get_db)):
    crud.delete_session(db, token)
    return {"message": "Logged out successfully"}

@app.post("/api/auth/verify", response_model=schemas.VerifyTokenResponse)
async def verify_token(request: schemas.VerifyTokenRequest, db: Session = Depends(get_db)):
    token_data = auth_utils.verify_token(request.token)
    
    if not token_data:
        return schemas.VerifyTokenResponse(valid=False)
    
    session = crud.get_session_by_token(db, request.token)
    if not session or session.expires_at < datetime.now():
        return schemas.VerifyTokenResponse(valid=False)
    
    return schemas.VerifyTokenResponse(
        valid=True,
        user_id=token_data.user_id,
        user_type=token_data.user_type,
        username=token_data.username
    )

@app.post("/api/auth/refresh", response_model=schemas.Token)
async def refresh_token(token: str, db: Session = Depends(get_db)):
    token_data = auth_utils.verify_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    crud.delete_session(db, token)
    
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.now() + access_token_expires
    
    new_token = auth_utils.create_access_token(
        data={
            "sub": token_data.username,
            "user_id": token_data.user_id,
            "user_type": token_data.user_type
        },
        expires_delta=access_token_expires
    )
    
    session_create = schemas.SessionCreate(
        user_id=token_data.user_id,
        user_type=token_data.user_type,
        token=new_token,
        expires_at=expires_at
    )
    crud.create_session(db, session_create)
    
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "expires_in": auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.get("/api/admins", response_model=List[schemas.Admin])
async def get_admins(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_admins(db, skip=skip, limit=limit)

@app.get("/api/admins/{admin_id}", response_model=schemas.Admin)
async def get_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = crud.get_admin_by_id(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

@app.post("/api/admins", response_model=schemas.Admin)
async def create_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    existing = crud.get_admin_by_username(db, admin.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = auth_utils.get_password_hash(admin.password)
    return crud.create_admin(db, admin, hashed_password)

@app.put("/api/admins/{admin_id}", response_model=schemas.Admin)
async def update_admin(
    admin_id: int,
    admin: schemas.AdminUpdate,
    db: Session = Depends(get_db)
):
    hashed_password = None
    if admin.password:
        hashed_password = auth_utils.get_password_hash(admin.password)
    
    updated = crud.update_admin(db, admin_id, admin, hashed_password)
    if not updated:
        raise HTTPException(status_code=404, detail="Admin not found")
    return updated

@app.delete("/api/admins/{admin_id}")
async def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    if not crud.delete_admin(db, admin_id):
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin deleted successfully"}

@app.delete("/api/sessions/cleanup")
async def cleanup_sessions(db: Session = Depends(get_db)):
    count = crud.delete_expired_sessions(db)
    return {"message": f"Deleted {count} expired sessions"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

