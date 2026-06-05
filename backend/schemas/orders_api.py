from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class OrderTabItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    image: Optional[str] = None
    restaurant: str
    options_json: Dict[str, Any] = Field(default_factory=dict)


class TrackingStepResponse(BaseModel):
    label: str
    description: str
    time: str
    completed: bool
    show_view: bool = False


class OngoingOrderResponse(BaseModel):
    order_id: str
    delivery_time: str
    steps: List[TrackingStepResponse]


class OrderSummaryResponse(BaseModel):
    items: List[OrderTabItemResponse]
    delivery_fee: float
    ongoing: Optional[OngoingOrderResponse] = None
    pending_order_id: Optional[str] = None


class CreateOrderFromCartRequest(BaseModel):
    restaurant_id: str


class CreateOrderFromCartResponse(BaseModel):
    order_id: str


class ConfirmOrderResponse(BaseModel):
    order_id: str
    ok: bool = True
