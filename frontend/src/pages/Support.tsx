import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck, MoreVertical, Search } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import SupportMessageBar from '../components/SupportMessageBar';
import { SUPPORT_AVATAR_SRC } from '../constants/supportUi';
import { responsivePx } from '../constants/responsive';

type PreviewKind = 'typing' | 'read' | 'sent' | 'unread';

interface ChatPreview {
  id: string;
  kind: PreviewKind;
  time: string;
  /** When set, time label uses primary (e.g. “Yesterday”). */
  timePrimary?: boolean;
  preview: string;
  unreadCount?: number;
}

const MOCK_CHATS: ChatPreview[] = [
  {
    id: '1',
    kind: 'typing',
    time: '12:15',
    preview: 'Typing…'
  },
  {
    id: '2',
    kind: 'read',
    time: '12:15',
    preview: 'Hello, Good evening'
  },
  {
    id: '3',
    kind: 'sent',
    time: '12:15',
    preview: 'Hello, Good evening'
  },
  {
    id: '4',
    kind: 'unread',
    time: 'Yesterday',
    timePrimary: true,
    preview: 'Hello, Good evening',
    unreadCount: 1
  }
];

function PreviewLine({ row }: { row: ChatPreview }) {
  if (row.kind === 'typing') {
    return (
      <div className="flex w-full min-w-0 flex-col gap-0.5 text-left">
        <span className="text-xs font-normal text-primary">Typing…</span>
      </div>
    );
  }

  if (row.kind === 'read') {
    return (
      <div className="flex w-full min-w-0 items-center gap-1.5">
        <CheckCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
        <p className="min-w-0 flex-1 truncate text-xs font-normal text-foreground">{row.preview}</p>
      </div>
    );
  }

  if (row.kind === 'sent') {
    return (
      <div className="flex w-full min-w-0 items-center gap-1.5">
        <Check className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-muted-foreground/70">{row.preview}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 items-center gap-1">
      <p className="min-w-0 flex-1 truncate text-xs font-bold text-foreground">{row.preview}</p>
    </div>
  );
}

const Support = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');

  const filtered = MOCK_CHATS.filter((c) =>
    query.trim() ? c.preview.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col bg-background pb-28 font-[var(--font-poppins)] text-foreground`}
    >
      <div className={`shrink-0 ${responsivePx} pt-10`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted/30"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-muted/40 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${responsivePx} pb-36 pt-2`}>
        <div className="divide-y divide-muted/10">
          {filtered.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => navigate(`/support/chat/${row.id}`)}
              className="flex w-full gap-3 py-3 text-left transition-opacity hover:opacity-90 active:opacity-80"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted/50">
                <img src={SUPPORT_AVATAR_SRC} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                {/* Title + time: flex so different font sizes share one vertical center line. */}
                {/* Row 2: grid keeps preview and badge on the same right column as each other. */}
                <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-0.5">
                  <div className="col-span-2 flex min-w-0 items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-lg font-bold text-foreground">
                      Fast Bites support
                    </span>
                    <span
                      className={`shrink-0 text-right text-xs leading-none ${
                        row.timePrimary ? 'font-normal text-primary' : 'font-normal text-muted-foreground'
                      }`}
                    >
                      {row.time}
                    </span>
                  </div>
                  <div className="col-start-1 min-w-0 self-center">
                    <PreviewLine row={row} />
                  </div>
                  <div className="col-start-2 flex shrink-0 items-center justify-end self-center">
                    {row.unreadCount != null && row.unreadCount > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold leading-none text-primary-foreground tabular-nums">
                        {row.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <SupportMessageBar draft={draft} onDraftChange={setDraft} position="aboveNav" />

      <BottomNav />
    </div>
  );
};

export default Support;
