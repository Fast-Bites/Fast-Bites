from sqlalchemy import Column, String, DateTime, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    # ID comes from Supabase auth.users
    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    dob = Column(Date)  # Date only, no time
    
    # OAuth
    google_id = Column(String(255), unique=True, nullable=True)  # For Google OAuth
    
    # Profile fields
    role = Column(String(20), default="customer")  # customer, rider, restaurant
    profile_image = Column(Text)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
