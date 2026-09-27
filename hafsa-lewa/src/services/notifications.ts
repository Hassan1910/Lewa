import { supabase } from '@/lib/supabase';
import type { AppNotification, NotificationPreferences, NotificationType } from '@/services/types';

type Row = {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, unknown> | null;
  deep_link: string | null;
  broadcast: boolean;
  read_at: string | null;
  created_at: string;
};

function mapRow(r: Row): AppNotification {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    body: r.body,
    type: r.type,
    data: r.data ?? {},
    deepLink: r.deep_link,
    broadcast: r.broadcast,
    readAt: r.read_at,
    createdAt: r.created_at,
  };
}

/**
 * Returns notifications visible to the caller: their own targeted messages
 * plus any broadcast ones. RLS enforces this. If unauthenticated, we still
 * return recent broadcast announcements (readable via the announcements
 * table, but we surface a small subset here for the guest experience).
 */
export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, title, body, type, data, deep_link, broadcast, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function unreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
}

type PrefRow = {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  wildlife_sightings: boolean;
  booking_updates: boolean;
  event_reminders: boolean;
  donation_receipts: boolean;
  conservation_news: boolean;
};

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('user_id, push_enabled, email_enabled, wildlife_sightings, booking_updates, event_reminders, donation_receipts, conservation_news')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      wildlifeSightings: true,
      bookingUpdates: true,
      eventReminders: true,
      donationReceipts: true,
      conservationNews: false,
    };
  }
  const r = data as PrefRow;
  return {
    userId: r.user_id,
    pushEnabled: r.push_enabled,
    emailEnabled: r.email_enabled,
    wildlifeSightings: r.wildlife_sightings,
    bookingUpdates: r.booking_updates,
    eventReminders: r.event_reminders,
    donationReceipts: r.donation_receipts,
    conservationNews: r.conservation_news,
  };
}

export async function upsertNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  const { error } = await supabase.from('notification_preferences').upsert(
    {
      user_id: prefs.userId,
      push_enabled: prefs.pushEnabled,
      email_enabled: prefs.emailEnabled,
      wildlife_sightings: prefs.wildlifeSightings,
      booking_updates: prefs.bookingUpdates,
      event_reminders: prefs.eventReminders,
      donation_receipts: prefs.donationReceipts,
      conservation_news: prefs.conservationNews,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}
