from sqlalchemy import Column, Text, Float, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class Product(Base):
    """
    Catalog product row (shared by all vendor types).
    """

    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    menu_id = Column(UUID(as_uuid=True), nullable=True)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    delivery_time = Column(Integer, nullable=True)  # minutes
    vendor_category = Column(Text, nullable=True)
    platform_category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("platform_categories.id", ondelete="SET NULL"),
        nullable=True,
    )


# Back-compat alias while routers migrate
MenuItem = Product
