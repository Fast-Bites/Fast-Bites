import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MdPhone } from 'react-icons/md';
import SupportMessageBar from '../components/SupportMessageBar';
import { pickRandomSupportReply } from '../constants/supportAutoReplies';
import { SUPPORT_AVATAR_SRC } from '../constants/supportUi';
import { responsivePx } from '../constants/responsive';

const USER_BUBBLE = '#262626';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: Date;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function newMsgId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function showBubbleTail(prev: ChatMessage | undefined, msg: ChatMessage): boolean {
  if (!prev) return true;
  if (prev.isUser !== msg.isUser) return true;
  if (!sameCalendarDay(prev.createdAt, msg.createdAt)) return true;
  return false;
}

/**
 * Top-corner nib: flat horizontal along the top, sharp apex at the outer top corner,
 * outer edge is a gentle quadratic into the bubble side (no sharp corner at the join).
 * `TAIL_OVERLAP` pulls the nib onto the bubble fill to avoid a seam.
 */
const TAIL_W = 13;
const TAIL_H = 26;
const TAIL_OVERLAP = 3;

/** How far the hypotenuse eases off straight (0–1). Keep small — large values read as a kink. */
const TAIL_CURVE_BEND = 0.045;

/**
 * User tail: (0,0)–(w,0) flat top, Q from tip (w,0) to inner foot (0,h), vertical (0,h)–(0,0).
 * Control must stay inside the triangle; the old (0.26w, 0.78h) sat above the hypotenuse and
 * read as almost straight / wrong in some engines.
 */
function userTailClipPath(w: number, h: number): string {
  const midX = w * 0.5;
  const midY = h * 0.5;
  const gx = w / 3;
  const gy = h / 3;
  const k = TAIL_CURVE_BEND;
  const cx = midX * (1 - k) + gx * k;
  const cy = midY * (1 - k) + gy * k;
  return `path('M 0 0 L ${w} 0 Q ${cx} ${cy} 0 ${h} L 0 0 Z')`;
}

/** Support tail: mirror triangle; Q from (w,h) back to tip (0,0). */
function supportTailClipPath(w: number, h: number): string {
  const midX = w * 0.5;
  const midY = h * 0.5;
  const gx = (2 * w) / 3;
  const gy = h / 3;
  const k = TAIL_CURVE_BEND;
  const cx = midX * (1 - k) + gx * k;
  const cy = midY * (1 - k) + gy * k;
  return `path('M 0 0 L ${w} 0 L ${w} ${h} Q ${cx} ${cy} 0 0 Z')`;
}

const TAIL_RESERVE_PX = TAIL_W + TAIL_OVERLAP + 2;
/** Reserve horizontal room so nib + bubble stay inside the thread column. */
const BUBBLE_MAX_STYLE = `min(85%, min(20rem, calc(100% - ${TAIL_RESERVE_PX}px)))`;

function UserBubble({ text, tail }: { text: string; tail: boolean }) {
  return (
    <div className="relative w-fit min-w-0" style={{ maxWidth: BUBBLE_MAX_STYLE }}>
      <div
        className={`relative inline-block max-w-full overflow-visible break-words whitespace-pre-wrap px-3 py-2 text-left text-sm leading-snug text-white ${
          tail ? 'rounded-lg rounded-tr-none' : 'rounded-lg'
        }`}
        style={{ backgroundColor: USER_BUBBLE }}
      >
        {tail ? (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 z-[2]"
            style={{
              width: TAIL_W,
              height: TAIL_H,
              left: '100%',
              marginLeft: -TAIL_OVERLAP,
              backgroundColor: USER_BUBBLE,
              clipPath: userTailClipPath(TAIL_W, TAIL_H)
            }}
          />
        ) : null}
        <div className="relative z-[3] min-w-0">{text}</div>
      </div>
    </div>
  );
}

