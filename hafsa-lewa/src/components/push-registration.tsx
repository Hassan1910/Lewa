import { useRootNavigationState } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/lib/auth-context';
import { registerDevicePushToken, remotePushUnavailable } from '@/services/push';
import { notificationFromPayload, openNotificationTarget } from '@/utils/open-notification';

type PendingOpen = { key: string; data: unknown };

/** Registers the device token after sign-in and opens the record a push points at. */
export function PushRegistration() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const rootNavigationState = useRootNavigationState();
  const navigationReady = Boolean(rootNavigationState?.key);
  const pending = useRef<PendingOpen | null>(null);
  const handled = useRef(new Set<string>());
  const [flushToken, setFlushToken] = useState(0);

  useEffect(() => {
    if (!userId || remotePushUnavailable) return;
    void registerDevicePushToken(userId).catch(() => {
      // Permission denied or Expo push unavailable. In-app alerts still work.
    });
  }, [userId]);

  useEffect(() => {
    const next = pending.current;
    if (!userId || !navigationReady || !next || handled.current.has(next.key)) return;
    const current = next;
    handled.current.add(current.key);
    pending.current = null;
    void (async () => {
      let opened = false;
      try {
        opened = await openNotificationTarget(notificationFromPayload(current.data));
      } catch {
        opened = false;
      }
      if (!opened) return;
      try {
        const Notifications = await import('expo-notifications');
        // Current SDK 57 clear. clearLastNotificationResponseAsync only calls this.
        Notifications.clearLastNotificationResponse();
      } catch {
        // The record is already open. Leave the response if the module cannot clear it.
      }
    })();
  }, [userId, navigationReady, flushToken]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;
    let subscription: { remove: () => void } | undefined;

    const queue = (key: string, data: unknown) => {
      if (handled.current.has(key)) return;
      pending.current = { key, data };
      setFlushToken((token) => token + 1);
    };

    void import('expo-notifications')
      .then(async (Notifications) => {
        if (cancelled) return;
        // Cold start: SDK 57 async read. It resolves to the same value as the sync getter.
        const last = await Notifications.getLastNotificationResponseAsync();
        if (cancelled) return;
        if (last?.notification) {
          queue(last.notification.request.identifier, last.notification.request.content.data);
        }
        if (cancelled) return;
        subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          queue(response.notification.request.identifier, response.notification.request.content.data);
        });
      })
      .catch(() => {
        // Android Expo Go cannot load expo-notifications. In-app alerts still work.
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return null;
}
