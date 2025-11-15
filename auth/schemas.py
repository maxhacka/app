from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AdminBase(BaseModel):
    username: str
    name: str
    role: str = "admin"

class AdminCreate(AdminBase):
    password: str

class AdminUpdate(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class Admin(AdminBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    user_type: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: Admin

class SessionCreate(BaseModel):
    user_id: int
    user_type: str
    token: str
    expires_at: datetime

class Session(BaseModel):
    id: int
    user_id: int
    user_type: str
    token: str
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class VerifyTokenRequest(BaseModel):
    token: str

class VerifyTokenResponse(BaseModel):
    valid: bool
    user_id: Optional[int] = None
    user_type: Optional[str] = None
    username: Optional[str] = None

