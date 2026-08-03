"""rename vendor role and user_roles.restaurant_id to business_id

Revision ID: g2b9d3e5f7c1
Revises: f1a8c2d4e6b0
Create Date: 2026-08-02

"""
from typing import Sequence, Union

from alembic import op

revision: str = "g2b9d3e5f7c1"
down_revision: Union[str, None] = "f1a8c2d4e6b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    UPDATE user_roles SET role = 'vendor' WHERE role = 'restaurant';
    UPDATE users SET role = 'vendor' WHERE role = 'restaurant';

    ALTER TABLE user_roles RENAME COLUMN restaurant_id TO business_id;

    DROP INDEX IF EXISTS idx_user_roles_restaurant_id;
    CREATE INDEX IF NOT EXISTS idx_user_roles_business_id ON user_roles (business_id);
    """)


def downgrade() -> None:
    op.execute("""
    DROP INDEX IF EXISTS idx_user_roles_business_id;

    ALTER TABLE user_roles RENAME COLUMN business_id TO restaurant_id;

    CREATE INDEX IF NOT EXISTS idx_user_roles_restaurant_id ON user_roles (restaurant_id);

    UPDATE user_roles SET role = 'restaurant' WHERE role = 'vendor';
    UPDATE users SET role = 'restaurant' WHERE role = 'vendor';
    """)
