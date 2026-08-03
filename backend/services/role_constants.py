VENDOR_ROLE = "vendor"
CUSTOMER_ROLE = "customer"
RIDER_ROLE = "rider"
LEGACY_VENDOR_ROLE = "restaurant"

VALID_ROLES = {CUSTOMER_ROLE, RIDER_ROLE, VENDOR_ROLE}


def normalize_role(role: str | None) -> str | None:
    if role is None:
        return None
    value = role.strip().lower()
    if value == LEGACY_VENDOR_ROLE:
        return VENDOR_ROLE
    return value


def is_valid_role(role: str | None) -> bool:
    normalized = normalize_role(role)
    return normalized in VALID_ROLES if normalized else False
