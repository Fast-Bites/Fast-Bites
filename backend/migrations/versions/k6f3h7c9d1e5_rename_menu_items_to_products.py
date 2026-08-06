"""rename menu_items to products and menu_item_id to product_id

Revision ID: k6f3h7c9d1e5
Revises: j5e2g6b8c0d4
Create Date: 2026-08-04
"""

from typing import Sequence, Union

from alembic import op

revision: str = "k6f3h7c9d1e5"
down_revision: Union[str, None] = "j5e2g6b8c0d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        -- Core catalog table
        ALTER TABLE IF EXISTS menu_items RENAME TO products;

        ALTER INDEX IF EXISTS idx_menu_items_platform_category_id
            RENAME TO idx_products_platform_category_id;

        -- Foreign key columns
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'cart_items' AND column_name = 'menu_item_id'
          ) THEN
            ALTER TABLE cart_items RENAME COLUMN menu_item_id TO product_id;
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'order_items' AND column_name = 'menu_item_id'
          ) THEN
            ALTER TABLE order_items RENAME COLUMN menu_item_id TO product_id;
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'menu_modifier_groups' AND column_name = 'menu_item_id'
          ) THEN
            ALTER TABLE menu_modifier_groups RENAME COLUMN menu_item_id TO product_id;
          END IF;
        END $$;

        -- RLS policy rename (if present)
        DROP POLICY IF EXISTS menu_items_read ON products;
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_read'
          ) THEN
            CREATE POLICY products_read ON products FOR SELECT TO authenticated USING (true);
          END IF;
        EXCEPTION
          WHEN undefined_object THEN NULL;
          WHEN insufficient_privilege THEN NULL;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP POLICY IF EXISTS products_read ON products;

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'menu_modifier_groups' AND column_name = 'product_id'
          ) THEN
            ALTER TABLE menu_modifier_groups RENAME COLUMN product_id TO menu_item_id;
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'order_items' AND column_name = 'product_id'
          ) THEN
            ALTER TABLE order_items RENAME COLUMN product_id TO menu_item_id;
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'cart_items' AND column_name = 'product_id'
          ) THEN
            ALTER TABLE cart_items RENAME COLUMN product_id TO menu_item_id;
          END IF;
        END $$;

        ALTER INDEX IF EXISTS idx_products_platform_category_id
            RENAME TO idx_menu_items_platform_category_id;

        ALTER TABLE IF EXISTS products RENAME TO menu_items;

        DO $$
        BEGIN
          CREATE POLICY menu_items_read ON menu_items FOR SELECT TO authenticated USING (true);
        EXCEPTION
          WHEN duplicate_object THEN NULL;
          WHEN undefined_object THEN NULL;
          WHEN insufficient_privilege THEN NULL;
        END $$;
        """
    )
