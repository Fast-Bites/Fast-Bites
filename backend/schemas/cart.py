from pydantic import BaseModel, Field, model_validator
from typing import Any, Dict, List, Optional


class CartItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    image: Optional[str] = None
    section: Optional[str] = None
    product_id: Optional[str] = None
    # Legacy alias for older clients
    menu_item_id: Optional[str] = None
    options_json: Dict[str, Any] = Field(default_factory=dict)


class RestaurantCartGroup(BaseModel):
    id: str
    name: str
    logo: Optional[str] = None
    items: List[CartItemResponse]


class CartListResponse(BaseModel):
    orders: List[RestaurantCartGroup]


class CartItemCreate(BaseModel):
    restaurant_id: str
    product_id: Optional[str] = None
    menu_item_id: Optional[str] = None  # legacy alias
    name: str
    description: Optional[str] = None
    unit_price: float = Field(gt=0)
    quantity: int = Field(default=1, ge=1)
    image_url: Optional[str] = None
    section: Optional[str] = None
    options_json: Dict[str, Any] = {}
    special_instructions: Optional[str] = None

    @model_validator(mode="after")
    def prefer_product_id(self):
        if not self.product_id and self.menu_item_id:
            self.product_id = self.menu_item_id
        return self


class CartItemQuantityUpdate(BaseModel):
    quantity: int = Field(ge=1)
