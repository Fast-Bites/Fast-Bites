from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, func, or_
from typing import List, Optional
from uuid import UUID
from collections import defaultdict

from database import get_db
from models.restaurant import Restaurant
from models.menu_item import MenuItem
from models.restaurant_hours import RestaurantHours
from models.platform_category import PlatformCategory
from schemas.menu import (
    RestaurantResponse,
    MenuItemResponse,
    MenuItemWithRestaurant,
    PlatformCategoryResponse,
)
from schemas.menu_extras import (
    RestaurantHoursResponse,
    RestaurantHoursDay,
    MenuItemCategoryResponse,
    MenuItemModifiersResponse,
    ModifierGroupResponse,
    ModifierOptionResponse,
)
from services.restaurant_hours_util import HoursRow, compute_hours_display

router = APIRouter(prefix="/menu", tags=["menu"])

# Customer app UI is restaurant-only for now.
_CUSTOMER_RESTAURANT_TYPES = ("restaurant",)


def _is_customer_restaurant(business_type: str | None) -> bool:
    if not business_type or not str(business_type).strip():
        return True
    return str(business_type).strip().lower() in _CUSTOMER_RESTAURANT_TYPES


def _customer_restaurant_clause():
    return or_(
        Restaurant.business_type.is_(None),
        func.lower(Restaurant.business_type) == "restaurant",
    )


def _hours_rows_from_db(rows: list[RestaurantHours]) -> list[HoursRow]:
    return [
        HoursRow(
            day_of_week=h.day_of_week,
            open_time=h.open_time,
            close_time=h.close_time,
            is_closed=bool(h.is_closed),
        )
        for h in rows
    ]


async def _load_hours_by_restaurant(
    db: AsyncSession, restaurant_ids: list[UUID]
) -> dict[UUID, list[HoursRow]]:
    if not restaurant_ids:
        return {}
    result = await db.execute(
        select(RestaurantHours).where(RestaurantHours.restaurant_id.in_(restaurant_ids))
    )
    grouped: dict[UUID, list[HoursRow]] = defaultdict(list)
    for h in result.scalars().all():
        grouped[h.restaurant_id].append(
            HoursRow(
                day_of_week=h.day_of_week,
                open_time=h.open_time,
                close_time=h.close_time,
                is_closed=bool(h.is_closed),
            )
        )
    return grouped


async def _load_avg_delivery_by_restaurant(
    db: AsyncSession, restaurant_ids: list[UUID]
) -> dict[UUID, int]:
    if not restaurant_ids:
        return {}
    result = await db.execute(
        select(
            MenuItem.restaurant_id,
            func.avg(MenuItem.delivery_time),
        )
        .where(
            MenuItem.restaurant_id.in_(restaurant_ids),
            MenuItem.delivery_time.isnot(None),
            MenuItem.is_available == True,
        )
        .group_by(MenuItem.restaurant_id)
    )
    out: dict[UUID, int] = {}
    for rid, avg_val in result.all():
        if rid is not None and avg_val is not None:
            out[rid] = int(round(float(avg_val)))
    return out


def _to_restaurant_response(
    r: Restaurant,
    hours_rows: list[HoursRow],
    avg_delivery: Optional[int],
) -> RestaurantResponse:
    is_open_now, hours_status, operating_text = compute_hours_display(
        hours_rows,
        fallback_is_open=r.is_open,
    )
    return RestaurantResponse(
        id=r.id,
        name=r.name,
        address=r.address,
        latitude=r.latitude,
        longitude=r.longitude,
        image_url=r.image_url,
        logo_url=getattr(r, "logo_url", None),
        rating=r.rating,
        is_open=r.is_open,
        created_at=r.created_at,
        is_open_now=is_open_now,
        hours_status=hours_status,
        operating_hours_text=operating_text,
        avg_delivery_minutes=avg_delivery,
        business_type=getattr(r, "business_type", None),
    )


