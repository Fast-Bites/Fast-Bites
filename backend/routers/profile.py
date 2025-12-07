import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from schemas.user import UserUpdate, UserResponse
from services.jwt_auth import get_current_user

log = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["profile"])

@router.post("/profile", response_model=UserResponse)
async def create_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create user profile after Supabase auth signup"""
    try:
        user_id = current_user.get("id")
        email = current_user.get("email")
        
        if not user_id or not email:
            raise HTTPException(status_code=400, detail="Invalid user data")
        
        # Check if profile already exists
        result = await db.execute(select(User).where(User.id == user_id))
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        # Create profile with Supabase user ID
        user = User(
            id=user_id,
            email=email,
            first_name=profile_data.first_name,
            last_name=profile_data.last_name,
            phone=profile_data.phone,
            dob=profile_data.dob,
            role=profile_data.role if hasattr(profile_data, 'role') else "customer",
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        log.info(f"Profile created: {email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Create profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create profile")

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's profile"""
    try:
        user_id = current_user.get("id")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Get profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile"""
    try:
        user_id = current_user.get("id")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Update fields
        for key, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(user, key, value)
        
        await db.commit()
        await db.refresh(user)
        
        log.info(f"Profile updated: {user.email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Update profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.delete("/profile")
async def delete_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete current user's profile"""
    try:
        user_id = current_user.get("id")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        await db.delete(user)
        await db.commit()
        
        log.info(f"Profile deleted: {user.email}")
        return {"message": "Profile deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Delete profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete profile")

