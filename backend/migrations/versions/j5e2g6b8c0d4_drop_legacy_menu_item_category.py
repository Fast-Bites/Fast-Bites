"""drop legacy menu_items.category column

Revision ID: j5e2g6b8c0d4
Revises: i4d1f5a7b9c3
Create Date: 2026-08-04

Browse filtering uses platform_categories via platform_category_id.
vendor_category keeps the vendor's free-text label.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "j5e2g6b8c0d4"
down_revision: Union[str, None] = "i4d1f5a7b9c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        -- Final sync before drop: slug mirror must match platform row
        UPDATE menu_items mi
        SET category = pc.slug
        FROM platform_categories pc
        WHERE mi.platform_category_id = pc.id;

        ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
        ALTER TABLE menu_items DROP COLUMN IF EXISTS category;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category varchar(64);

        UPDATE menu_items mi
        SET category = pc.slug
        FROM platform_categories pc
        WHERE mi.platform_category_id = pc.id;
        """
    )