@router.get("/restaurants", response_model=List[RestaurantResponse])
async def get_restaurants(
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get restaurants only (shops/pharmacy/market hidden until customer UI exists)."""
    result = await db.execute(
        select(Restaurant)
        .where(_customer_restaurant_clause())
        .order_by(Restaurant.name)
        .limit(limit)
        .offset(offset)
    )
    restaurants = result.scalars().all()
    ids = [r.id for r in restaurants]
    hours_map = await _load_hours_by_restaurant(db, ids)
    delivery_map = await _load_avg_delivery_by_restaurant(db, ids)
    return [
        _to_restaurant_response(
            r,
            hours_map.get(r.id, []),
            delivery_map.get(r.id),
        )
        for r in restaurants
    ]


@router.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific restaurant by ID"""
    result = await db.execute(
        select(Restaurant).where(Restaurant.id == restaurant_id)
    )
    restaurant = result.scalar_one_or_none()
    if not restaurant or not _is_customer_restaurant(getattr(restaurant, "business_type", None)):
        raise HTTPException(status_code=404, detail="Restaurant not found")
    hours_map = await _load_hours_by_restaurant(db, [restaurant_id])
    delivery_map = await _load_avg_delivery_by_restaurant(db, [restaurant_id])
    return _to_restaurant_response(
        restaurant,
        hours_map.get(restaurant_id, []),
        delivery_map.get(restaurant_id),
    )


@router.get("/items", response_model=List[MenuItemWithRestaurant])
async def get_menu_items(
    limit: int = 100,  # Default to 100 to get more items
    offset: int = 0,
    restaurant_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get restaurant menu products only (other vendor types excluded for now)."""
    query = (
        select(
            MenuItem.id,
            MenuItem.name,
            MenuItem.description,
            MenuItem.price,
            MenuItem.image_url,
            MenuItem.is_available,
            MenuItem.restaurant_id,
            MenuItem.delivery_time,
            MenuItem.vendor_category,
            MenuItem.platform_category_id,
            PlatformCategory.slug.label("category"),
            Restaurant.name.label("restaurant_name")
        )
        .join(Restaurant, MenuItem.restaurant_id == Restaurant.id)
        .outerjoin(PlatformCategory, MenuItem.platform_category_id == PlatformCategory.id)
        .where(MenuItem.is_available == True, _customer_restaurant_clause())
    )
    
    if restaurant_id:
        query = query.where(MenuItem.restaurant_id == restaurant_id)
    
    query = query.order_by(MenuItem.name).limit(limit).offset(offset)
    
    result = await db.execute(query)
    rows = result.all()
    
    # Convert to list of dicts
    items = []
    for row in rows:
        items.append({
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "price": row.price,
            "image_url": row.image_url,
            "is_available": row.is_available,
            "restaurant_id": row.restaurant_id,
            "restaurant_name": row.restaurant_name,
            "delivery_time": row.delivery_time,
            "category": row.category,
            "vendor_category": row.vendor_category,
            "platform_category_id": row.platform_category_id,
        })
    
    return items


@router.get("/items/{item_id}", response_model=MenuItemWithRestaurant)
async def get_menu_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific restaurant product by ID"""
    result = await db.execute(
        select(
            MenuItem.id,
            MenuItem.name,
            MenuItem.description,
            MenuItem.price,
            MenuItem.image_url,
            MenuItem.is_available,
            MenuItem.restaurant_id,
            MenuItem.delivery_time,
            MenuItem.vendor_category,
            MenuItem.platform_category_id,
            PlatformCategory.slug.label("category"),
            Restaurant.name.label("restaurant_name")
        )
        .join(Restaurant, MenuItem.restaurant_id == Restaurant.id)
        .outerjoin(PlatformCategory, MenuItem.platform_category_id == PlatformCategory.id)
        .where(MenuItem.id == item_id, _customer_restaurant_clause())
    )
    row = result.one_or_none()
    
    if not row:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    return {
        "id": row.id,
        "name": row.name,
        "description": row.description,
        "price": row.price,
        "image_url": row.image_url,
        "is_available": row.is_available,
        "restaurant_id": row.restaurant_id,
        "restaurant_name": row.restaurant_name,
        "delivery_time": row.delivery_time,
        "category": row.category,
        "vendor_category": row.vendor_category,
        "platform_category_id": row.platform_category_id,
    }


@router.get("/platform-categories", response_model=List[PlatformCategoryResponse])
async def list_platform_categories(
    business_type: str = "Restaurant",
    db: AsyncSession = Depends(get_db),
):
    """Official browse categories for a vendor business type."""
    bt = business_type.strip() or "Restaurant"
    result = await db.execute(
        select(PlatformCategory)
        .where(PlatformCategory.business_type == bt)
        .order_by(PlatformCategory.sort_order, PlatformCategory.name)
    )
    # Customer browse: at most Food/Drinks/Desserts/Sides (+ Other for vendors);
    # never expose a Bakery tab.
    return [c for c in result.scalars().all() if c.slug != "bakery"]


@router.get("/restaurants/{restaurant_id}/items", response_model=List[MenuItemCategoryResponse])
async def get_restaurant_items_by_category(
    restaurant_id: UUID,
    category: str = "food",
    db: AsyncSession = Depends(get_db),
):
    """
    Catalog items for a restaurant filtered by platform category slug
    (e.g. food, drinks). Non-restaurant vendors are not exposed yet.
    """
    cat = category.strip().lower()
    if not cat:
        raise HTTPException(status_code=400, detail="category is required")

    store = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = store.scalar_one_or_none()
    if not restaurant or not _is_customer_restaurant(getattr(restaurant, "business_type", None)):
        raise HTTPException(status_code=404, detail="Restaurant not found")

    result = await db.execute(
        select(MenuItem, PlatformCategory.slug)
        .outerjoin(PlatformCategory, MenuItem.platform_category_id == PlatformCategory.id)
        .where(
            MenuItem.restaurant_id == restaurant_id,
            MenuItem.is_available == True,
            PlatformCategory.slug == cat,
        )
        .order_by(MenuItem.name)
    )
    rows = result.all()
    return [
        MenuItemCategoryResponse(
            id=str(i.id),
            name=i.name,
            price=float(i.price),
            image=i.image_url,
            delivery_minutes=i.delivery_time,
            description=i.description,
            category=slug,
            vendor_category=i.vendor_category,
            platform_category_id=str(i.platform_category_id) if i.platform_category_id else None,
        )
        for i, slug in rows
    ]


@router.get("/restaurants/{restaurant_id}/hours", response_model=RestaurantHoursResponse)
async def get_restaurant_hours(
    restaurant_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RestaurantHours)
        .where(RestaurantHours.restaurant_id == restaurant_id)
        .order_by(RestaurantHours.day_of_week)
    )
    days = [
        RestaurantHoursDay(
            day_of_week=h.day_of_week,
            open_time=h.open_time.strftime("%H:%M") if h.open_time else None,
            close_time=h.close_time.strftime("%H:%M") if h.close_time else None,
            is_closed=bool(h.is_closed),
        )
        for h in result.scalars().all()
    ]
    return RestaurantHoursResponse(days=days)


@router.get("/items/{item_id}/modifiers", response_model=MenuItemModifiersResponse)
async def get_menu_item_modifiers(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    groups_result = await db.execute(
        text(
            """
            SELECT id, name FROM menu_modifier_groups
            WHERE product_id = :item_id
            ORDER BY sort_order
            """
        ),
        {"item_id": str(item_id)},
    )
    groups = []
    for gid, gname in groups_result.all():
        # Sizes are separate products — never expose Size modifier groups.
        if "size" in (gname or "").lower():
            continue
        opts_result = await db.execute(
            text(
                """
                SELECT id, label, price_delta FROM menu_modifier_options
                WHERE group_id = :gid
                ORDER BY sort_order
                """
            ),
            {"gid": str(gid)},
        )
        options = [
            ModifierOptionResponse(
                id=str(oid),
                label=label,
                price_delta=float(price_delta or 0),
            )
            for oid, label, price_delta in opts_result.all()
        ]
        groups.append(ModifierGroupResponse(id=str(gid), name=gname, options=options))
    return MenuItemModifiersResponse(groups=groups)

