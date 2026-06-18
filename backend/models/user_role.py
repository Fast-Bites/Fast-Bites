from sqlalchemy import Column, String, DateTime, Date, Text, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from database import Base


class UserRole(Base):
    """Per-role profile for a single auth account (same email, multiple roles)."""

    __tablename__ = "user_roles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(20), primary_key=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    dob = Column(Date)

    google_id = Column(String(255), unique=True, nullable=True)
    profile_image = Column(Text)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
