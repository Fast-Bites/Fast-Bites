import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.support import SupportConversation, SupportMessage
from schemas.support_api import (
    SupportConversationsListResponse,
    SupportConversationResponse,
    SupportMessagesListResponse,
    SupportMessageResponse,
    SupportMessageCreate,
)
from services.jwt_auth import get_current_user

log = logging.getLogger(__name__)
router = APIRouter(prefix="/support", tags=["support"])

def format_chat_time(dt: datetime | None) -> tuple[str, bool]:
    if not dt:
        return "", False
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now.date() - dt.date()
    if diff.days == 1:
        return "Yesterday", True
    if diff.days == 0:
        return dt.strftime("%H:%M"), False
    return dt.strftime("%b %d"), False


def preview_kind(last_sender: str | None, unread: int, typing: bool) -> str:
    if typing:
        return "typing"
    if unread > 0:
        return "unread"
    if last_sender == "user":
        return "sent"
    if last_sender == "support":
        return "read"
    return "sent"


async def ensure_conversation(user_id: UUID, db: AsyncSession) -> SupportConversation:
    result = await db.execute(
        select(SupportConversation)
        .where(SupportConversation.user_id == user_id)
        .order_by(SupportConversation.last_message_at.desc().nulls_last())
        .limit(1)
    )
    conv = result.scalar_one_or_none()
    if conv:
        return conv
    now = datetime.now(timezone.utc)
    conv = SupportConversation(
        user_id=user_id,
        last_message_preview=None,
        last_message_at=None,
        unread_count=0,
        is_typing=False,
        created_at=now,
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


@router.get("/conversations", response_model=SupportConversationsListResponse)
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        conv = await ensure_conversation(user_id, db)
        last_msg = await db.execute(
            select(SupportMessage)
            .where(SupportMessage.conversation_id == conv.id)
            .order_by(SupportMessage.created_at.desc())
            .limit(1)
        )
        last = last_msg.scalar_one_or_none()
        time_str, time_primary = format_chat_time(conv.last_message_at)
        kind = preview_kind(
            last.sender_type if last else None,
            conv.unread_count,
            conv.is_typing,
        )
        preview = conv.last_message_preview or "Tap to start chatting"
        if conv.is_typing:
            preview = "Typing…"
        rows = [
            SupportConversationResponse(
                id=str(conv.id),
                kind=kind,
                time=time_str,
                time_primary=time_primary,
                preview=preview,
                unread_count=conv.unread_count if conv.unread_count > 0 else None,
            )
        ]
        return SupportConversationsListResponse(conversations=rows)
    except Exception as e:
        log.error("List support conversations failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load conversations")


@router.get("/conversations/{conversation_id}/messages", response_model=SupportMessagesListResponse)
async def list_messages(
    conversation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        conv = await db.get(SupportConversation, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        result = await db.execute(
            select(SupportMessage)
            .where(SupportMessage.conversation_id == conversation_id)
            .order_by(SupportMessage.created_at)
        )
        messages = [
            SupportMessageResponse(
                id=str(m.id),
                body=m.body,
                sender_type=m.sender_type,
                created_at=m.created_at,
            )
            for m in result.scalars().all()
        ]
        conv.unread_count = 0
        await db.commit()
        return SupportMessagesListResponse(messages=messages)
    except HTTPException:
        raise
    except Exception as e:
        log.error("List support messages failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load messages")


@router.post("/conversations/{conversation_id}/messages", response_model=SupportMessageResponse)
async def send_message(
    conversation_id: UUID,
    body: SupportMessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        text = body.body.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        conv = await db.get(SupportConversation, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        now = datetime.now(timezone.utc)
        user_msg = SupportMessage(
            conversation_id=conversation_id,
            sender_type="user",
            body=text,
            created_at=now,
        )
        db.add(user_msg)
        conv.last_message_preview = text[:120]
        conv.last_message_at = now
        conv.is_typing = False
        conv.unread_count = 0

        await db.commit()
        await db.refresh(user_msg)
        return SupportMessageResponse(
            id=str(user_msg.id),
            body=user_msg.body,
            sender_type=user_msg.sender_type,
            created_at=user_msg.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("Send support message failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to send message")
