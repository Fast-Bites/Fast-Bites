from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class CartItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    image: Optional[str] = None
    section: Optional[str] = None
    menu_item_id: Optional[str] = None


class RestaurantCartGroup(BaseModel):
    id: str
    name: str
    logo: Optional[str] = None
    items: List[CartItemResponse]


class CartListResponse(BaseModel):
    orders: List[RestaurantCartGroup]


class CartItemCreate(BaseModel):
    restaurant_id: str
    menu_item_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    unit_price: float = Field(gt=0)
    quantity: int = Field(default=1, ge=1)
    image_url: Optional[str] = None
    section: Optional[str] = None
    options_json: Dict[str, Any] = {}
    special_instructions: Optional[str] = None


class CartItemQuantityUpdate(BaseModel):
    quantity: int = Field(ge=1)
