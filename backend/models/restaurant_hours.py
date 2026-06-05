from sqlalchemy import Column, Time, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class RestaurantHours(Base):
    __tablename__ = "restaurant_hours"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    open_time = Column(Time, nullable=True)
    close_time = Column(Time, nullable=True)
    is_closed = Column(Boolean, nullable=False, default=False)
