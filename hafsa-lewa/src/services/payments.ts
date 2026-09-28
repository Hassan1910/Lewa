import { supabase } from '@/lib/supabase';

/**
 * supabase-js replaces the function's JSON `{ error }` with a generic
 * "non-2xx" FunctionsHttpError. Read the response body so the UI can show
 * the real reason (missing secret, Paystack rejection, etc.).
 */
async function readFunctionError(error: unknown): Promise<string> {
  const fallback = error instanceof Error ? error.message : 'Payment request failed';
  const context = (error as { context?: Response }).context;
  if (!context || typeof context.clone !== 'function') return fallback;
  try {
    const body = (await context.clone().json()) as { error?: unknown; message?: unknown };
    const message = body?.error ?? body?.message;
    if (typeof message === 'string' && message.trim()) return message;
  } catch {
    try {
      const text = (await context.clone().text()).trim();
      if (text) return text;
    } catch {
      // Body was not JSON or text; keep the client message.
    }
  }
  return fallback;
}

async function invokePaymentFunction<T>(name: string, body: Record<string, string>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw new Error(await readFunctionError(error));
  if (data == null) throw new Error('No response from payment service');
  return data;
}

export type PaymentInitParams =
  | { purpose: 'booking'; bookingId: string; email: string }
  | { purpose: 'donation'; donationId: string; email: string };

export type PaymentInitResult = {
  paymentId: string;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  currency: string;
};

/**
 * Ask the Edge Function to build a Paystack transaction. The function is
 * responsible for:
 *   1. Loading the booking/donation the caller owns.
 *   2. Recomputing the amount from trusted DB rows.
 *   3. Initializing a Paystack transaction and persisting a payment row.
 */
export async function initializePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
  return invokePaymentFunction<PaymentInitResult>('paystack-initialize', params);
}

/**
 * Optional polling helper used after returning from the Paystack checkout
 * screen. Returns the current payment record; the webhook is the source of
 * truth for status transitions.
 */
export async function getPaymentStatus(paymentId: string): Promise<{
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  reference: string;
} | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('status, reference')
    .eq('id', paymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { status: data.status, reference: data.reference };
}

export async function verifyPayment(reference: string): Promise<{
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
}> {
  const data = await invokePaymentFunction<{ status: string }>('paystack-verify', { reference });
  return { status: (data?.status as never) ?? 'pending' };
}

/**
 * Verify a transaction after the in-app checkout sheet closes.
 * The webhook remains the source of truth; this is a client-side fallback
 * for local/test environments where the webhook URL is not reachable.
 */
export async function confirmCheckout(init: Pick<PaymentInitResult, 'paymentId' | 'reference'>): Promise<string> {
  try {
    const verified = await verifyPayment(init.reference);
    return verified.status;
  } catch {
    const row = await getPaymentStatus(init.paymentId);
    return row?.status ?? 'pending';
  }
}

export type BookingPayment = {
  id: string;
  reference: string;
  receiptNumber: string | null;
  provider: string;
  authorizationUrl: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paidAt: string | null;
  createdAt: string;
};

const PAYMENT_SELECT =
  'id, reference, receipt_number, provider, authorization_url, amount, currency, status, paid_at, created_at';

type PaymentRow = {
  id: string;
  reference: string;
  receipt_number: string | null;
  provider: string | null;
  authorization_url: string | null;
  amount: number | string;
  currency: string;
  status: BookingPayment['status'];
  paid_at: string | null;
  created_at: string;
};

function mapPayment(data: PaymentRow): BookingPayment {
  return {
    id: data.id,
    reference: data.reference,
    receiptNumber: data.receipt_number,
    provider: data.provider ?? 'paystack',
    authorizationUrl: data.authorization_url,
    amount: Number(data.amount),
    currency: data.currency,
    status: data.status,
    paidAt: data.paid_at,
    createdAt: data.created_at,
  };
}

/** Parent record on a payment the signed-in user can read. RLS hides other owners. */
export async function getPaymentParent(paymentId: string): Promise<{
  bookingId: string | null;
  donationId: string | null;
} | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('booking_id, donation_id')
    .eq('id', paymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const bookingId = typeof data.booking_id === 'string' ? data.booking_id : null;
  const donationId = typeof data.donation_id === 'string' ? data.donation_id : null;
  return { bookingId, donationId };
}

/** Newest Paystack row for a booking the signed-in user can read. */
export async function getLatestBookingPayment(bookingId: string): Promise<BookingPayment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPayment(data as PaymentRow) : null;
}

/** Newest Paystack row for a donation the signed-in user can read. */
export async function getLatestDonationPayment(donationId: string): Promise<BookingPayment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('donation_id', donationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPayment(data as PaymentRow) : null;
}

export type PaymentRecord = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  purpose: string | null;
  createdAt: string;
  paidAt: string | null;
};

export async function listMyPayments(userId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('id, reference, amount, currency, status, purpose, created_at, paid_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    reference: r.reference,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    purpose: r.purpose ?? null,
    createdAt: r.created_at,
    paidAt: r.paid_at,
  }));
}
