from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class PlatformCategory(Base):
    """Official browse categories per business type (Restaurant, Shop, Pharmacy, Market)."""

    __tablename__ = "platform_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_type = Column(String(50), nullable=False)
    slug = Column(String(64), nullable=False)
    name = Column(String(120), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
