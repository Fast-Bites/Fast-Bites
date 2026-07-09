from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
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

    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    owner_name = Column(Text, nullable=True)
    business_type = Column(String(50), nullable=True)
    logo_url = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    contact_person = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    landmark = Column(Text, nullable=True)
    bank_name = Column(String(200), nullable=True)
    account_number = Column(String(50), nullable=True)
    account_holder_name = Column(String(200), nullable=True)
    business_verified = Column(Boolean, default=False, nullable=False)
    verification_submitted_at = Column(DateTime(timezone=True), nullable=True)
    verification_documents = Column(JSONB, nullable=True)
