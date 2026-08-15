import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Camera, Search } from 'lucide-react';
import { PiPaperPlaneRightFill } from 'react-icons/pi';
import {
  CustomerBubble,
  RestaurantBubble,
  showBubbleTail,
} from '@/components/restaurant/ChatBubbles';
import {
  DEMO_INBOX_THREADS,
  type InboxMessage,
  type InboxThread,
} from '@/lib/restaurantInboxMock';

function Avatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full bg-[#d9d9d9]"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/** Build a tile: logo centered in a transparent cell (controls size vs spacing). */
function useChatLogoPattern(logoSrc: string, iconSize: number, cellSize: number) {
  const [patternUrl, setPatternUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPatternUrl(null);

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = cellSize;
      canvas.height = cellSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const origin = (cellSize - iconSize) / 2;
      ctx.clearRect(0, 0, cellSize, cellSize);
      ctx.drawImage(img, origin, origin, iconSize, iconSize);
      setPatternUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      if (!cancelled) setPatternUrl(null);
    };
    img.src = logoSrc;
    return () => {
      cancelled = true;
    };
  }, [logoSrc, iconSize, cellSize]);

  return patternUrl;
}

export default function RestaurantInbox() {
  const logoSrc = `${import.meta.env.BASE_URL}logo/Fast bite transparent I.png`;
  const patternIconSize = 32;
  const patternCellSize = 80;
  const chatPatternUrl = useChatLogoPattern(logoSrc, patternIconSize, patternCellSize);
  const [threads, setThreads] = useState<InboxThread[]>(DEMO_INBOX_THREADS);
  const [activeId, setActiveId] = useState<string>(DEMO_INBOX_THREADS[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (thread) =>
        thread.name.toLowerCase().includes(q) ||
        thread.preview.toLowerCase().includes(q),
    );
  }, [threads, query]);

  const active = threads.find((thread) => thread.id === activeId) ?? filtered[0] ?? null;

  const openThread = (id: string) => {
    setActiveId(id);
    setThreads((current) =>
      current.map((thread) =>
        thread.id === id ? { ...thread, unreadCount: 0 } : thread,
      ),
    );
    setMobileShowChat(true);
  };

  const sendMessage = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    const message: InboxMessage = {
      id: `local-${Date.now()}`,
      from: 'vendor',
      text,
    };
    setThreads((current) =>
      current.map((thread) =>
        thread.id === active.id
          ? {
              ...thread,
              preview: text,
              messages: [...thread.messages, message],
            }
          : thread,
      ),
    );
    setDraft('');
  };

  return (
    <div className="mb-10 flex h-[calc(100vh-8rem)] min-h-[420px] overflow-hidden rounded-[10px] bg-white shadow-[0px_0px_5px_rgba(0,0,0,0.1)]">
      <aside
        className={[
          'flex shrink-0 flex-col bg-[#fdfdfd]',
          mobileShowChat ? 'hidden sm:flex' : 'flex',
          'w-full sm:w-[223px]',
        ].join(' ')}
      >
        <div className="bg-white px-3.5 pb-3 pt-3.5 shadow-[0px_4px_10px_-4px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-bold text-black">Inbox</h2>
          <label className="relative mt-3 block">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6a6a]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-[35px] w-full rounded-full bg-[#ebebeb] py-2 pl-9 pr-3 text-[13px] text-[#111111] outline-none placeholder:text-[#6a6a6a]"
            />
          </label>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto border-r border-black/10 px-1.5 py-2">
          {filtered.map((thread) => {
            const selected = thread.id === active?.id;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => openThread(thread.id)}
                  className={[
                    'flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2.5 text-left transition',
                    selected ? 'bg-[#ebebebb2]' : 'hover:bg-[#ebebeb]/60',
                  ].join(' ')}
                >
                  <Avatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="truncate text-[13px] font-bold text-black">{thread.name}</p>
                      {thread.unreadCount > 0 ? (
                        <span className="inline-flex size-[15px] shrink-0 items-center justify-center rounded-full bg-[#e5460a] text-[7px] font-bold text-white">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-[11px] text-[#6a6a6a]">{thread.preview}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        className={[
          'min-w-0 flex-1 flex-col bg-[#f6f6f6]',
          mobileShowChat ? 'flex' : 'hidden sm:flex',
        ].join(' ')}
      >
        {active ? (
          <>
            <header className="flex h-[55px] shrink-0 items-center gap-2 bg-white px-3 shadow-[0px_4px_10px_-4px_rgba(0,0,0,0.05)] sm:px-4">
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="flex size-8 items-center justify-center rounded-full text-[#111111] transition hover:bg-black/5 sm:hidden"
                aria-label="Back to inbox"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar size={25} />
              <p className="text-base font-bold text-black">{active.name}</p>
            </header>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div className="absolute inset-0 bg-[#f6f6f6]" aria-hidden />
              <div
                key={chatPatternUrl ?? 'logo-fallback'}
                className="pointer-events-none absolute opacity-[0.16]"
                style={{
                  width: '800%',
                  height: '800%',
                  top: '-350%',
                  left: '-350%',
                  transform: 'rotate(-35deg)',
                  backgroundImage: chatPatternUrl
                    ? `url("${chatPatternUrl}")`
                    : `url("${logoSrc}"), url("${logoSrc}")`,
                  backgroundSize: chatPatternUrl
                    ? `${patternCellSize}px`
                    : `${patternIconSize}px`,
                  backgroundRepeat: chatPatternUrl ? 'repeat' : 'space',
                }}
                aria-hidden
              />
              <div className="relative z-[1] h-full overflow-y-auto px-3 py-4 sm:px-5">
                <div className="mb-2 flex justify-center py-2">
                  <span className="rounded-lg bg-[#e3e3e3]/90 px-2 py-2 text-sm text-[#111111] shadow-[0px_1px_3px_rgba(0,0,0,0.15)]">
                    Today
                  </span>
                </div>
                <div className="flex min-w-0 flex-col">
                  {active.messages.map((message, index) => {
                    const prev = index > 0 ? active.messages[index - 1] : undefined;
                    const tail = showBubbleTail(prev?.from, message.from);
                    const senderChanged = prev != null && prev.from !== message.from;
                    const stackGap = index === 0 ? '' : senderChanged ? 'mt-5' : 'mt-2';
                    const isVendor = message.from === 'vendor';
                    return (
                      <div
                        key={message.id}
                        className={`flex w-full min-w-0 ${isVendor ? 'justify-start' : 'justify-end'} ${stackGap}`}
                      >
                        {isVendor ? (
                          <RestaurantBubble text={message.text} tail={tail} />
                        ) : (
                          <CustomerBubble text={message.text} tail={tail} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <form
              onSubmit={sendMessage}
              className="flex shrink-0 items-center gap-3 bg-transparent px-3 py-3 sm:px-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Message"
                  className="min-w-0 flex-1 bg-transparent text-base text-[#111111] outline-none placeholder:text-[#c0c0c0]"
                />
                <button
                  type="button"
                  className="shrink-0 text-[#6a6a6a] transition hover:text-[#111111]"
                  aria-label="Camera"
                >
                  <Camera className="h-7 w-7" strokeWidth={2} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                aria-label="Send message"
              >
                <PiPaperPlaneRightFill className="h-7 w-7" aria-hidden />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[#6a6a6a]">
            Select a conversation
          </div>
        )}
      </section>
    </div>
  );
}
