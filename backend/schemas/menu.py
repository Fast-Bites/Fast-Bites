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
    rating: Optional[float] = None
    is_open: Optional[bool] = True
    created_at: Optional[datetime] = None

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

    class Config:
        from_attributes = True


class MenuItemWithRestaurant(BaseModel):
    """Menu item with restaurant name included"""
    id: UUID
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: Optional[bool] = True
    restaurant_name: Optional[str] = None
    restaurant_id: Optional[UUID] = None
    delivery_time: Optional[int] = None  # in minutes

    class Config:
        from_attributes = True

