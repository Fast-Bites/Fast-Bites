from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class SupportConversation(Base):
    __tablename__ = "support_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    last_message_preview = Column(Text, nullable=True)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    unread_count = Column(Integer, nullable=False, default=0)
    is_typing = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False)


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("support_conversations.id", ondelete="CASCADE"), nullable=False)
    sender_type = Column(String(16), nullable=False)
    body = Column(Text, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)


class SupportReplyTemplate(Base):
    __tablename__ = "support_reply_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    body = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
