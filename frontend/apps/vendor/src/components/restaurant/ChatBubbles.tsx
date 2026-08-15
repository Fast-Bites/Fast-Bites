/**
 * Vendor inbox bubbles:
 * customer = right, dark; restaurant = left, primary.
 * Shape/tails match customer SupportChat nibs.
 */

const CUSTOMER_BUBBLE = '#272727';

const TAIL_W = 13;
const TAIL_H = 26;
const TAIL_OVERLAP = 3;
const TAIL_CURVE_BEND = 0.045;

const TAIL_RESERVE_PX = TAIL_W + TAIL_OVERLAP + 2;
const BUBBLE_MAX_STYLE = `min(85%, min(20rem, calc(100% - ${TAIL_RESERVE_PX}px)))`;

/** Right-side (customer) tail. */
function customerTailClipPath(w: number, h: number): string {
  const midX = w * 0.5;
  const midY = h * 0.5;
  const gx = w / 3;
  const gy = h / 3;
  const k = TAIL_CURVE_BEND;
  const cx = midX * (1 - k) + gx * k;
  const cy = midY * (1 - k) + gy * k;
  return `path('M 0 0 L ${w} 0 Q ${cx} ${cy} 0 ${h} L 0 0 Z')`;
}

/** Left-side (restaurant) tail. */
function restaurantTailClipPath(w: number, h: number): string {
  const midX = w * 0.5;
  const midY = h * 0.5;
  const gx = (2 * w) / 3;
  const gy = h / 3;
  const k = TAIL_CURVE_BEND;
  const cx = midX * (1 - k) + gx * k;
  const cy = midY * (1 - k) + gy * k;
  return `path('M 0 0 L ${w} 0 L ${w} ${h} Q ${cx} ${cy} 0 0 Z')`;
}

export function showBubbleTail(
  prevFrom: 'customer' | 'vendor' | undefined,
  from: 'customer' | 'vendor',
): boolean {
  if (prevFrom == null) return true;
  return prevFrom !== from;
}

/** Restaurant — left, primary, left nib. */
export function RestaurantBubble({ text, tail }: { text: string; tail: boolean }) {
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
              clipPath: restaurantTailClipPath(TAIL_W, TAIL_H),
            }}
          />
        ) : null}
        <div className="relative z-[3] min-w-0">{text}</div>
      </div>
    </div>
  );
}

/** Customer — right, dark, right nib. */
export function CustomerBubble({ text, tail }: { text: string; tail: boolean }) {
  return (
    <div className="relative w-fit min-w-0" style={{ maxWidth: BUBBLE_MAX_STYLE }}>
      <div
        className={`relative inline-block max-w-full overflow-visible break-words whitespace-pre-wrap px-3 py-2 text-left text-sm leading-snug text-white ${
          tail ? 'rounded-lg rounded-tr-none' : 'rounded-lg'
        }`}
        style={{ backgroundColor: CUSTOMER_BUBBLE }}
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
              backgroundColor: CUSTOMER_BUBBLE,
              clipPath: customerTailClipPath(TAIL_W, TAIL_H),
            }}
          />
        ) : null}
        <div className="relative z-[3] min-w-0">{text}</div>
      </div>
    </div>
  );
}
