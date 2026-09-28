import type { AppNotification } from '@/services/types';

const BOOKING_LIST = /^\/(?:\(tabs\)\/)?bookings\/?$/;
const BOOKING_DETAIL = /^\/(?:\(tabs\)\/)?bookings\/([^/?#]+)\/?$/;

function readBookingId(data: Record<string, unknown> | null | undefined): string | null {
  const value = data?.bookingId;
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id.length > 0 ? id : null;
}

/**
 * Turns a notification into the route that should open.
 * A booking deep link, including a `/(tabs)` prefix, opens that booking.
 * A link that only points at the bookings list uses `data.bookingId` when present.
 */
export function resolveNotificationDestination(
  notification: Pick<AppNotification, 'deepLink' | 'data'>,
): string | null {
  const bookingId = readBookingId(notification.data);
  const deepLink = notification.deepLink?.trim() || null;

  if (!deepLink) {
    return bookingId ? `/bookings/${bookingId}` : null;
  }

  const path = deepLink.split(/[?#]/)[0];
  const detail = path.match(BOOKING_DETAIL);
  if (detail) return `/bookings/${decodeURIComponent(detail[1])}`;
  if (BOOKING_LIST.test(path)) {
    return bookingId ? `/bookings/${bookingId}` : deepLink;
  }
  return deepLink;
}
