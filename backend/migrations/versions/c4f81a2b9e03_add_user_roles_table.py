"""add user_roles table for multi-role profiles

Revision ID: c4f81a2b9e03
Revises: b8e4d02f3c51
Create Date: 2026-06-06

"""
from typing import Sequence, Union

from alembic import op

revision: str = "c4f81a2b9e03"
down_revision: Union[str, None] = "b8e4d02f3c51"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role varchar(20) NOT NULL,
      first_name varchar(100) NOT NULL,
      last_name varchar(100) NOT NULL,
      phone varchar(20),
      dob date,
      google_id varchar(255) UNIQUE,
      profile_image text,
      address text,
      city varchar(100),
      state varchar(100),
      latitude double precision,
      longitude double precision,
      updated_at timestamp without time zone,
      PRIMARY KEY (user_id, role)
    );

    INSERT INTO user_roles (
      user_id, role, first_name, last_name, phone, dob, google_id,
      profile_image, address, city, state, latitude, longitude, updated_at
    )
    SELECT
      id,
      COALESCE(role, 'customer'),
      first_name,
      last_name,
      phone,
      dob,
      google_id,
      profile_image,
      address,
      city,
      state,
      latitude,
      longitude,
      updated_at
    FROM users
    ON CONFLICT (user_id, role) DO NOTHING;
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_roles;")
