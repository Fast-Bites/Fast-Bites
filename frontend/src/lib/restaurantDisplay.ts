import type { Restaurant } from './api';

/** Pool when API omits rating — mix of whole and half steps (e.g. 3.5, 4) */
export const RATING_POOL = [3, 3.5, 4, 4.5, 5] as const;

export function poolIndexFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i)) % RATING_POOL.length;
  }
  return h % RATING_POOL.length;
}

export function resolveRating(r: Restaurant): number {
  if (r.rating != null && r.rating > 0) return r.rating;
  return RATING_POOL[poolIndexFromId(String(r.id))];
}

export function formatRatingDisplay(r: number): string {
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Stable mix of open / closed per id (~half each) — same source as Restaurants list */
export function isOpenForDisplay(id: string): boolean {
  return poolIndexFromId(id) % 2 === 0;
}

const CLOSING_TIMES = ['9:00 PM', '10:00 PM', '10:30 PM', '11:00 PM'] as const;

export function closingTimeForDisplay(id: string): string {
  return CLOSING_TIMES[poolIndexFromId(id) % CLOSING_TIMES.length];
}
