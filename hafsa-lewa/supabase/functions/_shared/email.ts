type EmailAdmin = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
      };
    };
  };
};

/**
 * One confirmation email after a verified payment. Missing notification
 * preferences mean email is on, matching the app default. A missing
 * Resend key, a disabled preference, or a provider error is logged and
 * ignored so the payment still completes.
 */
export async function sendPaymentEmail(
  admin: EmailAdmin,
  input: { userId: string | null; subject: string; body: string },
): Promise<void> {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set; skipping payment confirmation email');
      return;
    }
    if (!input.userId) {
      console.warn('Payment has no user; skipping confirmation email');
      return;
    }

    const { data: prefs, error: prefError } = await admin
      .from('notification_preferences')
      .select('email_enabled')
      .eq('user_id', input.userId)
      .maybeSingle();
    if (prefError) {
      console.warn(`Could not read email preference: ${prefError.message}`);
      return;
    }
    if (prefs && prefs.email_enabled === false) return;

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email')
      .eq('id', input.userId)
      .maybeSingle();
    if (profileError) {
      console.warn(`Could not read profile email: ${profileError.message}`);
      return;
    }
    const to = typeof profile?.email === 'string' ? profile.email.trim() : '';
    if (!to) {
      console.warn('No email address for payment confirmation');
      return;
    }

    const from = Deno.env.get('RESEND_FROM')?.trim() || 'Lewa Wildlife Conservancy <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        text: input.body,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.warn(`Payment email was not sent (${response.status}): ${detail.slice(0, 300)}`);
    }
  } catch (err) {
    console.warn(`Payment email failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
}
