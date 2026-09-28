const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type PrefColumn =
  | 'booking_updates'
  | 'donation_receipts'
  | 'wildlife_sightings'
  | 'event_reminders'
  | 'conservation_news';

type Filter = {
  eq: (column: string, value: unknown) => Filter;
  in: (column: string, values: unknown[]) => Promise<{ data: { user_id?: string; token?: string }[] | null; error: { message: string } | null }>;
  then: PromiseLike<{ data: { user_id?: string; token?: string }[] | null; error: { message: string } | null }>['then'];
};

type PushAdmin = {
  from: (table: string) => {
    select: (columns: string) => Filter;
  };
};

/**
 * Best-effort device delivery. The notifications row is the record of truth
 * if Expo push is unreachable or the account has no token yet.
 */
export async function sendExpoPush(
  admin: PushAdmin,
  input: {
    userId: string | null;
    broadcast: boolean;
    title: string;
    body: string;
    deepLink?: string | null;
    data?: Record<string, string | null>;
    preference?: PrefColumn;
  },
): Promise<void> {
  try {
    let prefs = admin.from('notification_preferences').select('user_id').eq('push_enabled', true);
    if (!input.broadcast && input.userId) {
      prefs = prefs.eq('user_id', input.userId);
    }
    if (input.preference) {
      prefs = prefs.eq(input.preference, true);
    }
    const { data: prefRows, error: prefErr } = await prefs;
    if (prefErr || !prefRows?.length) return;

    const userIds = prefRows.map((row) => row.user_id).filter((id): id is string => Boolean(id));
    if (userIds.length === 0) return;

    const { data: tokenRows, error: tokenErr } = await admin
      .from('device_push_tokens')
      .select('token')
      .in('user_id', userIds);
    if (tokenErr || !tokenRows?.length) return;

    const messages = tokenRows
      .map((row) => row.token)
      .filter((token): token is string => Boolean(token))
      .map((token) => ({
        to: token,
        title: input.title,
        body: input.body,
        data: {
          deepLink: input.deepLink ?? null,
          bookingId: input.data?.bookingId ?? null,
          donationId: input.data?.donationId ?? null,
          paymentId: input.data?.paymentId ?? null,
        },
        sound: 'default',
      }));

    for (let i = 0; i < messages.length; i += 100) {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
    }
  } catch {
    // In-app notifications still exist if the push provider is down.
  }
}
