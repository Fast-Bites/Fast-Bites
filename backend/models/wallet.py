from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    balance = Column(Numeric(12, 2), nullable=False, server_default=text("0"))
    currency = Column(String(3), nullable=False, server_default=text("'NGN'"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(32), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(32), nullable=False)
    title = Column(String(255), nullable=True)
    reference = Column(String(255), nullable=True)
    deposit_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
