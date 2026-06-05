import logging
from collections import defaultdict
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.cart import CartItem
from models.restaurant import Restaurant
from schemas.cart import (
    CartListResponse,
    RestaurantCartGroup,
    CartItemResponse,
    CartItemCreate,
    CartItemQuantityUpdate,
)
from services.jwt_auth import get_current_user

log = logging.getLogger(__name__)
router = APIRouter(prefix="/cart", tags=["cart"])


def item_to_response(row: CartItem) -> CartItemResponse:
    return CartItemResponse(
        id=str(row.id),
        name=row.name,
        description=row.description,
        price=float(row.unit_price),
        quantity=int(row.quantity),
        image=row.image_url,
        section=row.section,
        menu_item_id=str(row.menu_item_id) if row.menu_item_id else None,
        options_json=row.options_json or {},
    )


@router.get("", response_model=CartListResponse)
async def list_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        result = await db.execute(
            select(CartItem, Restaurant.name, Restaurant.image_url)
            .join(Restaurant, CartItem.restaurant_id == Restaurant.id)
            .where(CartItem.user_id == user_id)
            .order_by(CartItem.restaurant_id, CartItem.created_at)
        )
        rows = result.all()
        groups: dict[str, RestaurantCartGroup] = {}
        for cart_row, rest_name, rest_image in rows:
            rid = str(cart_row.restaurant_id)
            if rid not in groups:
                groups[rid] = RestaurantCartGroup(
                    id=rid,
                    name=rest_name or "Restaurant",
                    logo=rest_image,
                    items=[],
                )
            groups[rid].items.append(item_to_response(cart_row))
        return CartListResponse(orders=list(groups.values()))
    except Exception as e:
        log.error("List cart failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load cart")


@router.post("/items", response_model=CartItemResponse)
async def add_cart_item(
    body: CartItemCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        now = datetime.now(timezone.utc)
        item = CartItem(
            user_id=user_id,
            restaurant_id=UUID(body.restaurant_id),
            menu_item_id=UUID(body.menu_item_id) if body.menu_item_id else None,
            name=body.name,
            description=body.description,
            unit_price=body.unit_price,
            quantity=body.quantity,
            image_url=body.image_url,
            section=body.section,
            options_json=body.options_json,
            special_instructions=body.special_instructions,
            created_at=now,
            updated_at=now,
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item_to_response(item)
    except Exception as e:
        log.error("Add cart item failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to add to cart")


@router.patch("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_quantity(
    item_id: UUID,
    body: CartItemQuantityUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        result = await db.execute(
            select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
        )
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        item.quantity = body.quantity
        item.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(item)
        return item_to_response(item)
    except HTTPException:
        raise
    except Exception as e:
        log.error("Update cart failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update cart")


@router.delete("/menu-items/{menu_item_id}")
async def remove_one_menu_item_from_cart(
    menu_item_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove one unit from the most recently added cart line for this menu item."""
    try:
        user_id = UUID(current_user["id"])
        result = await db.execute(
            select(CartItem)
            .where(CartItem.user_id == user_id, CartItem.menu_item_id == menu_item_id)
            .order_by(CartItem.updated_at.desc())
            .limit(1)
        )
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Item not in cart")
        if item.quantity > 1:
            item.quantity -= 1
            item.updated_at = datetime.now(timezone.utc)
        else:
            await db.delete(item)
        await db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        log.error("Quick remove cart item failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update cart")


@router.delete("/items/{item_id}")
async def delete_cart_item(
    item_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        result = await db.execute(
            delete(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cart item not found")
        await db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        log.error("Delete cart item failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete item")


@router.delete("/restaurants/{restaurant_id}")
async def delete_cart_restaurant(
    restaurant_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        await db.execute(
            delete(CartItem).where(
                CartItem.user_id == user_id,
                CartItem.restaurant_id == restaurant_id,
            )
        )
        await db.commit()
        return {"ok": True}
    except Exception as e:
        log.error("Delete cart restaurant failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to remove restaurant")
