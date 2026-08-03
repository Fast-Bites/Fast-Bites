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
from schemas.vendor_business import (
    BusinessRegistrationRequest,
    BusinessRegistrationResponse,
    BusinessRegistrationSummary,
    VendorImageUploadResponse,
    VerificationDocumentsRequest,
)
from services.cloudinary_storage import upload_vendor_image
from services.jwt_auth import get_current_user
from services.role_constants import VENDOR_ROLE
from services.vendor_verification import verification_stage_for_business

log = logging.getLogger(__name__)


async def _get_owned_business(db: AsyncSession, user_id: UUID) -> Restaurant | None:
    result = await db.execute(
        select(Restaurant).where(Restaurant.owner_user_id == user_id).limit(1)
    )
    return result.scalar_one_or_none()


async def _get_vendor_business(db: AsyncSession, user_id: UUID) -> Restaurant:
    user_role = await get_role_profile(db, user_id, VENDOR_ROLE)
    if not user_role:
        raise HTTPException(status_code=404, detail="Vendor profile not found")

    business = None
    business_id = getattr(user_role, "business_id", None)
    if business_id:
        result = await db.execute(
            select(Restaurant).where(Restaurant.id == business_id)
        )
        business = result.scalar_one_or_none()

    if not business:
        business = await _get_owned_business(db, user_id)

    if not business:
        raise HTTPException(status_code=404, detail="Business registration not found")

    return business


async def upload_image(
    kind: str = Form(...),
    file: UploadFile = File(...),
    document_key: str | None = Form(None),
    business_name: str | None = Form(None),
    business_id: str | None = Form(None),
    restaurant_name: str | None = Form(None),
    restaurant_id: str | None = Form(None),
    menu_item_name: str | None = Form(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    resolved_business_id = (business_id or restaurant_id or "").strip() or None
    resolved_business_name = (business_name or restaurant_name or "").strip() or None
    resolved_menu_name = (menu_item_name or "").strip() or None

    if not resolved_business_id or not resolved_business_name:
        try:
            business = await _get_vendor_business(db, UUID(user_id))
            resolved_business_id = resolved_business_id or str(business.id)
            resolved_business_name = resolved_business_name or (business.name or "").strip() or None
        except HTTPException:
            pass

    result = await upload_vendor_image(
        file,
        kind,
        user_id,
        document_key=document_key,
        business_id=resolved_business_id,
        business_name=resolved_business_name,
        menu_item_name=resolved_menu_name,
    )
    return VendorImageUploadResponse(**result)


async def get_business_registration(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["id"])
    business = await _get_vendor_business(db, user_id)

    if not business.business_type:
        raise HTTPException(status_code=404, detail="Business registration not found")

    return BusinessRegistrationSummary(
        business_id=business.id,
        business_name=business.name,
        business_type=business.business_type,
        business_verified=business.business_verified,
        verification_stage=verification_stage_for_business(business),
        documents_submitted=bool(business.verification_documents),
    )


async def submit_business_registration(
    payload: BusinessRegistrationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        user_role = await get_role_profile(db, user_id, VENDOR_ROLE)

        if not user_role:
            raise HTTPException(status_code=404, detail="Vendor profile not found")

        normalized_phone = normalize_phone_number(payload.phone)
        now = datetime.now(timezone.utc)

        business = None
        business_id = getattr(user_role, "business_id", None)
        if business_id:
            result = await db.execute(
                select(Restaurant).where(Restaurant.id == business_id)
            )
            business = result.scalar_one_or_none()

        if not business:
            business = await _get_owned_business(db, user_id)

        if not business:
            business = Restaurant(
                name=payload.business_name.strip(),
                created_at=now,
            )
            db.add(business)
            await db.flush()

        business.name = payload.business_name.strip()
        business.owner_user_id = user_id
        business.owner_name = payload.business_owner.strip()
        business.business_type = payload.business_type.strip()
        business.logo_url = payload.logo_url
        business.image_url = payload.cover_image_url
        business.phone = normalized_phone
        business.contact_person = (payload.contact_person or "").strip() or None
        business.email = (payload.email or "").strip() or None
        business.address = (payload.address or "").strip() or None
        business.landmark = (payload.landmark or "").strip() or None
        business.latitude = payload.latitude
        business.longitude = payload.longitude
        business.bank_name = (payload.bank_name or "").strip() or None
        business.account_number = re.sub(r"\s+", "", payload.account_number or "") or None
        business.account_holder_name = (payload.account_holder_name or "").strip() or None
        business.business_verified = False
        business.verification_submitted_at = now

        user_role.business_id = business.id
        if normalized_phone:
            user_role.phone = normalized_phone

        await db.commit()
        await db.refresh(business)

        log.info("Business registration submitted for user %s (business %s)", user_id, business.id)
        return BusinessRegistrationResponse(
            business_id=business.id,
            business_verified=business.business_verified,
            verification_submitted_at=business.verification_submitted_at,
        )

    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        log.error("Business registration failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save business registration")


async def submit_verification_documents(
    payload: VerificationDocumentsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        business = await _get_vendor_business(db, user_id)
        now = datetime.now(timezone.utc)

        business.verification_documents = payload.documents
        if not business.verification_submitted_at:
            business.verification_submitted_at = now

        await db.commit()
        await db.refresh(business)

        log.info("Verification documents submitted for user %s (business %s)", user_id, business.id)
        return BusinessRegistrationResponse(
            business_id=business.id,
            business_verified=business.business_verified,
            verification_submitted_at=business.verification_submitted_at,
        )

    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        log.error("Verification documents submission failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save verification documents")


vendor_router = APIRouter(prefix="/vendors", tags=["vendors"])
legacy_vendor_router = APIRouter(prefix="/restaurants", tags=["restaurants"])

for route in vendor_router, legacy_vendor_router:
    route.add_api_route("/upload-image", upload_image, methods=["POST"], response_model=VendorImageUploadResponse)
    route.add_api_route("/registration", get_business_registration, methods=["GET"], response_model=BusinessRegistrationSummary)
    route.add_api_route("/registration", submit_business_registration, methods=["POST"], response_model=BusinessRegistrationResponse)
    route.add_api_route(
        "/verification-documents",
        submit_verification_documents,
        methods=["POST"],
        response_model=BusinessRegistrationResponse,
    )

router = vendor_router
