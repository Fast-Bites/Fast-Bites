"""cleanup menu_items categories and drop calories

Revision ID: i4d1f5a7b9c3
Revises: h3c0e4f6a8b2
Create Date: 2026-08-04

- Drop leftover calories column (remove migration was a no-op)
- Keep menu_items.category as platform slug mirror only
- Backfill vendor_category from platform category display name
  for existing items that never had a free-text label
"""

from typing import Sequence, Union

from alembic import op

revision: str = "i4d1f5a7b9c3"
down_revision: Union[str, None] = "h3c0e4f6a8b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE menu_items DROP COLUMN IF EXISTS calories;

        -- Ensure every item with a platform category has the slug mirror
        UPDATE menu_items mi
        SET category = pc.slug
        FROM platform_categories pc
        WHERE mi.platform_category_id = pc.id
          AND (mi.category IS NULL OR mi.category = '' OR lower(mi.category) <> pc.slug);

        -- Link any remaining slug-only rows (match restaurant business type)
        UPDATE menu_items mi
        SET platform_category_id = pc.id
        FROM platform_categories pc, restaurants r
        WHERE mi.restaurant_id = r.id
          AND mi.platform_category_id IS NULL
          AND mi.category IS NOT NULL
          AND lower(mi.category) = pc.slug
          AND lower(pc.business_type) = lower(COALESCE(r.business_type, 'Restaurant'));

        -- Save a vendor-facing category label for current menus
        UPDATE menu_items mi
        SET vendor_category = pc.name
        FROM platform_categories pc
        WHERE mi.platform_category_id = pc.id
          AND (mi.vendor_category IS NULL OR btrim(mi.vendor_category) = '');
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS calories integer;
        """
    )
