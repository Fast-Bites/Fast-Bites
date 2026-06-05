from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class SupportConversationResponse(BaseModel):
    id: str
    kind: str
    time: str
    time_primary: bool = False
    preview: str
    unread_count: Optional[int] = None


class SupportConversationsListResponse(BaseModel):
    conversations: List[SupportConversationResponse]


class SupportMessageResponse(BaseModel):
    id: str
    body: str
    sender_type: str
    created_at: datetime


class SupportMessagesListResponse(BaseModel):
    messages: List[SupportMessageResponse]


class SupportMessageCreate(BaseModel):
    body: str
