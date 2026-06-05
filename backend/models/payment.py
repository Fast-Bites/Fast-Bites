from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean, text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class PaymentCard(Base):
    __tablename__ = "payment_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cardholder_name = Column(String(255), nullable=False)
    last_four = Column(String(4), nullable=False)
    brand = Column(String(32), nullable=True)
    exp_month = Column(Numeric(2, 0), nullable=False)
    exp_year = Column(Numeric(4, 0), nullable=False)
    provider_token = Column(String(255), nullable=True)
    save_details = Column(Boolean, nullable=False, server_default=text("true"))
    is_default = Column(Boolean, nullable=False, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class DepositAccount(Base):
    __tablename__ = "deposit_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    owner_name = Column(String(255), nullable=False)
    wallet_id = Column(String(64), nullable=False)
    gateway = Column(String(64), nullable=False)
    account_number = Column(String(32), nullable=False)
    bank_name = Column(String(128), nullable=True)
    recipient_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, server_default=text("true"))


class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    method = Column(String(32), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(32), nullable=False, server_default=text("'pending'"))
    payment_card_id = Column(UUID(as_uuid=True), ForeignKey("payment_cards.id", ondelete="SET NULL"), nullable=True)
    external_reference = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
