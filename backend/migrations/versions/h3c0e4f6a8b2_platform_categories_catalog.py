"""platform categories and catalog fields on menu_items

Revision ID: h3c0e4f6a8b2
Revises: g2b9d3e5f7c1
Create Date: 2026-08-04

"""
from typing import Sequence, Union

from alembic import op

revision: str = "h3c0e4f6a8b2"
down_revision: Union[str, None] = "g2b9d3e5f7c1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS platform_categories (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            business_type varchar(50) NOT NULL,
            slug varchar(64) NOT NULL,
            name varchar(120) NOT NULL,
            sort_order integer NOT NULL DEFAULT 0,
            UNIQUE (business_type, slug)
        );

        CREATE INDEX IF NOT EXISTS idx_platform_categories_business_type
            ON platform_categories (business_type);

        INSERT INTO platform_categories (id, business_type, slug, name, sort_order) VALUES
            (gen_random_uuid(), 'Restaurant', 'food', 'Food', 1),
            (gen_random_uuid(), 'Restaurant', 'drinks', 'Drinks', 2),
            (gen_random_uuid(), 'Restaurant', 'desserts', 'Desserts', 3),
            (gen_random_uuid(), 'Restaurant', 'sides', 'Sides', 4),
            (gen_random_uuid(), 'Restaurant', 'other', 'Other', 99),
            (gen_random_uuid(), 'Shop', 'groceries', 'Groceries', 1),
            (gen_random_uuid(), 'Shop', 'electronics', 'Electronics', 2),
            (gen_random_uuid(), 'Shop', 'household', 'Household', 3),
            (gen_random_uuid(), 'Shop', 'fashion', 'Fashion', 4),
            (gen_random_uuid(), 'Shop', 'other', 'Other', 99),
            (gen_random_uuid(), 'Pharmacy', 'otc', 'Over-the-counter', 1),
            (gen_random_uuid(), 'Pharmacy', 'prescription', 'Prescription', 2),
            (gen_random_uuid(), 'Pharmacy', 'personal_care', 'Personal care', 3),
            (gen_random_uuid(), 'Pharmacy', 'wellness', 'Wellness', 4),
            (gen_random_uuid(), 'Pharmacy', 'other', 'Other', 99),
            (gen_random_uuid(), 'Market', 'produce', 'Produce', 1),
            (gen_random_uuid(), 'Market', 'grains', 'Grains', 2),
            (gen_random_uuid(), 'Market', 'meat_fish', 'Meat & fish', 3),
            (gen_random_uuid(), 'Market', 'spices', 'Spices', 4),
            (gen_random_uuid(), 'Market', 'other', 'Other', 99)
        ON CONFLICT (business_type, slug) DO NOTHING;

        ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS vendor_category text;
        ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS platform_category_id uuid
            REFERENCES platform_categories(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_menu_items_platform_category_id
            ON menu_items (platform_category_id);

        -- Drop legacy food|drinks-only check if present
        ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;

        -- Backfill restaurant food/drinks into platform_category_id
        UPDATE menu_items mi
        SET platform_category_id = pc.id
        FROM platform_categories pc
        WHERE mi.platform_category_id IS NULL
          AND mi.category IS NOT NULL
          AND lower(mi.category) = pc.slug
          AND pc.business_type = 'Restaurant';

        -- Keep legacy category column in sync when empty but platform set (no-op for backfill above)
        UPDATE menu_items mi
        SET category = pc.slug
        FROM platform_categories pc
        WHERE mi.platform_category_id = pc.id
          AND (mi.category IS NULL OR mi.category = '');
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE menu_items DROP COLUMN IF EXISTS platform_category_id;
        ALTER TABLE menu_items DROP COLUMN IF EXISTS vendor_category;

        DROP TABLE IF EXISTS platform_categories;

        ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
        ALTER TABLE menu_items
            ADD CONSTRAINT menu_items_category_check
            CHECK (category IS NULL OR category IN ('food', 'drinks'));
        """
    )
