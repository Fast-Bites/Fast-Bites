from sqlalchemy import Column, String, Text, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)
    is_open = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)

