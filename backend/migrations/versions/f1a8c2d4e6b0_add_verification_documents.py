"""add verification_documents to restaurants

Revision ID: f1a8c2d4e6b0
Revises: e6b03d4f5a22
Create Date: 2026-05-21

"""
from typing import Sequence, Union

from alembic import op

revision: str = "f1a8c2d4e6b0"
down_revision: Union[str, None] = "e6b03d4f5a22"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS verification_documents jsonb;
    """)


def downgrade() -> None:
    op.execute("""
    ALTER TABLE restaurants DROP COLUMN IF EXISTS verification_documents;
    """)
