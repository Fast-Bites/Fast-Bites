from pydantic import BaseModel
from datetime import date
from uuid import UUID
from typing import Optional, List

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    dob: Optional[date] = None
    role: str = "customer"

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[date] = None
    role: Optional[str] = None
    profile_image: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    dob: Optional[date]
    google_id: Optional[str]
    role: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    restaurant_id: Optional[UUID] = None
    business_verified: Optional[bool] = None
    verification_stage: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserRolesResponse(BaseModel):
    roles: List[str]
