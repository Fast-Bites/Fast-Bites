from pydantic import BaseModel
from typing import List, Optional


class RestaurantHoursDay(BaseModel):
    day_of_week: int
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    is_closed: bool


class RestaurantHoursResponse(BaseModel):
    days: List[RestaurantHoursDay]


class MenuItemCategoryResponse(BaseModel):
    id: str
    name: str
    price: float
    image: Optional[str] = None
    delivery_minutes: Optional[int] = None
    description: Optional[str] = None


class ModifierOptionResponse(BaseModel):
    id: str
    label: str
    price_delta: float


class ModifierGroupResponse(BaseModel):
    id: str
    name: str
    options: List[ModifierOptionResponse]


class MenuItemModifiersResponse(BaseModel):
    groups: List[ModifierGroupResponse]
