type Row = Record<string, unknown>;

type Filter = {
  eq: (col: string, val: string) => Filter;
  in: (col: string, vals: string[]) => Filter;
  maybeSingle: () => Promise<{ data: Row | null; error: { message: string } | null }>;
  select: (cols: string) => Promise<{ data: Row[] | null; error: { message: string } | null }>;
};

type Admin = {
  from: (table: string) => {
    select: (cols: string) => Filter;
    update: (values: Row) => Filter;
    insert: (values: Row) => Promise<{ error: { message: string } | null }>;
  };
  rpc: (
    fn: string,
    args: Row,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

const OPEN_BOOKING_STATUSES = ['draft', 'pending_payment', 'payment_verification', 'pending_review'];

export async function applyVerifiedPayment(
  admin: Admin,
  input: { reference: string; success: boolean; providerSummary: unknown },
): Promise<'pending' | 'processing' | 'success' | 'failed'> {
  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .select('id, user_id, booking_id, donation_id, amount, amount_minor, currency, status')
    .eq('reference', input.reference)
    .maybeSingle();
  if (paymentError) throw new Error(paymentError.message);
  if (!payment) return 'failed';
  if (payment.status === 'success') {
    await confirmPaidParents(admin, payment);
    await assignReceiptNumber(admin, String(payment.id));
    return 'success';
  }

  const chargedMinor = paystackAmountMinor(input.providerSummary);
  const expectedMinor = expectedAmountMinor(payment);
  const amountMatches = input.success && chargedMinor != null && chargedMinor === expectedMinor;

  let campaignId: string | null = null;
  if (amountMatches && payment.donation_id) {
    const { data: donation, error: donationError } = await admin
      .from('donations')
      .select('id, campaign_id, amount')
      .eq('id', payment.donation_id as string)
      .maybeSingle();
    if (donationError) throw new Error(donationError.message);
    if (donation?.campaign_id && sameMoney(donation.amount, payment.amount)) {
      campaignId = donation.campaign_id as string;
    } else if (donation?.campaign_id) {
      // The stored gift and the payment row disagree. Do not add either figure.
      campaignId = null;
    }
  }

  const accept = amountMatches && (payment.donation_id == null || campaignId != null);
  const { data: claimed, error: claimError } = await admin.rpc('claim_verified_payment', {
    p_payment_id: payment.id,
    p_success: accept,
    p_charged_minor: chargedMinor,
    p_paid_at: accept ? new Date().toISOString() : null,
    p_summary: (input.providerSummary ?? {}) as Row,
    p_campaign_id: accept ? campaignId : null,
  });
  if (claimError) throw new Error(claimError.message);

  const previousStatus = String(payment.status ?? '');
  const outcome = String(claimed ?? 'failed');
  if (outcome === 'already_success' || outcome === 'success') {
    await confirmPaidParents(admin, payment);
    await assignReceiptNumber(admin, String(payment.id));
    if (outcome === 'success') {
      await notifyPaid(admin, payment);
    }
    return 'success';
  }

  if (payment.booking_id) {
    const { error } = await admin
      .from('bookings')
      .update({ status: 'pending_payment', payment_status: 'failed' })
      .eq('id', payment.booking_id as string)
      .in('status', ['draft', 'pending_payment', 'payment_verification'])
      .select('id');
    if (error) throw new Error(error.message);
  }
  if (payment.donation_id) {
    const { error } = await admin
      .from('donations')
      .update({ status: 'failed' })
      .eq('id', payment.donation_id as string)
      .in('status', ['pending', 'processing'])
      .select('id');
    if (error) throw new Error(error.message);
  }
  if (previousStatus !== 'failed') await notifyFailed(admin, payment);
  return 'failed';
}

/** Paystack charges in minor units. payments.amount is major units (KES). */
function paystackAmountMinor(summary: unknown): number | null {
  if (!summary || typeof summary !== 'object') return null;
  const amount = (summary as { amount?: unknown }).amount;
  if (typeof amount === 'number' && Number.isFinite(amount)) return Math.trunc(amount);
  if (typeof amount === 'string' && /^-?\d+$/.test(amount.trim())) return Number(amount.trim());
  return null;
}

function expectedAmountMinor(payment: Row): number | null {
  const major = Number(payment.amount);
  if (!Number.isFinite(major)) return null;
  const fromAmount = Math.round(major * 100);
  if (payment.amount_minor == null) return fromAmount;
  const storedMinor = Number(payment.amount_minor);
  if (!Number.isFinite(storedMinor) || storedMinor !== fromAmount) return null;
  return fromAmount;
}

function sameMoney(left: unknown, right: unknown): boolean {
  const a = Number(left);
  const b = Number(right);
  return Number.isFinite(a) && Number.isFinite(b) && Math.round(a * 100) === Math.round(b * 100);
}

async function confirmPaidParents(admin: Admin, payment: Row): Promise<void> {
  if (payment.booking_id) {
    const { error } = await admin
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'success' })
      .eq('id', payment.booking_id as string)
      .in('status', OPEN_BOOKING_STATUSES)
      .select('id');
    if (error) throw new Error(error.message);
  }
  if (payment.donation_id) {
    const { error } = await admin
      .from('donations')
      .update({ status: 'success', payment_id: payment.id })
      .eq('id', payment.donation_id as string)
      .in('status', ['pending', 'processing', 'failed'])
      .select('id');
    if (error) throw new Error(error.message);
  }
}

