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
ALLOWED_KINDS = {"logo", "cover", "document"}


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


def upload_folder_for(kind: str, user_id: str, document_key: str | None = None) -> str:
    base = settings.CLOUDINARY_UPLOAD_FOLDER.strip().rstrip("/")
    safe_user_id = re.sub(r"[^a-zA-Z0-9_-]", "", user_id)
    if kind == "logo":
        subfolder = "logos"
    elif kind == "cover":
        subfolder = "covers"
    else:
        safe_key = re.sub(r"[^a-zA-Z0-9_-]", "", document_key or "misc")
        return f"{base}/{safe_user_id}/documents/{safe_key}"
    return f"{base}/{safe_user_id}/{subfolder}"


async def upload_restaurant_image(
    file: UploadFile,
    kind: str,
    user_id: str,
    document_key: str | None = None,
) -> dict[str, str]:
    if kind not in ALLOWED_KINDS:
        raise HTTPException(status_code=400, detail="Invalid image kind")

    if kind == "document" and not document_key:
        raise HTTPException(status_code=400, detail="document_key is required for document uploads")

    content_type = (file.content_type or "").lower()
    allowed_types = ALLOWED_DOCUMENT_CONTENT_TYPES if kind == "document" else ALLOWED_CONTENT_TYPES
    if content_type not in allowed_types:
        detail = "Only JPEG, PNG, WEBP, GIF, or PDF files are allowed" if kind == "document" else "Only JPEG, PNG, WEBP, or GIF images are allowed"
        raise HTTPException(status_code=400, detail=detail)

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    max_bytes = MAX_DOCUMENT_BYTES if kind == "document" else MAX_IMAGE_BYTES
    if len(data) > max_bytes:
        limit = "10MB" if kind == "document" else "5MB"
        raise HTTPException(status_code=400, detail=f"File must be {limit} or smaller")

    configure_cloudinary()
    folder = upload_folder_for(kind, user_id, document_key=document_key)
    resource_type = "auto" if kind == "document" else "image"

    try:
        result = cloudinary.uploader.upload(
            data,
            folder=folder,
            resource_type=resource_type,
            overwrite=True,
            use_filename=True,
            unique_filename=True,
        )
    except Exception as exc:
        log.error("Cloudinary upload failed: %s", exc)
        raise HTTPException(status_code=502, detail="Failed to upload file") from exc

    secure_url = result.get("secure_url")
    public_id = result.get("public_id")
    if not secure_url or not public_id:
        raise HTTPException(status_code=502, detail="Upload succeeded but no URL was returned")

    return {"url": secure_url, "public_id": public_id}
