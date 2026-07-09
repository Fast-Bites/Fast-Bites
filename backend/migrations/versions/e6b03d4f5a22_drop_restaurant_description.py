"""drop restaurant description column

Revision ID: e6b03d4f5a22
Revises: d5a92c3e4f11
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op

revision: str = "e6b03d4f5a22"
down_revision: Union[str, None] = "d5a92c3e4f11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE restaurants DROP COLUMN IF EXISTS description;")


def downgrade() -> None:
    op.execute("ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description text;")
