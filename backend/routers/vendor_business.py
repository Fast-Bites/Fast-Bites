import logging
import re
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.restaurant import Restaurant
from models.restaurant_hours import RestaurantHours
from routers.profile import get_role_profile, normalize_phone_number
from schemas.vendor_business import (
    BusinessRegistrationRequest,
    BusinessRegistrationResponse,
    BusinessRegistrationSummary,
    CatalogExtractResponse,
    CatalogExtractedItem,
    CatalogItemCreate,
    CatalogItemsCreateRequest,
    CatalogItemsCreateResponse,
    VendorImageUploadResponse,
    VerificationDocumentsRequest,
)
from models.product import Product
from models.platform_category import PlatformCategory
from config import settings
from services.catalog_extract import extract_catalog_items_from_upload
from services.category_mapping import resolve_platform_category_id
from services.cloudinary_storage import upload_vendor_image
from services.jwt_auth import get_current_user
from services.restaurant_hours_util import parse_hhmm
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


def _business_registration_summary(business: Restaurant) -> BusinessRegistrationSummary:
    return BusinessRegistrationSummary(
        business_id=business.id,
        business_name=business.name,
        business_owner=(business.owner_name or "").strip() or None,
        business_type=business.business_type or "",
        business_verified=business.business_verified,
        verification_stage=verification_stage_for_business(business),
        documents_submitted=bool(business.verification_documents),
        documentation_skipped=bool(business.documentation_skipped_at),
        catalog_setup_completed=bool(business.catalog_setup_completed_at),
    )


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

    return _business_registration_summary(business)


