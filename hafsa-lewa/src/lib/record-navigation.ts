import { router, type Href } from 'expo-router';

/** `useLocalSearchParams` may return one value or an array. Keep a single string. */
export function searchParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function bookingRecordHref(id: string): Href {
  return { pathname: '/bookings/[id]', params: { id } };
}

export function donationRecordHref(id: string): Href {
  return { pathname: '/donations/record/[id]', params: { id } };
}

export function openBookingRecord(id: string, method: 'push' | 'replace' = 'push') {
  const href = bookingRecordHref(id);
  if (method === 'replace') router.replace(href);
  else router.push(href);
}

export function openDonationRecord(id: string, method: 'push' | 'replace' = 'push') {
  const href = donationRecordHref(id);
  if (method === 'replace') router.replace(href);
  else router.push(href);
}

const BOOKING_PATH = /^\/bookings\/([^/?#]+)\/?$/;
const DONATION_PATH = /^\/donations\/record\/([^/?#]+)\/?$/;

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Record paths use a typed href. Other in-app paths stay as strings. */
export function hrefForNotificationPath(path: string): Href {
  const booking = path.match(BOOKING_PATH);
  if (booking) return bookingRecordHref(decodeSegment(booking[1]));
  const donation = path.match(DONATION_PATH);
  if (donation) return donationRecordHref(decodeSegment(donation[1]));
  return path as Href;
}
