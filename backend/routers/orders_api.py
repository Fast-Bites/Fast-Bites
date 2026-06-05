import logging
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.order import Order, OrderItem, OrderTrackingStep
from models.restaurant import Restaurant
from schemas.orders_api import (
    ConfirmOrderResponse,
    CreateOrderFromCartRequest,
    CreateOrderFromCartResponse,
    OrderSummaryResponse,
    OrderTabItemResponse,
    OngoingOrderResponse,
    TrackingStepResponse,
)
from services.jwt_auth import get_current_user
from services.order_checkout import confirm_order_checkout, create_order_from_cart

log = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["orders"])

ACTIVE_STATUSES = ("pending", "confirmed", "preparing", "in_transit")
ONGOING_STATUSES = ("confirmed", "preparing", "in_transit")


def format_step_time(completed_at: datetime | None, completed: bool) -> str:
    if completed and completed_at:
        t = completed_at.strftime("%I:%M%p").lstrip("0").lower()
        return t
    return "-:--"


@router.get("/summary", response_model=OrderSummaryResponse)
async def order_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        order_result = await db.execute(
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc().nulls_last())
            .limit(5)
        )
        orders = order_result.scalars().all()

        tab_items: list[OrderTabItemResponse] = []
        delivery_fee = 1500.0
        ongoing: OngoingOrderResponse | None = None
        pending_order_id: str | None = None

        for order in orders:
            status = (order.status or "").lower()
            if status == "pending" and pending_order_id is None:
                pending_order_id = str(order.id)
            if status in ACTIVE_STATUSES and not tab_items:
                rest_name = ""
                if order.restaurant_id:
                    r = await db.get(Restaurant, order.restaurant_id)
                    rest_name = r.name if r else ""
                items_result = await db.execute(
                    select(OrderItem).where(OrderItem.order_id == order.id)
                )
                for oi in items_result.scalars().all():
                    tab_items.append(
                        OrderTabItemResponse(
                            id=str(oi.id),
                            name=oi.name or "Item",
                            description=oi.description,
                            price=float(oi.unit_price or oi.price_at_order or 0),
                            quantity=int(oi.quantity or 1),
                            image=oi.image_url,
                            restaurant=rest_name,
                        )
                    )
                if order.delivery_fee is not None:
                    delivery_fee = float(order.delivery_fee)

            if status in ONGOING_STATUSES and ongoing is None:
                steps_result = await db.execute(
                    select(OrderTrackingStep)
                    .where(OrderTrackingStep.order_id == order.id)
                    .order_by(OrderTrackingStep.step_order)
                )
                steps = [
                    TrackingStepResponse(
                        label=s.label,
                        description=s.description,
                        time=format_step_time(s.completed_at, s.is_completed),
                        completed=bool(s.is_completed),
                        show_view=bool(s.show_view_action),
                    )
                    for s in steps_result.scalars().all()
                ]
                mins = order.estimated_delivery_minutes or 20
                ongoing = OngoingOrderResponse(
                    order_id=str(order.id),
                    delivery_time=f"{mins} mins",
                    steps=steps,
                )

        return OrderSummaryResponse(
            items=tab_items,
            delivery_fee=delivery_fee,
            ongoing=ongoing,
            pending_order_id=pending_order_id,
        )
    except Exception as e:
        log.error("Order summary failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load orders")


@router.post("/from-cart", response_model=CreateOrderFromCartResponse)
async def create_order_from_cart_route(
    body: CreateOrderFromCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        restaurant_id = UUID(body.restaurant_id)
        order = await create_order_from_cart(db, user_id, restaurant_id)
        return CreateOrderFromCartResponse(order_id=str(order.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log.error("Create order from cart failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create order")


@router.post("/{order_id}/checkout", response_model=ConfirmOrderResponse)
async def confirm_order_route(
    order_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        order = await confirm_order_checkout(db, user_id, order_id)
        return ConfirmOrderResponse(order_id=str(order.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log.error("Confirm order failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to confirm order")
