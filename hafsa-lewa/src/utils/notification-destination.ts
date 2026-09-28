import type { AppNotification } from '@/services/types';

const BOOKING_LIST = /^\/(?:\(tabs\)\/)?bookings\/?$/;
const BOOKING_DETAIL = /^\/(?:\(tabs\)\/)?bookings\/([^/?#]+)\/?$/;
const BOOKING_STATUS = /^\/booking\/status\/?$/;
const DONATION_HISTORY = /^\/donations\/history\/?$/;
const DONATION_RECORD = /^\/donations\/record\/([^/?#]+)\/?$/;

function readId(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = data?.[key];
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id.length > 0 ? id : null;
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export type NotificationDestination = string | { paymentId: string };

/**
 * Turns a notification into the route that should open.
 * A booking, donation, or payment id wins over a generic list path.
 * Wildlife, event, and other specific links stay as written.
 * A payment-only payload is returned for the tap handler to look up.
 */
export function resolveNotificationDestination(
  notification: Pick<AppNotification, 'deepLink' | 'data'>,
): NotificationDestination | null {
  const bookingFromData = readId(notification.data, 'bookingId') ?? readId(notification.data, 'booking_id');
  const donationFromData = readId(notification.data, 'donationId') ?? readId(notification.data, 'donation_id');
  const paymentId = readId(notification.data, 'paymentId') ?? readId(notification.data, 'payment_id');
  const deepLink = notification.deepLink?.trim() || null;

  if (!deepLink) {
    if (bookingFromData) return `/bookings/${bookingFromData}`;
    if (donationFromData) return `/donations/record/${donationFromData}`;
    if (paymentId) return { paymentId };
    return null;
  }

  const [pathPart, queryPart = ''] = deepLink.split('?');
  const path = pathPart.split('#')[0];
  const queryBookingId = new URLSearchParams(queryPart).get('bookingId')?.trim() || null;
  const bookingId = bookingFromData ?? (queryBookingId || null);

  const detail = path.match(BOOKING_DETAIL);
  if (detail) return `/bookings/${decodeSegment(detail[1])}`;

  const donationDetail = path.match(DONATION_RECORD);
  if (donationDetail) return `/donations/record/${decodeSegment(donationDetail[1])}`;

  const genericList = BOOKING_LIST.test(path) || BOOKING_STATUS.test(path) || DONATION_HISTORY.test(path);
  if (genericList) {
    if (bookingId) return `/bookings/${bookingId}`;
    if (donationFromData) return `/donations/record/${donationFromData}`;
    if (paymentId) return { paymentId };
    return deepLink;
  }

  return deepLink;
}
