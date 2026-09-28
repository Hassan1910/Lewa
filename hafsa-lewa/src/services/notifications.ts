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

type ReadReceipt = {
  notification_id: string;
  read_at: string;
};

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Receipts record that this account opened a shared broadcast. */
async function readReceiptsFor(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const userId = await currentUserId();
  if (!userId) return new Map();
  const { data, error } = await supabase
    .from('notification_reads')
    .select('notification_id, read_at')
    .eq('user_id', userId)
    .in('notification_id', ids);
  if (error) throw error;
  return new Map((data as ReadReceipt[] | null)?.map((r) => [r.notification_id, r.read_at]) ?? []);
}

function withReceipts(items: AppNotification[], receipts: Map<string, string>): AppNotification[] {
  return items.map((n) => (n.readAt ? n : { ...n, readAt: receipts.get(n.id) ?? null }));
}

/**
 * Returns notifications visible to the caller: their own targeted messages
 * plus any broadcast ones. RLS enforces this. A broadcast is read for this
 * account when a row exists in notification_reads.
 */
export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, title, body, type, data, deep_link, broadcast, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  const items = (data as Row[]).map(mapRow);
  const receipts = await readReceiptsFor(items.filter((n) => !n.readAt).map((n) => n.id));
  return withReceipts(items, receipts);
}

export async function unreadNotificationCount(): Promise<number> {
  const { data, error } = await supabase.from('notifications').select('id, read_at').is('read_at', null);
  if (error) throw error;
  const unreadIds = ((data as { id: string; read_at: string | null }[] | null) ?? []).map((r) => r.id);
  if (unreadIds.length === 0) return 0;
  const receipts = await readReceiptsFor(unreadIds);
  return unreadIds.filter((id) => !receipts.has(id)).length;
}

export async function markNotificationRead(id: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  const readAt = new Date().toISOString();
  const { error } = await supabase.from('notification_reads').upsert(
    { user_id: userId, notification_id: id, read_at: readAt },
    { onConflict: 'user_id,notification_id' },
  );
  if (error) throw error;
  const { error: ownError } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .eq('id', id)
    .eq('user_id', userId);
  if (ownError) throw ownError;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const readAt = new Date().toISOString();
  const { data, error: listError } = await supabase.from('notifications').select('id').is('read_at', null);
  if (listError) throw listError;
  const ids = ((data as { id: string }[] | null) ?? []).map((r) => r.id);
  if (ids.length > 0) {
    const { error } = await supabase.from('notification_reads').upsert(
      ids.map((notificationId) => ({ user_id: userId, notification_id: notificationId, read_at: readAt })),
      { onConflict: 'user_id,notification_id' },
    );
    if (error) throw error;
  }
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
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
