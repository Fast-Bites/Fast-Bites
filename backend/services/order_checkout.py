"""Create orders from cart and confirm checkout with tracking steps."""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.cart import CartItem
from models.order import Order, OrderItem, OrderTrackingStep

DEFAULT_DELIVERY_FEE = 1500.0
DEFAULT_ESTIMATED_MINUTES = 20

TRACKING_STEP_TEMPLATE = [
    (1, "Order confirmed", "Your order has been received.", True, False),
    (2, "Preparing your meal", "The restaurant is preparing your order.", False, False),
    (3, "Out for delivery", "Your rider is on the way.", False, True),
    (4, "Delivered", "Enjoy your meal!", False, False),
]


async def create_order_from_cart(
    db: AsyncSession,
    user_id: UUID,
    restaurant_id: UUID,
) -> Order:
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id, CartItem.restaurant_id == restaurant_id)
        .order_by(CartItem.created_at)
    )
    cart_rows = result.scalars().all()
    if not cart_rows:
        raise ValueError("No items in cart for this restaurant")

    subtotal = sum(float(row.unit_price) * int(row.quantity) for row in cart_rows)
    delivery_fee = DEFAULT_DELIVERY_FEE
    total = subtotal + delivery_fee
    now = datetime.now(timezone.utc)

    order = Order(
        user_id=user_id,
        restaurant_id=restaurant_id,
        status="pending",
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total_amount=total,
        estimated_delivery_minutes=DEFAULT_ESTIMATED_MINUTES,
        created_at=now,
        updated_at=now,
    )
    db.add(order)
    await db.flush()

    for row in cart_rows:
        db.add(
            OrderItem(
                order_id=order.id,
                menu_item_id=row.menu_item_id,
                quantity=row.quantity,
                price_at_order=row.unit_price,
                unit_price=row.unit_price,
                name=row.name,
                description=row.description,
                image_url=row.image_url,
                options_json=row.options_json or {},
                created_at=now,
            )
        )

    await db.execute(
        delete(CartItem).where(
            CartItem.user_id == user_id,
            CartItem.restaurant_id == restaurant_id,
        )
    )
    await db.commit()
    await db.refresh(order)
    return order


async def confirm_order_checkout(
    db: AsyncSession,
    user_id: UUID,
    order_id: UUID,
) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise ValueError("Order not found")
    if (order.status or "").lower() != "pending":
        raise ValueError("Order is not awaiting checkout")

    now = datetime.now(timezone.utc)
    order.status = "confirmed"
    order.updated_at = now

    for step_order, label, description, completed, show_view in TRACKING_STEP_TEMPLATE:
        db.add(
            OrderTrackingStep(
                order_id=order.id,
                step_order=step_order,
                label=label,
                description=description,
                is_completed=completed,
                completed_at=now if completed else None,
                show_view_action=show_view,
            )
        )

    await db.commit()
    await db.refresh(order)
    return order
