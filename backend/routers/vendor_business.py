import logging
import re
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.restaurant import Restaurant
from routers.profile import get_role_profile, normalize_phone_number
from schemas.restaurant_vendor import (
    BusinessRegistrationRequest,
    BusinessRegistrationResponse,
    BusinessRegistrationSummary,
    RestaurantImageUploadResponse,
    VerificationDocumentsRequest,
)
from services.cloudinary_storage import upload_restaurant_image
from services.jwt_auth import get_current_user
from services.vendor_verification import verification_stage_for_restaurant

log = logging.getLogger(__name__)
router = APIRouter(prefix="/restaurants", tags=["restaurants"])


async def _get_owned_restaurant(db: AsyncSession, user_id: UUID) -> Restaurant | None:
    result = await db.execute(
        select(Restaurant).where(Restaurant.owner_user_id == user_id).limit(1)
    )
    return result.scalar_one_or_none()


async def _get_vendor_restaurant(db: AsyncSession, user_id: UUID) -> Restaurant:
    user_role = await get_role_profile(db, user_id, "restaurant")
    if not user_role:
        raise HTTPException(status_code=404, detail="Restaurant profile not found")

    restaurant = None
    if user_role.restaurant_id:
        result = await db.execute(
            select(Restaurant).where(Restaurant.id == user_role.restaurant_id)
        )
        restaurant = result.scalar_one_or_none()

    if not restaurant:
        restaurant = await _get_owned_restaurant(db, user_id)

    if not restaurant:
        raise HTTPException(status_code=404, detail="Business registration not found")

    return restaurant


@router.post("/upload-image", response_model=RestaurantImageUploadResponse)
async def upload_image(
    kind: str = Form(...),
    file: UploadFile = File(...),
    document_key: str | None = Form(None),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await upload_restaurant_image(file, kind, user_id, document_key=document_key)
    return RestaurantImageUploadResponse(**result)


@router.get("/registration", response_model=BusinessRegistrationSummary)
async def get_business_registration(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["id"])
    restaurant = await _get_vendor_restaurant(db, user_id)

    if not restaurant.business_type:
        raise HTTPException(status_code=404, detail="Business registration not found")

    return BusinessRegistrationSummary(
        restaurant_id=restaurant.id,
        business_name=restaurant.name,
        business_type=restaurant.business_type,
        business_verified=restaurant.business_verified,
        verification_stage=verification_stage_for_restaurant(restaurant),
        documents_submitted=bool(restaurant.verification_documents),
    )


@router.post("/registration", response_model=BusinessRegistrationResponse)
async def submit_business_registration(
    payload: BusinessRegistrationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        user_role = await get_role_profile(db, user_id, "restaurant")

        if not user_role:
            raise HTTPException(status_code=404, detail="Restaurant profile not found")

        normalized_phone = normalize_phone_number(payload.phone)
        now = datetime.now(timezone.utc)

        restaurant = None
        if user_role.restaurant_id:
            result = await db.execute(
                select(Restaurant).where(Restaurant.id == user_role.restaurant_id)
            )
            restaurant = result.scalar_one_or_none()

        if not restaurant:
            restaurant = await _get_owned_restaurant(db, user_id)

        if not restaurant:
            restaurant = Restaurant(
                name=payload.business_name.strip(),
                created_at=now,
            )
            db.add(restaurant)
            await db.flush()

        restaurant.name = payload.business_name.strip()
        restaurant.owner_user_id = user_id
        restaurant.owner_name = payload.business_owner.strip()
        restaurant.business_type = payload.business_type.strip()
        restaurant.logo_url = payload.logo_url
        restaurant.image_url = payload.cover_image_url
        restaurant.phone = normalized_phone
        restaurant.contact_person = (payload.contact_person or "").strip() or None
        restaurant.email = (payload.email or "").strip() or None
        restaurant.address = (payload.address or "").strip() or None
        restaurant.landmark = (payload.landmark or "").strip() or None
        restaurant.latitude = payload.latitude
        restaurant.longitude = payload.longitude
        restaurant.bank_name = (payload.bank_name or "").strip() or None
        restaurant.account_number = re.sub(r"\s+", "", payload.account_number or "") or None
        restaurant.account_holder_name = (payload.account_holder_name or "").strip() or None
        restaurant.business_verified = False
        restaurant.verification_submitted_at = now

        user_role.restaurant_id = restaurant.id
        if normalized_phone:
            user_role.phone = normalized_phone

        await db.commit()
        await db.refresh(restaurant)

        log.info("Business registration submitted for user %s (restaurant %s)", user_id, restaurant.id)
        return BusinessRegistrationResponse(
            restaurant_id=restaurant.id,
            business_verified=restaurant.business_verified,
            verification_submitted_at=restaurant.verification_submitted_at,
        )

    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        log.error("Business registration failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save business registration")


@router.post("/verification-documents", response_model=BusinessRegistrationResponse)
async def submit_verification_documents(
    payload: VerificationDocumentsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        restaurant = await _get_vendor_restaurant(db, user_id)
        now = datetime.now(timezone.utc)

        restaurant.verification_documents = payload.documents
        if not restaurant.verification_submitted_at:
            restaurant.verification_submitted_at = now

        await db.commit()
        await db.refresh(restaurant)

        log.info("Verification documents submitted for user %s (restaurant %s)", user_id, restaurant.id)
        return BusinessRegistrationResponse(
            restaurant_id=restaurant.id,
            business_verified=restaurant.business_verified,
            verification_submitted_at=restaurant.verification_submitted_at,
        )

    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        log.error("Verification documents submission failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save verification documents")
