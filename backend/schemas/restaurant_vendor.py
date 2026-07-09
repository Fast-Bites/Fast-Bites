from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class BusinessRegistrationRequest(BaseModel):
    business_name: str = Field(min_length=1)
    business_owner: str = Field(min_length=1)
    business_type: str = Field(min_length=1)
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_holder_name: Optional[str] = None


class BusinessRegistrationResponse(BaseModel):
    restaurant_id: UUID
    business_verified: bool
    verification_submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BusinessRegistrationSummary(BaseModel):
    restaurant_id: UUID
    business_name: str
    business_type: str
    business_verified: bool
    verification_stage: str
    documents_submitted: bool

    class Config:
        from_attributes = True


class VerificationDocumentsRequest(BaseModel):
    documents: dict[str, str] = Field(min_length=1)


class RestaurantImageUploadResponse(BaseModel):
    url: str
    public_id: str