function SupportBubble({ text, tail }: { text: string; tail: boolean }) {
  return (
    <div className="relative w-fit min-w-0" style={{ maxWidth: BUBBLE_MAX_STYLE }}>
      <div
        className={`relative inline-block max-w-full overflow-visible break-words whitespace-pre-wrap bg-primary px-3 py-2 text-left text-sm leading-snug text-primary-foreground ${
          tail ? 'rounded-lg rounded-tl-none' : 'rounded-lg'
        }`}
      >
        {tail ? (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 z-[2] bg-primary"
            style={{
              width: TAIL_W,
              height: TAIL_H,
              right: '100%',
              marginRight: -TAIL_OVERLAP,
              clipPath: supportTailClipPath(TAIL_W, TAIL_H)
            }}
          />
        ) : null}
        <div className="relative z-[3] min-w-0">{text}</div>
      </div>
    </div>
  );
}

const SupportChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dateLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const clearReplyTimer = useCallback(() => {
    if (replyTimeoutRef.current != null) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearReplyTimer(), [clearReplyTimer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: newMsgId(),
      text,
      isUser: true,
      createdAt: new Date()
    };

    setMessages((m) => [...m, userMsg]);
    setDraft('');

    clearReplyTimer();
    replyTimeoutRef.current = setTimeout(() => {
      replyTimeoutRef.current = null;
      setMessages((m) => [
        ...m,
        {
          id: newMsgId(),
          text: pickRandomSupportReply(),
          isUser: false,
          createdAt: new Date()
        }
      ]);
    }, 10_000);
  }, [draft, clearReplyTimer]);

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] min-h-0 flex-col overflow-x-hidden overflow-y-hidden bg-background font-[var(--font-poppins)] text-foreground">
      <div
        className="pointer-events-none absolute inset-0 max-w-[100vw] opacity-10"
        style={{
          backgroundImage: `url('${SUPPORT_AVATAR_SRC}')`,
          backgroundSize: '60px 60px',
          backgroundRepeat: 'repeat'
        }}
        aria-hidden
      />

      <header
        className={`relative z-20 flex shrink-0 items-center gap-3 border-b border-muted/10 bg-background ${responsivePx} pb-3 pt-[max(2.5rem,env(safe-area-inset-top))]`}
      >
        <button
          type="button"
          onClick={() => navigate('/support')}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-foreground hover:opacity-80"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted/50 ring-1 ring-muted/30">
          <img src={SUPPORT_AVATAR_SRC} alt="" className="h-full w-full object-cover" />
        </div>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">Fast Bites Support</h1>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 hover:bg-muted"
          aria-label="Call support"
        >
          <MdPhone className="h-5 w-5 text-primary" aria-hidden />
        </button>
      </header>

      <div
        className={`relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${responsivePx} pt-3`}
      >
        <div
          ref={scrollRef}
          className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain pb-44"
        >
          <div className="flex min-w-0 flex-col px-3 pt-1 sm:px-4">
            <div className="mb-2 flex w-full min-w-0 justify-center py-2">
              <div className="rounded-lg bg-muted/60 px-2 py-2">
                <span className="text-sm text-foreground">{dateLabel}</span>
              </div>
            </div>
            <span className="sr-only">Conversation {chatId ?? ''}</span>
            {messages.map((msg, i) => {
              const prev = i > 0 ? messages[i - 1] : undefined;
              const tail = showBubbleTail(prev, msg);
              const senderChanged = prev != null && prev.isUser !== msg.isUser;
              const stackGap =
                i === 0 ? '' : senderChanged ? 'mt-5' : 'mt-2';
              return (
                <div
                  key={msg.id}
                  className={`flex w-full min-w-0 ${msg.isUser ? 'justify-end' : 'justify-start'} ${stackGap}`}
                >
                  {msg.isUser ? (
                    <UserBubble text={msg.text} tail={tail} />
                  ) : (
                    <SupportBubble text={msg.text} tail={tail} />
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} className="h-1 w-full shrink-0" aria-hidden />
          </div>
        </div>
      </div>

      <SupportMessageBar
        draft={draft}
        onDraftChange={setDraft}
        position="flush"
        flushBottomInset
        onSend={handleSend}
      />
    </div>
  );
};

export default SupportChat;
