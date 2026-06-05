from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import uuid


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=True)
    status = Column(String(64), nullable=True)
    delivery_address = Column(Text, nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=True)
    subtotal = Column(Numeric(12, 2), nullable=True)
    delivery_fee = Column(Numeric(10, 2), nullable=True)
    estimated_delivery_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=True)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=True)
    price_at_order = Column(Numeric(10, 2), nullable=True)
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    unit_price = Column(Numeric(10, 2), nullable=True)
    options_json = Column(JSONB, nullable=False, server_default="{}")
    created_at = Column(DateTime(timezone=True), nullable=True)


class OrderTrackingStep(Base):
    __tablename__ = "order_tracking_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False)
    label = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    show_view_action = Column(Boolean, nullable=False, default=False)
