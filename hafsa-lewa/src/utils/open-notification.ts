import { router } from 'expo-router';

import {
  bookingRecordHref,
  donationRecordHref,
  hrefForNotificationPath,
} from '@/lib/record-navigation';
import { getPaymentParent } from '@/services/payments';
import { resolveNotificationDestination } from '@/utils/notification-destination';

type NotificationInput = {
  deepLink: string | null;
  data: Record<string, unknown>;
};

/** Reads the push `data` object the same way the in-app notification row is shaped. */
export function notificationFromPayload(data: unknown): NotificationInput {
  const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const deepLink = typeof payload.deepLink === 'string' ? payload.deepLink : null;
  return { deepLink, data: payload };
}

/**
 * Resolves a notification and, when the payload only has a payment id,
 * loads that payment with the owner-scoped query before opening its parent.
 */
export async function openNotificationTarget(notification: NotificationInput): Promise<boolean> {
  const resolved = resolveNotificationDestination(notification);
  if (!resolved) return false;

  if (typeof resolved !== 'string') {
    const parent = await getPaymentParent(resolved.paymentId);
    if (parent?.bookingId) {
      router.push(bookingRecordHref(parent.bookingId));
      return true;
    }
    if (parent?.donationId) {
      router.push(donationRecordHref(parent.donationId));
      return true;
    }
    return false;
  }

  router.push(hrefForNotificationPath(resolved));
  return true;
}
