import type { Restaurant } from './api';

/** Open now — from API (restaurant_hours). Falls back to is_open column only if hours unknown. */
export function restaurantIsOpen(r: Restaurant): boolean {
  if (r.is_open_now != null) return r.is_open_now;
  if (r.is_open != null) return r.is_open;
  return false;
}

/** Subtitle under Open/Closed — e.g. "Closes at 10:00 PM" */
export function restaurantHoursStatus(r: Restaurant): string {
  if (r.hours_status?.trim()) return r.hours_status;
  return restaurantIsOpen(r) ? 'Open' : 'Closed';
}

/** Multiline text for the hours popup */
export function restaurantOperatingHoursText(r: Restaurant): string {
  if (r.operating_hours_text?.trim()) return r.operating_hours_text;
  return 'No hours configured for this restaurant yet.';
}