async def skip_documentation(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record that the vendor skipped documentation for now (survives re-login)."""
    user_id = UUID(current_user["id"])
    business = await _get_vendor_business(db, user_id)
    already = bool(business.documentation_skipped_at)
    if not business.documentation_skipped_at:
        business.documentation_skipped_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(business)
    log.info(
        "Documentation skip for business %s (user %s) — %s",
        business.id,
        user_id,
        "already recorded" if already else "saved",
    )
    return _business_registration_summary(business)


async def complete_catalog_setup(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark catalog/menu onboarding done (skip or after save)."""
    user_id = UUID(current_user["id"])
    business = await _get_vendor_business(db, user_id)
    already = bool(business.catalog_setup_completed_at)
    if not business.catalog_setup_completed_at:
        business.catalog_setup_completed_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(business)
    log.info(
        "Catalog setup complete for business %s (user %s) — %s",
        business.id,
        user_id,
        "already recorded" if already else "saved",
    )
    return _business_registration_summary(business)


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

        open_time = parse_hhmm(payload.opening_time)
        close_time = parse_hhmm(payload.closing_time)

        # day_of_week -> (open_time, close_time); later ranges overwrite earlier on overlap
        day_schedule: dict[int, tuple] = {}

        if payload.hour_ranges:
            for schedule in payload.hour_ranges:
                range_open = parse_hhmm(schedule.opening_time)
                range_close = parse_hhmm(schedule.closing_time)
                if not range_open or not range_close:
                    continue
                start = schedule.start_day
                end = schedule.end_day
                if start <= end:
                    days = range(start, end + 1)
                else:
                    days = list(range(start, 7)) + list(range(0, end + 1))
                for day in days:
                    if 0 <= day <= 6:
                        day_schedule[day] = (range_open, range_close)
        elif open_time and close_time:
            open_days = set(payload.working_days) if payload.working_days else set(range(7))
            open_days = {d for d in open_days if 0 <= d <= 6}
            if not open_days:
                open_days = set(range(7))
            for day in open_days:
                day_schedule[day] = (open_time, close_time)

        if day_schedule:
            await db.execute(
                delete(RestaurantHours).where(RestaurantHours.restaurant_id == business.id)
            )
            for day in range(7):
                times = day_schedule.get(day)
                is_open = times is not None
                db.add(
                    RestaurantHours(
                        restaurant_id=business.id,
                        day_of_week=day,
                        open_time=times[0] if is_open else None,
                        close_time=times[1] if is_open else None,
                        is_closed=not is_open,
                    )
                )

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


def _norm_text(value: str | None) -> str:
    return " ".join((value or "").strip().lower().split())


_MODIFIER_GROUP_LABELS = {
    "protein": "Protein",
    "extras": "Extras",
}


def _normalize_create_modifiers(
    item: CatalogItemCreate,
) -> list[tuple[str, list[tuple[str, float]]]]:
    """Return [(display_name, [(label, price_delta), ...]), ...] for Protein/Extras.

    Size variants are separate products — size modifier groups are ignored.
    """
    from services.catalog_extract import canonical_modifier_group

    by_group: dict[str, list[tuple[str, float]]] = {}
    for mod in item.modifiers or []:
        canon = canonical_modifier_group(mod.group)
        if not canon:
            continue
        bucket = by_group.setdefault(canon, [])
        seen = {label.lower() for label, _ in bucket}
        for opt in mod.options or []:
            label = (opt.label or "").strip()
            if not label or label.lower() in seen:
                continue
            bucket.append((label, float(opt.price_delta or 0)))
            seen.add(label.lower())

    out: list[tuple[str, list[tuple[str, float]]]] = []
    for key in ("protein", "extras"):
        opts = by_group.get(key)
        if opts:
            out.append((_MODIFIER_GROUP_LABELS[key], opts))
    return out


def _item_fingerprint(
    *,
    name: str,
    price: float,
    vendor_category: str | None,
    delivery_time: int | None,
    modifiers: list[tuple[str, list[tuple[str, float]]]],
) -> tuple:
    """Multi-field identity for same food at same restaurant (not name-only)."""
    protein: list[str] = []
    extras: list[str] = []
    for group_name, options in modifiers:
        labels = sorted(_norm_text(label) for label, _ in options)
        key = group_name.lower()
        if key == "protein":
            protein = labels
        elif key == "extras":
            extras = labels
    return (
        _norm_text(name),
        round(float(price), 2),
        _norm_text(vendor_category),
        delivery_time if delivery_time is not None else -1,
        tuple(protein),
        tuple(extras),
    )


async def _existing_product_fingerprints(db: AsyncSession, restaurant_id: UUID) -> set[tuple]:
    products = (
        await db.execute(select(Product).where(Product.restaurant_id == restaurant_id))
    ).scalars().all()
    if not products:
        return set()

    groups_result = await db.execute(
        text(
            """
            SELECT g.product_id, g.name, o.label
            FROM menu_modifier_groups g
            JOIN products p ON p.id = g.product_id
            LEFT JOIN menu_modifier_options o ON o.group_id = g.id
            WHERE p.restaurant_id = :restaurant_id
            ORDER BY g.sort_order, o.sort_order
            """
        ),
        {"restaurant_id": str(restaurant_id)},
    )
    mods_by_product: dict[str, dict[str, list[tuple[str, float]]]] = {}
    for product_id, group_name, label in groups_result.all():
        pid = str(product_id)
        bucket = mods_by_product.setdefault(pid, {})
        gname = (group_name or "").strip() or "Extras"
        # Ignore legacy Size groups if any remain before migration runs.
        if gname.lower() == "size" or "size" in gname.lower():
            continue
        opts = bucket.setdefault(gname, [])
        if label:
            opts.append((str(label), 0.0))

    fingerprints: set[tuple] = set()
    for product in products:
        mod_map = mods_by_product.get(str(product.id), {})
        normalized: list[tuple[str, list[tuple[str, float]]]] = []
        for name, opts in mod_map.items():
            if not opts:
                continue
            normalized.append((name, opts))
        fingerprints.add(
            _item_fingerprint(
                name=product.name,
                price=float(product.price),
                vendor_category=product.vendor_category,
                delivery_time=product.delivery_time,
                modifiers=normalized,
            )
        )
    return fingerprints


async def _save_modifier_groups(
    db: AsyncSession,
    product_id: UUID,
    groups: list[tuple[str, list[tuple[str, float]]]],
) -> None:
    for sort_order, (group_name, options) in enumerate(groups):
        group_result = await db.execute(
            text(
                """
                INSERT INTO menu_modifier_groups (product_id, name, sort_order)
                VALUES (:product_id, :name, :sort_order)
                RETURNING id
                """
            ),
            {
                "product_id": str(product_id),
                "name": group_name,
                "sort_order": sort_order,
            },
        )
        group_id = group_result.scalar_one()
        for opt_order, (label, price_delta) in enumerate(options):
            await db.execute(
                text(
                    """
                    INSERT INTO menu_modifier_options (group_id, label, price_delta, sort_order)
                    VALUES (:group_id, :label, :price_delta, :sort_order)
                    """
                ),
                {
                    "group_id": str(group_id),
                    "label": label,
                    "price_delta": price_delta,
                    "sort_order": opt_order,
                },
            )


async def create_catalog_items(
    payload: CatalogItemsCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Persist catalog products from vendor Menu/Inventory setup."""
    user_id = UUID(current_user["id"])
    try:
        business = await _get_vendor_business(db, user_id)
        business_type = (business.business_type or "Restaurant").strip()

        cat_result = await db.execute(
            select(PlatformCategory).where(PlatformCategory.business_type == business_type)
        )
        categories = list(cat_result.scalars().all())
        if not categories:
            raise HTTPException(status_code=400, detail="No platform categories for this business type")

        platforms_by_id = {row.id: row for row in categories}
        known = await _existing_product_fingerprints(db, business.id)
        batch_seen: set[tuple] = set()
        log.info(
            "Catalog create start for business %s (user %s): %s incoming, %s existing fingerprints",
            business.id,
            user_id,
            len(payload.items),
            len(known),
        )

        created_ids: list[UUID] = []
        skipped_count = 0
        for item in payload.items:
            modifiers = _normalize_create_modifiers(item)
            fingerprint = _item_fingerprint(
                name=item.name,
                price=float(item.price),
                vendor_category=item.vendor_category,
                delivery_time=item.delivery_time,
                modifiers=modifiers,
            )
            if fingerprint in known or fingerprint in batch_seen:
                skipped_count += 1
                log.info(
                    "Skipping duplicate catalog item %r for business %s",
                    item.name.strip(),
                    business.id,
                )
                continue
            batch_seen.add(fingerprint)

            if item.platform_category_id:
                pc = platforms_by_id.get(item.platform_category_id)
                if not pc:
                    raise HTTPException(status_code=400, detail="Unknown platform category")
                platform_category_id = pc.id
            else:
                platform_category_id = await resolve_platform_category_id(
                    vendor_category=item.vendor_category,
                    item_name=item.name,
                    categories=categories,
                )

            row = Product(
                restaurant_id=business.id,
                name=item.name.strip(),
                price=float(item.price),
                vendor_category=(item.vendor_category or "").strip() or None,
                platform_category_id=platform_category_id,
                delivery_time=item.delivery_time,
                description=None,
                image_url=(item.image_url or "").strip() or None,
                is_available=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(row)
            await db.flush()
            if modifiers:
                await _save_modifier_groups(db, row.id, modifiers)
                log.info(
                    "Saved modifiers for product %s (%s): %s",
                    row.id,
                    row.name,
                    ", ".join(f"{name}×{len(opts)}" for name, opts in modifiers),
                )
            known.add(fingerprint)
            created_ids.append(row.id)

        if not business.catalog_setup_completed_at:
            business.catalog_setup_completed_at = datetime.now(timezone.utc)

        await db.commit()
        if created_ids and skipped_count:
            message = f"Saved {len(created_ids)} item(s); skipped {skipped_count} duplicate(s)."
        elif created_ids:
            message = f"Saved {len(created_ids)} item(s)."
        elif skipped_count:
            message = f"No new items saved; skipped {skipped_count} duplicate(s)."
        else:
            message = "No items saved."
        log.info(
            "Catalog create done for business %s (user %s): created=%s skipped=%s",
            business.id,
            user_id,
            len(created_ids),
            skipped_count,
        )
        return CatalogItemsCreateResponse(
            created_count=len(created_ids),
            skipped_count=skipped_count,
            item_ids=created_ids,
            message=message,
        )
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        log.error("Catalog item create failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save catalog items")


async def extract_catalog_items(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """OCR / parse a scanned or uploaded catalog file into draft products."""
    user_id = UUID(current_user["id"])
    business = await _get_vendor_business(db, user_id)
    business_type = (business.business_type or "Restaurant").strip()
    filename = file.filename or "upload"
    log.info(
        "Catalog extract start for business %s (user %s): file=%s type=%s",
        business.id,
        user_id,
        filename,
        business_type,
    )

    try:
        items = await extract_catalog_items_from_upload(file, business_type=business_type)
    except RuntimeError as exc:
        log.warning("Catalog extract rejected for business %s: %s", business.id, exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        log.error("Catalog extract failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Could not extract items. Check LLM_PROVIDER and API keys.",
        ) from exc

    modifiers_count = sum(1 for row in items if row.get("modifiers"))
    provider = (settings.LLM_PROVIDER or "groq").strip().lower()
    if items:
        message = (
            f"Found {len(items)} item(s)"
            + (f"; {modifiers_count} with modifiers." if modifiers_count else ".")
        )
    else:
        message = "No products found in this file."
    log.info(
        "Catalog extract done for business %s: items=%s with_modifiers=%s provider=%s file=%s",
        business.id,
        len(items),
        modifiers_count,
        provider,
        filename,
    )
    return CatalogExtractResponse(
        items=[CatalogExtractedItem(**row) for row in items],
        provider=provider,
        item_count=len(items),
        modifiers_count=modifiers_count,
        message=message,
    )


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
    route.add_api_route(
        "/onboarding/skip-documentation",
        skip_documentation,
        methods=["POST"],
        response_model=BusinessRegistrationSummary,
    )
    route.add_api_route(
        "/onboarding/complete-catalog",
        complete_catalog_setup,
        methods=["POST"],
        response_model=BusinessRegistrationSummary,
    )
    route.add_api_route(
        "/catalog-items",
        create_catalog_items,
        methods=["POST"],
        response_model=CatalogItemsCreateResponse,
    )
    route.add_api_route(
        "/catalog-extract",
        extract_catalog_items,
        methods=["POST"],
        response_model=CatalogExtractResponse,
    )

router = vendor_router
