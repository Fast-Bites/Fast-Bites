/** Relative label for transaction list (matches prior "5 mins. ago" style). */
export function formatTimeAgo(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';

  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'Just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'}. ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'}. ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'}. ago`;
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
