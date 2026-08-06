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
    business_id: UUID
    business_verified: bool
    verification_submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BusinessRegistrationSummary(BaseModel):
    business_id: UUID
    business_name: str
    business_type: str
    business_verified: bool
    verification_stage: str
    documents_submitted: bool
    documentation_skipped: bool = False
    catalog_setup_completed: bool = False

    class Config:
        from_attributes = True


class VerificationDocumentsRequest(BaseModel):
    documents: dict[str, str] = Field(min_length=1)


class VendorImageUploadResponse(BaseModel):
    url: str
    public_id: str


class CatalogModifierOption(BaseModel):
    label: str = Field(min_length=1)
    price_delta: float = 0


class CatalogModifierGroup(BaseModel):
    """group is protein | extras | size (sauces belong under extras)."""

    group: str = Field(min_length=1)
    options: list[CatalogModifierOption] = Field(default_factory=list)


class CatalogItemCreate(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)
    platform_category_id: Optional[UUID] = None
    vendor_category: Optional[str] = None
    delivery_time: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = None
    image_url: Optional[str] = None
    portion_size: Optional[str] = None
    modifiers: list[CatalogModifierGroup] = Field(default_factory=list)


class CatalogItemsCreateRequest(BaseModel):
    items: list[CatalogItemCreate] = Field(min_length=1)


class CatalogItemsCreateResponse(BaseModel):
    created_count: int
    skipped_count: int = 0
    item_ids: list[UUID]
    message: Optional[str] = None


class CatalogExtractedItem(BaseModel):
    name: str
    price: float
    vendor_category: Optional[str] = None
    portion_size: Optional[str] = None
    delivery_time: Optional[int] = None
    modifiers: list[CatalogModifierGroup] = Field(default_factory=list)


class CatalogExtractResponse(BaseModel):
    items: list[CatalogExtractedItem]
    provider: str
    item_count: int = 0
    modifiers_count: int = 0
    message: Optional[str] = None
