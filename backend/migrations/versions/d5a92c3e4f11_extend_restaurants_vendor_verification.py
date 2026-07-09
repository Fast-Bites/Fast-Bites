"""extend restaurants and user_roles for vendor business verification

Revision ID: d5a92c3e4f11
Revises: c4f81a2b9e03
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op

revision: str = "d5a92c3e4f11"
down_revision: Union[str, None] = "c4f81a2b9e03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_name text;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS business_type varchar(50);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description text;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS logo_url text;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone varchar(20);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS contact_person varchar(200);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS email varchar(255);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS landmark text;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS bank_name varchar(200);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS account_number varchar(50);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS account_holder_name varchar(200);
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS business_verified boolean NOT NULL DEFAULT false;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz;

    CREATE INDEX IF NOT EXISTS idx_restaurants_owner_user_id ON restaurants(owner_user_id);

    ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_user_roles_restaurant_id ON user_roles(restaurant_id);
    """)


def downgrade() -> None:
    op.execute("""
    DROP INDEX IF EXISTS idx_user_roles_restaurant_id;
    ALTER TABLE user_roles DROP COLUMN IF EXISTS restaurant_id;

    DROP INDEX IF EXISTS idx_restaurants_owner_user_id;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS verification_submitted_at;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS business_verified;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS account_holder_name;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS account_number;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS bank_name;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS landmark;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS email;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS contact_person;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS phone;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS logo_url;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS description;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS business_type;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS owner_name;
    ALTER TABLE restaurants DROP COLUMN IF EXISTS owner_user_id;
    """)