async function assignReceiptNumber(admin: Admin, paymentId: string): Promise<void> {
  const first = await requestReceiptNumber(admin, paymentId);
  if (first.ok) return;
  // assign_receipt_number is idempotent, so one retry is safe. Warn only when
  // that retry also fails; do not treat an RPC error as "no number needed".
  const second = await requestReceiptNumber(admin, paymentId);
  if (second.ok) return;
  console.warn(`Receipt number failed: ${second.message}`);
}

async function requestReceiptNumber(
  admin: Admin,
  paymentId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const { data, error } = await admin.rpc('assign_receipt_number', { p_payment_id: paymentId });
    if (error) return { ok: false, message: error.message };
    if (typeof data !== 'string' || data.length === 0) {
      return { ok: false, message: 'Receipt number was not assigned' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'unknown error' };
  }
}

async function notifyPaid(admin: Admin, payment: Row): Promise<void> {
  const paymentId = String(payment.id);
  if (payment.booking_id) {
    const bookingId = payment.booking_id as string;
    const deepLink = `/bookings/${bookingId}`;
    const data = { bookingId, paymentId };
    const { error } = await admin.from('notifications').insert({
      user_id: payment.user_id,
      title: 'Booking confirmed',
      body: 'Your Lewa booking is confirmed. Paystack verified the payment in Kenyan Shillings.',
      type: 'payment_confirmation',
      deep_link: deepLink,
      data,
      broadcast: false,
    });
    if (error) throw new Error(error.message);
    await deliverPush(admin, {
      userId: (payment.user_id as string | null) ?? null,
      broadcast: false,
      title: 'Booking confirmed',
      body: 'Your Lewa booking is confirmed. Paystack verified the payment in Kenyan Shillings.',
      deepLink,
      data,
      preference: 'booking_updates',
    });
    await deliverEmail(admin, {
      userId: (payment.user_id as string | null) ?? null,
      subject: 'Booking confirmed',
      body: 'Your Lewa booking is confirmed. Paystack verified the payment in Kenyan Shillings.',
    });
  }

  if (payment.donation_id) {
    const donationId = payment.donation_id as string;
    const deepLink = `/donations/record/${donationId}`;
    const data = { donationId, paymentId };
    const { error } = await admin.from('notifications').insert({
      user_id: payment.user_id,
      title: 'Donation received',
      body: 'Thank you. Your gift has been verified and will support conservation at Lewa.',
      type: 'donation_confirmation',
      deep_link: deepLink,
      data,
      broadcast: false,
    });
    if (error) throw new Error(error.message);
    await deliverPush(admin, {
      userId: (payment.user_id as string | null) ?? null,
      broadcast: false,
      title: 'Donation received',
      body: 'Thank you. Your gift has been verified and will support conservation at Lewa.',
      deepLink,
      data,
      preference: 'donation_receipts',
    });
    await deliverEmail(admin, {
      userId: (payment.user_id as string | null) ?? null,
      subject: 'Donation received',
      body: 'Thank you. Your gift has been verified and will support conservation at Lewa.',
    });
  }
}

async function notifyFailed(admin: Admin, payment: Row): Promise<void> {
  const paymentId = String(payment.id);
  if (payment.booking_id) {
    const bookingId = payment.booking_id as string;
    const deepLink = `/bookings/${bookingId}`;
    const data = { bookingId, paymentId };
    const { error } = await admin.from('notifications').insert({
      user_id: payment.user_id,
      title: 'Payment failed',
      body: 'Paystack did not confirm this booking payment. Open the booking to try again.',
      type: 'payment_confirmation',
      deep_link: deepLink,
      data,
      broadcast: false,
    });
    if (error) throw new Error(error.message);
    await deliverPush(admin, {
      userId: (payment.user_id as string | null) ?? null,
      broadcast: false,
      title: 'Payment failed',
      body: 'Paystack did not confirm this booking payment. Open the booking to try again.',
      deepLink,
      data,
      preference: 'booking_updates',
    });
  }

  if (payment.donation_id) {
    const donationId = payment.donation_id as string;
    const deepLink = `/donations/record/${donationId}`;
    const data = { donationId, paymentId };
    const { error } = await admin.from('notifications').insert({
      user_id: payment.user_id,
      title: 'Donation payment failed',
      body: 'Paystack did not confirm this gift. Open the donation to see its status.',
      type: 'donation_confirmation',
      deep_link: deepLink,
      data,
      broadcast: false,
    });
    if (error) throw new Error(error.message);
    await deliverPush(admin, {
      userId: (payment.user_id as string | null) ?? null,
      broadcast: false,
      title: 'Donation payment failed',
      body: 'Paystack did not confirm this gift. Open the donation to see its status.',
      deepLink,
      data,
      preference: 'donation_receipts',
    });
  }
}

async function deliverEmail(
  admin: Admin,
  input: { userId: string | null; subject: string; body: string },
): Promise<void> {
  try {
    const { sendPaymentEmail } = await import('./email.ts');
    await sendPaymentEmail(admin, input);
  } catch (err) {
    console.warn(`Payment email failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
}

async function deliverPush(
  admin: Admin,
  input: {
    userId: string | null;
    broadcast: boolean;
    title: string;
    body: string;
    deepLink: string;
    data?: Record<string, string>;
    preference: 'booking_updates' | 'donation_receipts';
  },
): Promise<void> {
  try {
    const { sendExpoPush } = await import('./push.ts');
    await sendExpoPush(admin as never, input);
  } catch {
    // The in-app notification row is already stored.
  }
}
