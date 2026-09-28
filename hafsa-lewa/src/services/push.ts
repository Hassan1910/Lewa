import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * Importing expo-notifications throws on Android Expo Go (SDK 53+).
 * Development and production builds still register remote tokens.
 */
export const remotePushUnavailable = Platform.OS === 'android' && isRunningInExpoGo();

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: Promise<NotificationsModule> | null = null;

function loadNotifications(): Promise<NotificationsModule> {
  if (!notificationsModule) {
    notificationsModule = import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return Notifications;
    });
  }
  return notificationsModule;
}

/**
 * Stores this device's Expo push token for the signed-in account.
 * Web, simulators, and Android Expo Go have no remote push token;
 * failure here must not block sign-in.
 */
export async function registerDevicePushToken(userId: string): Promise<void> {
  if (remotePushUnavailable || Platform.OS === 'web' || !Device.isDevice) return;

  const Notifications = await loadNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lewa',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const { error } = await supabase.from('device_push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' },
  );
  if (error) throw error;
}
