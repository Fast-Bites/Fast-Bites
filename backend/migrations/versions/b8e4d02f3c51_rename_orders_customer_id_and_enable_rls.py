"""rename orders.customer_id to user_id and enable RLS policies

Revision ID: b8e4d02f3c51
Revises: a7f3c91e2b40
Create Date: 2026-05-21

"""
from typing import Sequence, Union

from alembic import op

revision: str = "b8e4d02f3c51"
down_revision: Union[str, None] = "a7f3c91e2b40"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Align with wallets, cart_items, etc. (no app code referenced customer_id yet)
    op.execute("""
    ALTER TABLE orders RENAME COLUMN customer_id TO user_id;

    DROP INDEX IF EXISTS idx_orders_customer_created;
    CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC);
    """)

    op.execute("""
    -- -------------------------------------------------------------------------
    -- Row Level Security (Supabase "Unrestricted" → locked to owning user / public read)
    -- Backend using DATABASE_URL as postgres/service role bypasses RLS (API keeps working).
    -- -------------------------------------------------------------------------

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE restaurant_hours ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_modifier_groups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_modifier_options ENABLE ROW LEVEL SECURITY;
    ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE payment_cards ENABLE ROW LEVEL SECURITY;
    ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
    ALTER TABLE deposit_accounts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE order_tracking_steps ENABLE ROW LEVEL SECURITY;
    ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE support_reply_templates ENABLE ROW LEVEL SECURITY;

    -- users
    DROP POLICY IF EXISTS users_select_own ON users;
    CREATE POLICY users_select_own ON users FOR SELECT TO authenticated
      USING (id = auth.uid());
    DROP POLICY IF EXISTS users_update_own ON users;
    CREATE POLICY users_update_own ON users FOR UPDATE TO authenticated
      USING (id = auth.uid()) WITH CHECK (id = auth.uid());

    -- catalog (read for any signed-in user)
    DROP POLICY IF EXISTS restaurants_read ON restaurants;
    CREATE POLICY restaurants_read ON restaurants FOR SELECT TO authenticated
      USING (true);
    DROP POLICY IF EXISTS menus_read ON menus;
    CREATE POLICY menus_read ON menus FOR SELECT TO authenticated
      USING (true);
    DROP POLICY IF EXISTS menu_items_read ON menu_items;
    CREATE POLICY menu_items_read ON menu_items FOR SELECT TO authenticated
      USING (true);
    DROP POLICY IF EXISTS restaurant_hours_read ON restaurant_hours;
    CREATE POLICY restaurant_hours_read ON restaurant_hours FOR SELECT TO authenticated
      USING (true);
    DROP POLICY IF EXISTS menu_modifier_groups_read ON menu_modifier_groups;
    CREATE POLICY menu_modifier_groups_read ON menu_modifier_groups FOR SELECT TO authenticated
      USING (true);
    DROP POLICY IF EXISTS menu_modifier_options_read ON menu_modifier_options;
    CREATE POLICY menu_modifier_options_read ON menu_modifier_options FOR SELECT TO authenticated
      USING (true);

    -- wallet
    DROP POLICY IF EXISTS wallets_own ON wallets;
    CREATE POLICY wallets_own ON wallets FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS wallet_transactions_own ON wallet_transactions;
    CREATE POLICY wallet_transactions_own ON wallet_transactions FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS payment_cards_own ON payment_cards;
    CREATE POLICY payment_cards_own ON payment_cards FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS deposits_own ON deposits;
    CREATE POLICY deposits_own ON deposits FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS deposit_accounts_read ON deposit_accounts;
    CREATE POLICY deposit_accounts_read ON deposit_accounts FOR SELECT TO authenticated
      USING (user_id IS NULL OR user_id = auth.uid());
    DROP POLICY IF EXISTS deposit_accounts_insert_own ON deposit_accounts;
    CREATE POLICY deposit_accounts_insert_own ON deposit_accounts FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());

    -- cart
    DROP POLICY IF EXISTS cart_items_own ON cart_items;
    CREATE POLICY cart_items_own ON cart_items FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

    -- orders
    DROP POLICY IF EXISTS orders_own ON orders;
    CREATE POLICY orders_own ON orders FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS order_items_via_order ON order_items;
    CREATE POLICY order_items_via_order ON order_items FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
        )
      );
    DROP POLICY IF EXISTS order_tracking_via_order ON order_tracking_steps;
    CREATE POLICY order_tracking_via_order ON order_tracking_steps FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_tracking_steps.order_id AND o.user_id = auth.uid()
        )
      );

    -- support
    DROP POLICY IF EXISTS support_conversations_own ON support_conversations;
    CREATE POLICY support_conversations_own ON support_conversations FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS support_messages_via_conversation ON support_messages;
    CREATE POLICY support_messages_via_conversation ON support_messages FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM support_conversations c
          WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM support_conversations c
          WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()
        )
      );
    DROP POLICY IF EXISTS support_reply_templates_read ON support_reply_templates;
    CREATE POLICY support_reply_templates_read ON support_reply_templates FOR SELECT TO authenticated
      USING (is_active = true);
    """)


