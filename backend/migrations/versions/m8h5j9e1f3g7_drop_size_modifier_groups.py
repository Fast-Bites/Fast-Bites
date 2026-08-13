"""drop size modifier groups from catalog

Revision ID: m8h5j9e1f3g7
Revises: l7g4i8d0e2f6
Create Date: 2026-08-12

Sizes are separate products (e.g. "Pizza — Medium"), not modifier options.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "m8h5j9e1f3g7"
down_revision: Union[str, None] = "l7g4i8d0e2f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Options cascade via FK on group delete.
    op.execute(
        """
        DELETE FROM menu_modifier_groups
        WHERE lower(name) = 'size'
           OR lower(name) LIKE '%size%';
        """
    )
    # Scrub size keys from open cart lines (orders keep historical snapshots).
    op.execute(
        """
        UPDATE cart_items
        SET options_json = COALESCE(options_json, '{}'::jsonb)
                          - 'size' - 'size_id' - 'size_price'
        WHERE options_json IS NOT NULL
          AND options_json ?| array['size', 'size_id', 'size_price'];
        """
    )


def downgrade() -> None:
    # Size groups are not restored; vendors re-list sizes as separate products.
    pass
