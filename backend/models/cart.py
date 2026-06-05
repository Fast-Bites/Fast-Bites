from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import uuid


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    image_url = Column(Text, nullable=True)
    section = Column(String(16), nullable=True)
    options_json = Column(JSONB, nullable=False, server_default="{}")
    special_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)
