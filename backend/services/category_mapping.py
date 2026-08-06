"""Map vendor free-text categories onto official platform categories."""

from __future__ import annotations

import logging
from uuid import UUID

from models.platform_category import PlatformCategory
from services.llm import chat_json

log = logging.getLogger(__name__)


def _normalize(value: str | None) -> str:
    return " ".join((value or "").strip().lower().split())


def _by_slug(categories: list[PlatformCategory]) -> dict[str, PlatformCategory]:
    return {c.slug: c for c in categories}


def _map_bakery_confectionery(
    haystacks: list[str],
    categories: list[PlatformCategory],
) -> PlatformCategory | None:
    """Fold bakery/pastry/confectionery into Food / Desserts / Sides — never a 5th tab."""
    by_slug = _by_slug(categories)
    desserts = by_slug.get("desserts")
    sides = by_slug.get("sides")
    food = by_slug.get("food")
    if not (desserts or sides or food):
        return None

    joined = " ".join(haystacks)
    savory_sides = ("bread", "roll", "rolls", "bun", "buns", "bagel", "toast")
    savory_food = ("sandwich", "burger", "pie", "meat pie", "sausage roll", "puff")
    sweet = (
        "bakery",
        "pastry",
        "pastries",
        "confection",
        "cake",
        "cakes",
        "cookie",
        "cookies",
        "biscuit",
        "biscuits",
        "doughnut",
        "donut",
        "muffin",
        "cupcake",
        "brownie",
        "sweet",
        "sweets",
        "dessert",
        "chin chin",
        "puff puff",
    )

    if any(w in joined for w in savory_food) and food:
        return food
    if any(w in joined for w in savory_sides) and sides:
        return sides
    if any(w in joined for w in sweet):
        return desserts or food
    return None


def rule_map_platform_category(
    *,
    vendor_category: str | None,
    item_name: str,
    categories: list[PlatformCategory],
) -> PlatformCategory | None:
    if not categories:
        return None

    haystacks = []
    if vendor_category:
        haystacks.append(_normalize(vendor_category))
    if item_name:
        haystacks.append(_normalize(item_name))

    bakery_hit = _map_bakery_confectionery(haystacks, categories)
    if bakery_hit:
        return bakery_hit

    other = None
    for cat in categories:
        if cat.slug == "other":
            other = cat
        if cat.slug == "bakery":
            # Legacy/erroneous slug — never surface as browse tab
            continue
        needle = _normalize(cat.name)
        slug = _normalize(cat.slug.replace("_", " "))
        for hay in haystacks:
            if not hay:
                continue
            if hay == needle or hay == slug or needle in hay or slug in hay or hay in needle:
                return cat

    return other


async def map_platform_category(
    *,
    vendor_category: str | None,
    item_name: str,
    categories: list[PlatformCategory],
) -> PlatformCategory:
    matched = rule_map_platform_category(
        vendor_category=vendor_category,
        item_name=item_name,
        categories=categories,
    )
    # Strong rule hit that isn't only "other"
    if matched and matched.slug != "other":
        return matched

    other = next((c for c in categories if c.slug == "other"), None) or categories[0]
    usable = [c for c in categories if c.slug not in {"other", "bakery"}]

    try:
        payload = await chat_json(
            system=(
                "You map a vendor's product into one official browse category "
                "for their business type. "
                "For restaurants: never invent Bakery; map bakery, pastries, "
                "and confectioneries into food, desserts, or sides. "
                "Reply with JSON only: {\"slug\": \"...\"}."
            ),
            user=(
                f"Business type categories available below.\n"
                f"Item name: {item_name}\n"
                f"Vendor category: {vendor_category or '(none)'}\n"
                "Official categories (pick exactly one slug):\n"
                + "\n".join(f"- {c.slug}: {c.name}" for c in (usable or categories))
            ),
        )
        slug = _normalize(str(payload.get("slug") or ""))
        if slug == "bakery":
            slug = "desserts"
        for cat in categories:
            if cat.slug == slug or _normalize(cat.name) == slug:
                if cat.slug == "bakery":
                    return next((c for c in categories if c.slug == "desserts"), cat)
                return cat
    except Exception as exc:
        log.warning("LLM category mapping failed, using fallback: %s", exc)

    return matched or other


async def resolve_platform_category_id(
    *,
    vendor_category: str | None,
    item_name: str,
    categories: list[PlatformCategory],
) -> UUID:
    cat = await map_platform_category(
        vendor_category=vendor_category,
        item_name=item_name,
        categories=categories,
    )
    return cat.id
