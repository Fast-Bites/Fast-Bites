import logging
import re
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.user_role import UserRole
from models.restaurant import Restaurant
from schemas.user import UserUpdate, UserResponse, UserRolesResponse
from services.jwt_auth import get_current_user
from services.supabase_admin import delete_auth_user

from services.vendor_verification import verification_stage_for_restaurant

log = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["profile"])

VALID_ROLES = {"customer", "rider", "restaurant"}


def normalize_phone_number(phone: str | None) -> str | None:
    if not phone:
        return phone

    cleaned = re.sub(r"[^\d+]", "", phone)

    if cleaned.startswith("0"):
        cleaned = "+234" + cleaned[1:]
    elif cleaned.startswith("234") and not cleaned.startswith("+"):
        cleaned = "+" + cleaned

    return cleaned


def role_profile_to_response(
    user_role: UserRole,
    email: str,
    *,
    restaurant_id: UUID | None = None,
    business_verified: bool | None = None,
    verification_stage: str | None = None,
) -> UserResponse:
    return UserResponse(
        id=user_role.user_id,
        email=email,
        first_name=user_role.first_name,
        last_name=user_role.last_name,
        phone=user_role.phone,
        dob=user_role.dob,
        google_id=user_role.google_id,
        role=user_role.role,
        address=user_role.address,
        city=user_role.city,
        state=user_role.state,
        latitude=user_role.latitude,
        longitude=user_role.longitude,
        restaurant_id=restaurant_id,
        business_verified=business_verified,
        verification_stage=verification_stage,
    )


async def get_user_account(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_role_profile(db: AsyncSession, user_id: UUID, role: str) -> UserRole | None:
    result = await db.execute(
        select(UserRole).where(UserRole.user_id == user_id, UserRole.role == role)
    )
    return result.scalar_one_or_none()


async def get_restaurant_vendor_context(
    db: AsyncSession,
    user_role: UserRole,
) -> tuple[UUID | None, bool | None, str | None]:
    if user_role.role != "restaurant":
        return None, None, None

    restaurant = None
    if user_role.restaurant_id:
        result = await db.execute(select(Restaurant).where(Restaurant.id == user_role.restaurant_id))
        restaurant = result.scalar_one_or_none()

    if not restaurant:
        result = await db.execute(
            select(Restaurant).where(Restaurant.owner_user_id == user_role.user_id).limit(1)
        )
        restaurant = result.scalar_one_or_none()

    if not restaurant:
        return None, False, "registration"

    stage = verification_stage_for_restaurant(restaurant)
    return restaurant.id, restaurant.business_verified, stage


async def ensure_user_account(
    db: AsyncSession,
    user_id: UUID,
    email: str,
    profile_data: UserUpdate,
) -> User:
    user = await get_user_account(db, user_id)
    if user:
        return user

    user = User(
        id=user_id,
        email=email,
        first_name=profile_data.first_name or "User",
        last_name=profile_data.last_name or "Account",
        role=profile_data.role or "customer",
    )
    db.add(user)
    await db.flush()
    return user


@router.get("/roles", response_model=UserRolesResponse)
async def list_roles(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["id"])
    result = await db.execute(select(UserRole.role).where(UserRole.user_id == user_id))
    roles = [row[0] for row in result.all()]
    return UserRolesResponse(roles=roles)


@router.post("/profile", response_model=UserResponse)
async def create_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        email = current_user.get("email")
        role = profile_data.role or "customer"

        if role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid user data")

        if not profile_data.first_name or not profile_data.last_name:
            raise HTTPException(status_code=400, detail="First and last name are required")

        existing_role = await get_role_profile(db, user_id, role)
        if existing_role:
            raise HTTPException(status_code=400, detail="Profile already exists for this role")

        normalized_phone = normalize_phone_number(profile_data.phone)
        if normalized_phone:
            phone_check = await db.execute(
                select(UserRole).where(UserRole.phone == normalized_phone)
            )
            if phone_check.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Phone number already in use")

        await ensure_user_account(db, user_id, email, profile_data)

        user_role = UserRole(
            user_id=user_id,
            role=role,
            first_name=profile_data.first_name,
            last_name=profile_data.last_name,
            phone=normalized_phone,
            dob=profile_data.dob,
        )
        db.add(user_role)
        await db.commit()
        await db.refresh(user_role)

        log.info("Role profile created: %s (%s)", email, role)
        restaurant_id, business_verified, verification_stage = await get_restaurant_vendor_context(db, user_role)
        return role_profile_to_response(
            user_role,
            email,
            restaurant_id=restaurant_id,
            business_verified=business_verified,
            verification_stage=verification_stage,
        )

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Create profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create profile")


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    role: str = Query(..., description="Profile role: customer, rider, or restaurant"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role")

        user_id = UUID(current_user["id"])
        email = current_user.get("email")
        user_role = await get_role_profile(db, user_id, role)

        if not user_role or not email:
            raise HTTPException(status_code=404, detail="Profile not found")

        restaurant_id, business_verified, verification_stage = await get_restaurant_vendor_context(db, user_role)
        return role_profile_to_response(
            user_role,
            email,
            restaurant_id=restaurant_id,
            business_verified=business_verified,
            verification_stage=verification_stage,
        )

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Get profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    role: str = Query(..., description="Profile role to update"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role")

        user_id = UUID(current_user["id"])
        email = current_user.get("email")
        user_role = await get_role_profile(db, user_id, role)

        if not user_role or not email:
            raise HTTPException(status_code=404, detail="Profile not found")

        normalized_phone = normalize_phone_number(profile_data.phone) if profile_data.phone else None

        if normalized_phone and normalized_phone != user_role.phone:
            phone_check = await db.execute(
                select(UserRole).where(
                    UserRole.phone == normalized_phone,
                    UserRole.user_id != user_id,
                )
            )
            if phone_check.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Phone number already in use")

        update_data = profile_data.model_dump(exclude_unset=True, exclude={"role"})
        if "phone" in update_data and normalized_phone:
            update_data["phone"] = normalized_phone

        for key, value in update_data.items():
            if hasattr(user_role, key):
                setattr(user_role, key, value)

        await db.commit()
        await db.refresh(user_role)

        log.info(f"Profile updated: {email} ({role})")
        restaurant_id, business_verified, verification_stage = await get_restaurant_vendor_context(db, user_role)
        return role_profile_to_response(
            user_role,
            email,
            restaurant_id=restaurant_id,
            business_verified=business_verified,
            verification_stage=verification_stage,
        )

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Update profile failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.delete("/profile")
async def delete_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid user data")

        uid = UUID(user_id)
        role_rows = await db.execute(select(UserRole).where(UserRole.user_id == uid))
        for row in role_rows.scalars().all():
            await db.delete(row)

        user = await get_user_account(db, uid)
        if user:
            await db.delete(user)
            await db.commit()
            log.info("Profile rows deleted: %s", user.email)
        else:
            await db.commit()
            log.info("No profile row for user id %s; removing Auth user only", user_id)

        auth_err = await delete_auth_user(str(user_id))
        if auth_err:
            raise HTTPException(status_code=503, detail=auth_err)

        return {"message": "Account deleted"}

    except HTTPException:
        raise
    except Exception as e:
        log.error("Delete account failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete account")
