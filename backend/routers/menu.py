from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID

from database import get_db
from models.restaurant import Restaurant
from models.menu_item import MenuItem
from schemas.menu import RestaurantResponse, MenuItemResponse, MenuItemWithRestaurant

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("/restaurants", response_model=List[RestaurantResponse])
async def get_restaurants(
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get all restaurants"""
    result = await db.execute(
        select(Restaurant)
        .order_by(Restaurant.name)
        .limit(limit)
        .offset(offset)
    )
    restaurants = result.scalars().all()
    return restaurants


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
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.get("/items", response_model=List[MenuItemWithRestaurant])
async def get_menu_items(
    limit: int = 100,  # Default to 100 to get more items
    offset: int = 0,
    restaurant_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get menu items with restaurant names"""
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
            Restaurant.name.label("restaurant_name")
        )
        .outerjoin(Restaurant, MenuItem.restaurant_id == Restaurant.id)
        .where(MenuItem.is_available == True)
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
            "delivery_time": row.delivery_time
        })
    
    return items


@router.get("/items/{item_id}", response_model=MenuItemWithRestaurant)
async def get_menu_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific menu item by ID"""
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
            Restaurant.name.label("restaurant_name")
        )
        .outerjoin(Restaurant, MenuItem.restaurant_id == Restaurant.id)
        .where(MenuItem.id == item_id)
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
        "delivery_time": row.delivery_time
    }

