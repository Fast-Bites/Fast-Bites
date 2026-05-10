import type { FC } from 'react';
import { Camera } from 'lucide-react';
import { PiPaperPlaneRightFill } from 'react-icons/pi';
import { responsivePx } from '../constants/responsive';

export type SupportMessageBarPosition = 'aboveNav' | 'flush';

interface SupportMessageBarProps {
  draft: string;
  onDraftChange: (value: string) => void;
  position: SupportMessageBarPosition;
  /**
   * When `position="flush"`, lifts the bar slightly from the screen bottom (Support chat only).
   */
  flushBottomInset?: boolean;
  /** Support chat: send current draft (parent clears draft). */
  onSend?: () => void;
}

/**
 * Message field + camera + send — shared between Support list and Support chat thread.
 */
const SupportMessageBar: FC<SupportMessageBarProps> = ({
  draft,
  onDraftChange,
  position,
  flushBottomInset = false,
  onSend
}) => {
  /** Chat: pin to viewport bottom so background covers edge-to-edge; spacing is padding, not `bottom-*` gap. */
  const bottomClass =
    position === 'aboveNav'
      ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]'
      : 'bottom-0';

  const bottomPaddingClass =
    position === 'flush' && flushBottomInset
      ? 'pb-[calc(0.75rem+max(1rem,env(safe-area-inset-bottom,0px)))]'
      : 'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]';

  return (
    <div
      className={`fixed left-0 right-0 z-40 border-t border-muted/20 bg-background ${bottomClass} ${responsivePx} ${bottomPaddingClass} pt-3`}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-muted/40 px-4 py-2 caret-primary">
          <input
            type="text"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend?.();
              }
            }}
            placeholder="Message"
            className="min-w-0 flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground/80 caret-primary"
          />
          <button
            type="button"
            className="shrink-0 text-muted-foreground/80 hover:text-foreground/80"
            aria-label="Camera"
          >
            <Camera className="h-7 w-7" strokeWidth={2} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSend?.()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 active:opacity-80"
          aria-label="Send"
        >
          <PiPaperPlaneRightFill className="h-7 w-7" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default SupportMessageBar;
