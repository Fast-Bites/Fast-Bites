/** Same output as Home meals — single value, e.g. `25 mins` or `1 hr 15 mins` */
export function formatDeliveryTime(minutes?: number): string {
  if (minutes == null || minutes <= 0) return '—';
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
  }
  return `${minutes} mins`;
}
