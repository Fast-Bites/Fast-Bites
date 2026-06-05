import api from './api';

export type PreviewKind = 'typing' | 'read' | 'sent' | 'unread';

export interface ChatPreview {
  id: string;
  kind: PreviewKind;
  time: string;
  timePrimary?: boolean;
  preview: string;
  unreadCount?: number;
}

export interface SupportMessageDto {
  id: string;
  body: string;
  sender_type: string;
  created_at: string;
}

export async function fetchSupportConversations(): Promise<{
  conversations: ChatPreview[];
  error?: string;
}> {
  const { data, error } = await api.getSupportConversations();
  if (error) return { conversations: [], error };
  const list =
    (data as { conversations?: Array<Record<string, unknown>> })?.conversations ?? [];
  const conversations: ChatPreview[] = list.map((c) => ({
    id: String(c.id),
    kind: c.kind as PreviewKind,
    time: String(c.time ?? ''),
    timePrimary: Boolean(c.time_primary),
    preview: String(c.preview ?? ''),
    unreadCount: c.unread_count != null ? Number(c.unread_count) : undefined,
  }));
  return { conversations };
}

export async function fetchSupportMessages(conversationId: string): Promise<{
  messages: SupportMessageDto[];
  error?: string;
}> {
  const { data, error } = await api.getSupportMessages(conversationId);
  if (error) return { messages: [], error };
  const messages =
    (data as { messages?: SupportMessageDto[] })?.messages ?? [];
  return { messages };
}

export async function sendSupportMessage(
  conversationId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.sendSupportMessage(conversationId, { body });
  if (error) return { ok: false, error };
  return { ok: true };
}
