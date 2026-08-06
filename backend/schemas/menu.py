from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class RestaurantResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    logo_url: Optional[str] = None
    rating: Optional[float] = None
    is_open: Optional[bool] = True
    created_at: Optional[datetime] = None
    # Enriched from restaurant_hours (list/detail endpoints)
    is_open_now: Optional[bool] = None
    hours_status: Optional[str] = None
    operating_hours_text: Optional[str] = None
    avg_delivery_minutes: Optional[int] = None
    business_type: Optional[str] = None

    class Config:
        from_attributes = True


class PlatformCategoryResponse(BaseModel):
    id: UUID
    business_type: str
    slug: str
    name: str
    sort_order: int = 0

    class Config:
        from_attributes = True


class MenuItemResponse(BaseModel):
    id: UUID
    menu_id: Optional[UUID] = None
    restaurant_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: Optional[bool] = True
    created_at: Optional[datetime] = None
    delivery_time: Optional[int] = None  # in minutes
    # Platform category slug (from platform_categories via platform_category_id)
    category: Optional[str] = None
    vendor_category: Optional[str] = None
    platform_category_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class MenuItemWithRestaurant(BaseModel):
    """Catalog item with store name included."""

    id: UUID
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: Optional[bool] = True
    restaurant_name: Optional[str] = None
    restaurant_id: Optional[UUID] = None
    delivery_time: Optional[int] = None
    category: Optional[str] = None
    vendor_category: Optional[str] = None
    platform_category_id: Optional[UUID] = None

    class Config:
        from_attributes = True
