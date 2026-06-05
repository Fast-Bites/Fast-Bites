"""add wallet cart support tables and extend existing schema

Revision ID: a7f3c91e2b40
Revises: 06cc9a401fa8
Create Date: 2026-05-21

"""
from typing import Sequence, Union

from alembic import op

revision: str = "a7f3c91e2b40"
down_revision: Union[str, None] = "06cc9a401fa8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    -- ENUMs
    DO $$ BEGIN CREATE TYPE wallet_tx_type AS ENUM ('deposit', 'sent', 'received');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN CREATE TYPE wallet_tx_status AS ENUM ('Received', 'Successful', 'Fail');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN CREATE TYPE deposit_method AS ENUM ('wallet', 'card', 'bank');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN CREATE TYPE deposit_status AS ENUM ('pending', 'successful', 'failed');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN CREATE TYPE order_status AS ENUM (
      'pending', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled'
    ); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN CREATE TYPE support_sender_type AS ENUM ('user', 'support', 'system');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    -- Extend users
    ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude double precision;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude double precision;

    -- Extend menu_items
    ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category text;
    DO $$ BEGIN
      ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
        CHECK (category IS NULL OR category IN ('food', 'drinks'));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    -- Extend orders (table already exists with customer_id)
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal double precision;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee double precision DEFAULT 1500;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_minutes integer;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

    -- Extend order_items
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS name text;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS description text;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url text;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price double precision;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_json jsonb NOT NULL DEFAULT '{}';

    UPDATE order_items oi SET name = mi.name
    FROM menu_items mi WHERE oi.menu_item_id = mi.id AND oi.name IS NULL;

    UPDATE order_items SET unit_price = price_at_order
    WHERE unit_price IS NULL AND price_at_order IS NOT NULL;

    -- restaurant_hours
    CREATE TABLE IF NOT EXISTS restaurant_hours (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      open_time time,
      close_time time,
      is_closed boolean NOT NULL DEFAULT false,
      UNIQUE (restaurant_id, day_of_week)
    );
    CREATE INDEX IF NOT EXISTS idx_restaurant_hours_restaurant ON restaurant_hours (restaurant_id);

    -- menu modifiers
    CREATE TABLE IF NOT EXISTS menu_modifier_groups (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
      name text NOT NULL,
      sort_order int NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS menu_modifier_options (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id uuid NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
      label text NOT NULL,
      price_delta numeric(10,2) NOT NULL DEFAULT 0,
      sort_order int NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_modifier_groups_menu_item ON menu_modifier_groups (menu_item_id);

    -- wallets
    CREATE TABLE IF NOT EXISTS wallets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      balance numeric(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
      currency char(3) NOT NULL DEFAULT 'NGN',
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS payment_cards (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cardholder_name text NOT NULL,
      last_four char(4) NOT NULL,
      brand text,
      exp_month smallint NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
      exp_year smallint NOT NULL,
      provider_token text,
      save_details boolean NOT NULL DEFAULT true,
      is_default boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS deposit_accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      owner_name text NOT NULL,
      wallet_id text NOT NULL,
      gateway text NOT NULL,
      account_number text NOT NULL,
      bank_name text,
      recipient_name text,
      is_active boolean NOT NULL DEFAULT true
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_deposit_accounts_user_account
      ON deposit_accounts (user_id, account_number);

    CREATE TABLE IF NOT EXISTS deposits (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
      method deposit_method NOT NULL,
      amount numeric(12,2) NOT NULL CHECK (amount > 0),
      status deposit_status NOT NULL DEFAULT 'pending',
      payment_card_id uuid REFERENCES payment_cards(id) ON DELETE SET NULL,
      external_reference text,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type wallet_tx_type NOT NULL,
      amount numeric(12,2) NOT NULL CHECK (amount > 0),
      status wallet_tx_status NOT NULL,
      title text,
      reference text,
      deposit_id uuid REFERENCES deposits(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_created ON wallet_transactions (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_payment_cards_user ON payment_cards (user_id);

    -- cart
    CREATE TABLE IF NOT EXISTS cart_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
      name text NOT NULL,
      description text,
      unit_price numeric(10,2) NOT NULL,
      quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
      image_url text,
      section text CHECK (section IS NULL OR section IN ('main', 'extras')),
      options_json jsonb NOT NULL DEFAULT '{}',
      special_instructions text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_cart_items_user_restaurant ON cart_items (user_id, restaurant_id);

    -- order tracking (orders / order_items already exist)
    CREATE TABLE IF NOT EXISTS order_tracking_steps (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      step_order smallint NOT NULL,
      label text NOT NULL,
      description text NOT NULL,
      is_completed boolean NOT NULL DEFAULT false,
      completed_at timestamptz,
      show_view_action boolean NOT NULL DEFAULT false,
      UNIQUE (order_id, step_order)
    );
    CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders (customer_id, created_at DESC);

    -- support
    CREATE TABLE IF NOT EXISTS support_conversations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_message_preview text,
      last_message_at timestamptz,
      unread_count int NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
      is_typing boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS support_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id uuid NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
      sender_type support_sender_type NOT NULL,
      body text NOT NULL,
      read_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS support_reply_templates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      body text NOT NULL,
      is_active boolean NOT NULL DEFAULT true
    );
    CREATE INDEX IF NOT EXISTS idx_support_messages_conversation
      ON support_messages (conversation_id, created_at);

    CREATE OR REPLACE VIEW wallet_transaction_feed AS
    SELECT
      t.id,
      t.user_id,
      t.type::text AS type,
      t.amount,
      t.status::text AS status,
      coalesce(t.title, initcap(t.type::text)) AS title,
      t.created_at,
      (t.type IN ('deposit', 'received')) AS is_positive
    FROM wallet_transactions t;
    """)


def downgrade() -> None:
    op.execute("""
    DROP VIEW IF EXISTS wallet_transaction_feed;

    DROP TABLE IF EXISTS support_messages CASCADE;
    DROP TABLE IF EXISTS support_conversations CASCADE;
    DROP TABLE IF EXISTS support_reply_templates CASCADE;
    DROP TABLE IF EXISTS order_tracking_steps CASCADE;
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS wallet_transactions CASCADE;
    DROP TABLE IF EXISTS deposits CASCADE;
    DROP TABLE IF EXISTS deposit_accounts CASCADE;
    DROP TABLE IF EXISTS payment_cards CASCADE;
    DROP TABLE IF EXISTS wallets CASCADE;
    DROP TABLE IF EXISTS menu_modifier_options CASCADE;
    DROP TABLE IF EXISTS menu_modifier_groups CASCADE;
    DROP TABLE IF EXISTS restaurant_hours CASCADE;

    ALTER TABLE order_items DROP COLUMN IF EXISTS options_json;
    ALTER TABLE order_items DROP COLUMN IF EXISTS unit_price;
    ALTER TABLE order_items DROP COLUMN IF EXISTS image_url;
    ALTER TABLE order_items DROP COLUMN IF EXISTS description;
    ALTER TABLE order_items DROP COLUMN IF EXISTS name;

    ALTER TABLE orders DROP COLUMN IF EXISTS updated_at;
    ALTER TABLE orders DROP COLUMN IF EXISTS estimated_delivery_minutes;
    ALTER TABLE orders DROP COLUMN IF EXISTS delivery_fee;
    ALTER TABLE orders DROP COLUMN IF EXISTS subtotal;

    ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
    ALTER TABLE menu_items DROP COLUMN IF EXISTS category;

    ALTER TABLE users DROP COLUMN IF EXISTS longitude;
    ALTER TABLE users DROP COLUMN IF EXISTS latitude;

    DROP TYPE IF EXISTS support_sender_type;
    DROP TYPE IF EXISTS order_status;
    DROP TYPE IF EXISTS deposit_status;
    DROP TYPE IF EXISTS deposit_method;
    DROP TYPE IF EXISTS wallet_tx_status;
    DROP TYPE IF EXISTS wallet_tx_type;
    """)
