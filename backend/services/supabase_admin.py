"""
Supabase Auth Admin API (service role).
Same endpoint as backend/scripts/delete_users.py — used for self-service account deletion.
"""

import logging

import httpx

from config import settings

log = logging.getLogger(__name__)


async def delete_auth_user(user_id: str) -> str | None:
    """
    Delete a user from Supabase Auth via Admin API.

    Returns None on success. On failure, returns a short error message for the API client.
    """
    base = (settings.SUPABASE_URL or "").rstrip("/")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or ""

    if not base or not key:
        log.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; cannot delete auth user")
        return "Server is not configured to remove the login account (missing Supabase admin credentials)."

    url = f"{base}/auth/v1/admin/users/{user_id}"
    headers = {"Authorization": f"Bearer {key}", "apikey": key}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(url, headers=headers)
    except Exception as e:
        log.exception("Supabase auth delete request failed")
        return str(e)

    if response.status_code in (200, 204):
        return None
    # Idempotent: user already removed from Auth
    if response.status_code == 404:
        log.info("Supabase auth user already absent: %s", user_id)
        return None

    body = (response.text or "").strip()[:500]
    log.error("Supabase auth delete failed: %s %s", response.status_code, body)
    return body or f"Auth service returned HTTP {response.status_code}"