def downgrade() -> None:
    op.execute("""
    -- Drop policies (sample — drop all custom policies on these tables in Supabase if needed)
    DROP POLICY IF EXISTS support_reply_templates_read ON support_reply_templates;
    DROP POLICY IF EXISTS support_messages_via_conversation ON support_messages;
    DROP POLICY IF EXISTS support_conversations_own ON support_conversations;
    DROP POLICY IF EXISTS order_tracking_via_order ON order_tracking_steps;
    DROP POLICY IF EXISTS order_items_via_order ON order_items;
    DROP POLICY IF EXISTS orders_own ON orders;
    DROP POLICY IF EXISTS cart_items_own ON cart_items;
    DROP POLICY IF EXISTS deposit_accounts_insert_own ON deposit_accounts;
    DROP POLICY IF EXISTS deposit_accounts_read ON deposit_accounts;
    DROP POLICY IF EXISTS deposits_own ON deposits;
    DROP POLICY IF EXISTS payment_cards_own ON payment_cards;
    DROP POLICY IF EXISTS wallet_transactions_own ON wallet_transactions;
    DROP POLICY IF EXISTS wallets_own ON wallets;
    DROP POLICY IF EXISTS menu_modifier_options_read ON menu_modifier_options;
    DROP POLICY IF EXISTS menu_modifier_groups_read ON menu_modifier_groups;
    DROP POLICY IF EXISTS restaurant_hours_read ON restaurant_hours;
    DROP POLICY IF EXISTS menu_items_read ON menu_items;
    DROP POLICY IF EXISTS menus_read ON menus;
    DROP POLICY IF EXISTS restaurants_read ON restaurants;
    DROP POLICY IF EXISTS users_update_own ON users;
    DROP POLICY IF EXISTS users_select_own ON users;

    ALTER TABLE support_reply_templates DISABLE ROW LEVEL SECURITY;
    ALTER TABLE support_messages DISABLE ROW LEVEL SECURITY;
    ALTER TABLE support_conversations DISABLE ROW LEVEL SECURITY;
    ALTER TABLE order_tracking_steps DISABLE ROW LEVEL SECURITY;
    ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
    ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
    ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
    ALTER TABLE deposit_accounts DISABLE ROW LEVEL SECURITY;
    ALTER TABLE deposits DISABLE ROW LEVEL SECURITY;
    ALTER TABLE payment_cards DISABLE ROW LEVEL SECURITY;
    ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_modifier_options DISABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_modifier_groups DISABLE ROW LEVEL SECURITY;
    ALTER TABLE restaurant_hours DISABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
    ALTER TABLE menus DISABLE ROW LEVEL SECURITY;
    ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;

    DROP INDEX IF EXISTS idx_orders_user_created;
    CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders (customer_id, created_at DESC);
    ALTER TABLE orders RENAME COLUMN user_id TO customer_id;
    """)
