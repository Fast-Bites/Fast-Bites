"""add documentation_skipped_at and catalog_setup_completed_at

Revision ID: l7g4i8d0e2f6
Revises: k6f3h7c9d1e5
Create Date: 2026-08-06
"""

from typing import Sequence, Union

from alembic import op

revision: str = "l7g4i8d0e2f6"
down_revision: Union[str, None] = "k6f3h7c9d1e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE restaurants
            ADD COLUMN IF NOT EXISTS documentation_skipped_at timestamptz NULL,
            ADD COLUMN IF NOT EXISTS catalog_setup_completed_at timestamptz NULL;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE restaurants
            DROP COLUMN IF EXISTS catalog_setup_completed_at,
            DROP COLUMN IF EXISTS documentation_skipped_at;
        """
    )
