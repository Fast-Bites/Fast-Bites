import logging
import re
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile

from config import settings

log = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOCUMENT_CONTENT_TYPES = ALLOWED_CONTENT_TYPES | {"application/pdf"}
ALLOWED_KINDS = {"logo", "cover", "document", "menu"}


def _normalize_cloudinary_url(raw: str) -> str:
    value = raw.strip()
    if value.startswith("CLOUDINARY_URL="):
        value = value.removeprefix("CLOUDINARY_URL=").strip()
    return value


def _parse_cloudinary_url(raw_url: str) -> tuple[str, str, str]:
    normalized = _normalize_cloudinary_url(raw_url)
    parsed = urlparse(normalized)

    if parsed.scheme != "cloudinary" or not parsed.hostname:
        raise ValueError("Invalid CLOUDINARY_URL")

    cloud_name = parsed.hostname
    api_key = parsed.username or ""
    api_secret = parsed.password or ""
    return cloud_name, api_key, api_secret


def _resolve_cloudinary_credentials() -> tuple[str, str, str]:
    cloud_name = settings.CLOUDINARY_CLOUD_NAME.strip()
    api_key = settings.CLOUDINARY_API_KEY.strip()
    api_secret = settings.CLOUDINARY_API_SECRET.strip()

    if settings.CLOUDINARY_URL.strip():
        parsed_name, parsed_key, parsed_secret = _parse_cloudinary_url(settings.CLOUDINARY_URL)
        cloud_name = cloud_name or parsed_name
        api_key = api_key or parsed_key
        api_secret = api_secret or parsed_secret

    if not cloud_name or not api_key or not api_secret:
        raise HTTPException(status_code=503, detail="Cloudinary is not configured")

    return cloud_name, api_key, api_secret


def configure_cloudinary() -> None:
    cloud_name, api_key, api_secret = _resolve_cloudinary_credentials()
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def _slugify(value: str, fallback: str = "item") -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", (value or "").strip().lower()).strip("-")
    return slug[:80] or fallback


def upload_folder_for(
    kind: str,
    user_id: str,
    document_key: str | None = None,
    *,
    restaurant_id: str | None = None,
    restaurant_name: str | None = None,
    menu_item_name: str | None = None,
) -> str:
    """
    Cloudinary layout for easy browsing:

    fast_bites/restaurants/vendors/{restaurant_slug}/logo
    fast_bites/restaurants/vendors/{restaurant_slug}/cover
    fast_bites/restaurants/vendors/{restaurant_slug}/menu/{item_slug}
    fast_bites/restaurants/vendors/{restaurant_slug}/documents/{key}

    Registration uploads (before a restaurant row exists) still use:
    fast_bites/restaurants/{user_id}/logos|covers|documents/...
    """
    base = settings.CLOUDINARY_UPLOAD_FOLDER.strip().rstrip("/")

    if restaurant_id or restaurant_name:
        vendor_key = _slugify(restaurant_name or "", fallback="") or _slugify(
            restaurant_id or "", fallback="vendor"
        )
        vendor_root = f"{base}/vendors/{vendor_key}"

        if kind == "logo":
            return f"{vendor_root}/logo"
        if kind == "cover":
            return f"{vendor_root}/cover"
        if kind == "menu":
            return f"{vendor_root}/menu"
        safe_key = _slugify(document_key or "misc")
        return f"{vendor_root}/documents/{safe_key}"

    safe_user_id = re.sub(r"[^a-zA-Z0-9_-]", "", user_id)
    if kind == "logo":
        return f"{base}/{safe_user_id}/logos"
    if kind == "cover":
        return f"{base}/{safe_user_id}/covers"
    if kind == "menu":
        return f"{base}/{safe_user_id}/menu"

    safe_key = re.sub(r"[^a-zA-Z0-9_-]", "", document_key or "misc")
    return f"{base}/{safe_user_id}/documents/{safe_key}"


async def upload_restaurant_image(
    file: UploadFile,
    kind: str,
    user_id: str,
    document_key: str | None = None,
    *,
    restaurant_id: str | None = None,
    restaurant_name: str | None = None,
    menu_item_name: str | None = None,
) -> dict[str, str]:
    if kind not in ALLOWED_KINDS:
        raise HTTPException(status_code=400, detail="Invalid image kind")

    if kind == "document" and not document_key:
        raise HTTPException(status_code=400, detail="document_key is required for document uploads")

    content_type = (file.content_type or "").lower()
    allowed_types = ALLOWED_DOCUMENT_CONTENT_TYPES if kind == "document" else ALLOWED_CONTENT_TYPES
    if content_type not in allowed_types:
        detail = (
            "Only JPEG, PNG, WEBP, GIF, or PDF files are allowed"
            if kind == "document"
            else "Only JPEG, PNG, WEBP, or GIF images are allowed"
        )
        raise HTTPException(status_code=400, detail=detail)

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    max_bytes = MAX_DOCUMENT_BYTES if kind == "document" else MAX_IMAGE_BYTES
    if len(data) > max_bytes:
        limit = "10MB" if kind == "document" else "5MB"
        raise HTTPException(status_code=400, detail=f"File must be {limit} or smaller")

    configure_cloudinary()
    folder = upload_folder_for(
        kind,
        user_id,
        document_key=document_key,
        restaurant_id=restaurant_id,
        restaurant_name=restaurant_name,
        menu_item_name=menu_item_name,
    )
    resource_type = "auto" if kind == "document" else "image"
    public_id = None
    if kind == "menu" and menu_item_name:
        public_id = _slugify(menu_item_name)
    elif kind in {"logo", "cover"}:
        public_id = kind

    try:
        upload_kwargs: dict = {
            "folder": folder,
            "resource_type": resource_type,
            "overwrite": True,
            "unique_filename": public_id is None,
        }
        if public_id:
            upload_kwargs["public_id"] = public_id
            upload_kwargs["use_filename"] = False
        else:
            upload_kwargs["use_filename"] = True

        result = cloudinary.uploader.upload(data, **upload_kwargs)
    except Exception as exc:
        log.error("Cloudinary upload failed: %s", exc)
        raise HTTPException(status_code=502, detail="Failed to upload file") from exc

    secure_url = result.get("secure_url")
    public_id_result = result.get("public_id")
    if not secure_url or not public_id_result:
        raise HTTPException(status_code=502, detail="Upload succeeded but no URL was returned")

    return {"url": secure_url, "public_id": public_id_result}


def upload_image_from_url(
    image_url: str,
    *,
    kind: str,
    restaurant_id: str,
    restaurant_name: str,
    menu_item_name: str | None = None,
) -> dict[str, str]:
    """Upload a remote image URL into the vendor folder structure (used by seed scripts)."""
    if kind not in ALLOWED_KINDS:
        raise ValueError(f"Invalid kind: {kind}")

    configure_cloudinary()
    folder = upload_folder_for(
        kind,
        user_id=restaurant_id,
        restaurant_id=restaurant_id,
        restaurant_name=restaurant_name,
        menu_item_name=menu_item_name,
    )
    public_id = _slugify(menu_item_name) if kind == "menu" and menu_item_name else kind

    result = cloudinary.uploader.upload(
        image_url,
        folder=folder,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
        use_filename=False,
        unique_filename=False,
    )
    secure_url = result.get("secure_url")
    public_id_result = result.get("public_id")
    if not secure_url or not public_id_result:
        raise RuntimeError("Upload succeeded but no URL was returned")
    return {"url": secure_url, "public_id": public_id_result}
