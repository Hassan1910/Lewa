import { supabase } from './supabase';

export const PAYMENT_STATUSES = ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'] as const;
export const PAYMENT_PURPOSES = ['booking', 'donation'] as const;

export type PaymentFilters = {
  search: string;
  status: string;
  purpose: string;
  from: string;
  to: string;
};

export type PaymentRecord = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  provider: string;
  paidAt: string | null;
  createdAt: string;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  description: string;
  detail: string;
  method: string;
  gatewayMessage: string;
};

export type PaymentTotals = {
  collected: number;
  pendingAmount: number;
  failedCount: number;
  successCount: number;
  count: number;
  bookingCollected: number;
  donationCollected: number;
  currency: string;
};

export type PaymentBreakdownRow = {
  purpose: string;
  status: string;
  count: number;
  amount: number;
};

export type DailyCollection = {
  date: string;
  label: string;
  amount: number;
};

type Contact = { full_name?: string | null; email?: string | null; phone?: string | null };
type Guest = Contact & { is_lead?: boolean | null };
type BookingRow = {
  reference?: string | null;
  service_title?: string | null;
  booking_date?: string | null;
  guests?: number | null;
  booking_guests?: Guest[] | null;
};
type DonationRow = {
  donor_name?: string | null;
  donor_email?: string | null;
  campaign?: { title?: string | null } | Array<{ title?: string | null }> | null;
};
type RawPayment = {
  id: string;
  reference: string;
  amount: number | string;
  currency: string | null;
  status: string;
  purpose: string | null;
  provider: string | null;
  paid_at: string | null;
  created_at: string;
  provider_response_summary: unknown;
  payer: Contact | Contact[] | null;
  booking: BookingRow | BookingRow[] | null;
  donation: DonationRow | DonationRow[] | null;
};

const PAYMENT_SELECT = `
  id, reference, amount, currency, status, purpose, provider, paid_at, created_at, provider_response_summary,
  payer:profiles!payments_user_id_fkey(full_name, email, phone),
  booking:bookings!payments_booking_id_fkey(
    reference, service_title, booking_date, guests,
    booking_guests(full_name, email, phone, is_lead)
  ),
  donation:donations!payments_donation_id_fkey(
    donor_name, donor_email,
    campaign:donation_campaigns(title)
  )
`;

export function emptyFilters(): PaymentFilters {
  return { search: '', status: '', purpose: '', from: '', to: '' };
}

export async function loadPayments(): Promise<PaymentRecord[]> {
  const embedded = await supabase.from('payments').select(PAYMENT_SELECT).order('created_at', { ascending: false });
  if (!embedded.error) return ((embedded.data ?? []) as unknown as RawPayment[]).map(toPaymentRecord);
  return loadPaymentsByHand();
}

type PlainPayment = {
  id: string;
  reference: string;
  amount: number | string;
  currency: string | null;
  status: string;
  purpose: string | null;
  provider: string | null;
  paid_at: string | null;
  created_at: string;
  provider_response_summary: unknown;
  user_id: string | null;
  booking_id: string | null;
  donation_id: string | null;
};

async function loadPaymentsByHand(): Promise<PaymentRecord[]> {
  const plain = await supabase
    .from('payments')
    .select('id, reference, amount, currency, status, purpose, provider, paid_at, created_at, provider_response_summary, user_id, booking_id, donation_id')
    .order('created_at', { ascending: false });
  if (plain.error) throw new Error(plain.error.message);
  const rows = (plain.data ?? []) as PlainPayment[];
  const userIds = uniqueIds(rows.map((row) => row.user_id));
  const bookingIds = uniqueIds(rows.map((row) => row.booking_id));
  const donationIds = uniqueIds(rows.map((row) => row.donation_id));

  const [profiles, bookings, donations] = await Promise.all([
    userIds.length ? supabase.from('profiles').select('id, full_name, email, phone').in('id', userIds) : Promise.resolve({ data: [], error: null }),
    bookingIds.length
      ? supabase.from('bookings').select('id, reference, service_title, booking_date, guests, booking_guests(full_name, email, phone, is_lead)').in('id', bookingIds)
      : Promise.resolve({ data: [], error: null }),
    donationIds.length ? loadDonations(donationIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (profiles.error) throw new Error(profiles.error.message);
  if (bookings.error) throw new Error(bookings.error.message);
  if (donations.error) throw new Error(donations.error.message);

  const profileById = new Map((profiles.data ?? []).map((row) => [String(row.id), row]));
  const bookingById = new Map((bookings.data ?? []).map((row) => [String(row.id), row]));
  const donationById = new Map((donations.data ?? []).map((row) => [String(row.id), row]));

  return rows.map((row) =>
    toPaymentRecord({
      ...row,
      payer: row.user_id ? profileById.get(row.user_id) ?? null : null,
      booking: row.booking_id ? bookingById.get(row.booking_id) ?? null : null,
      donation: row.donation_id ? donationById.get(row.donation_id) ?? null : null,
    }),
  );
}

async function loadDonations(ids: string[]) {
  const withCampaign = await supabase.from('donations').select('id, donor_name, donor_email, campaign:donation_campaigns(title)').in('id', ids);
  if (!withCampaign.error) return withCampaign;
  return supabase.from('donations').select('id, donor_name, donor_email').in('id', ids);
}

function uniqueIds(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export function filterPayments(rows: PaymentRecord[], filters: PaymentFilters): PaymentRecord[] {
  const query = filters.search.trim().toLowerCase();
  const from = filters.from ? startOfDay(filters.from) : null;
  const to = filters.to ? endOfDay(filters.to) : null;
  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.purpose && row.purpose !== filters.purpose) return false;
    const when = new Date(row.paidAt || row.createdAt);
    if (from && when < from) return false;
    if (to && when > to) return false;
    if (!query) return true;
    const haystack = [row.reference, row.payerName, row.payerEmail, row.payerPhone, row.description, row.detail]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function paymentTotals(rows: PaymentRecord[]): PaymentTotals {
  const totals: PaymentTotals = {
    collected: 0,
    pendingAmount: 0,
    failedCount: 0,
    successCount: 0,
    count: rows.length,
    bookingCollected: 0,
    donationCollected: 0,
    currency: rows.find((row) => row.currency)?.currency || 'KES',
  };
  for (const row of rows) {
    if (row.status === 'success') {
      totals.collected += row.amount;
      totals.successCount += 1;
      if (row.purpose === 'booking') totals.bookingCollected += row.amount;
      if (row.purpose === 'donation') totals.donationCollected += row.amount;
    } else if (row.status === 'pending' || row.status === 'processing') {
      totals.pendingAmount += row.amount;
    } else if (row.status === 'failed') {
      totals.failedCount += 1;
    }
  }
  return totals;
}

export function paymentBreakdown(rows: PaymentRecord[]): PaymentBreakdownRow[] {
  const groups = new Map<string, PaymentBreakdownRow>();
  for (const row of rows) {
    const purpose = row.purpose || 'other';
    const key = `${purpose}:${row.status}`;
    const current = groups.get(key) ?? { purpose, status: row.status, count: 0, amount: 0 };
    current.count += 1;
    current.amount += row.amount;
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => a.purpose.localeCompare(b.purpose) || a.status.localeCompare(b.status));
}

export function dailyCollections(rows: PaymentRecord[]): DailyCollection[] {
  const groups = new Map<string, number>();
  for (const row of rows) {
    if (row.status !== 'success') continue;
    const date = localDateKey(new Date(row.paidAt || row.createdAt));
    groups.set(date, (groups.get(date) ?? 0) + row.amount);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, label: formatDayLabel(date), amount }));
}

export type ReportPreset = 'month' | '7d' | 'all' | 'custom';

export function rangeForPreset(preset: Exclude<ReportPreset, 'custom' | 'all'>): { from: string; to: string } {
  const today = new Date();
  const to = localDateKey(today);
  if (preset === '7d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { from: localDateKey(start), to };
  }
  return { from: localDateKey(new Date(today.getFullYear(), today.getMonth(), 1)), to };
}

export function paymentsToCsv(rows: PaymentRecord[]): string {
  const headers = [
    'paid at',
    'created at',
    'reference',
    'payer',
    'email',
    'phone',
    'purpose',
    'description',
    'amount',
    'currency',
    'status',
    'method',
  ];
  const lines = rows.map((row) =>
    [
      row.paidAt ?? '',
      row.createdAt,
      row.reference,
      row.payerName,
      row.payerEmail,
      row.payerPhone,
      row.purpose,
      row.description,
      row.amount.toFixed(2),
      row.currency,
      row.status,
      row.method,
    ]
      .map(csvCell)
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toPaymentRecord(raw: RawPayment): PaymentRecord {
  const payer = first(raw.payer);
  const booking = first(raw.booking);
  const donation = first(raw.donation);
  const guests = booking?.booking_guests ?? [];
  const lead = guests.find((guest) => guest.is_lead) ?? guests[0];
  const campaign = first(donation?.campaign ?? null);
  const purpose = raw.purpose ?? '';
  const service = booking?.service_title?.trim() || '';
  const campaignTitle = campaign?.title?.trim() || '';
  const description =
    purpose === 'booking'
      ? service
        ? booking?.reference
          ? `${service} (${booking.reference})`
          : service
        : 'Booking'
      : purpose === 'donation'
        ? campaignTitle || 'Donation'
        : service || campaignTitle || 'Payment';
  const detailParts: string[] = [];
  if (booking?.booking_date) detailParts.push(new Date(booking.booking_date).toLocaleString('en-KE'));
  if (booking?.guests) detailParts.push(`${booking.guests} guest${booking.guests === 1 ? '' : 's'}`);
  if (booking?.reference && purpose !== 'booking') detailParts.push(booking.reference);
  const summary = methodFromSummary(raw.provider_response_summary);
  return {
    id: raw.id,
    reference: raw.reference,
    amount: Number(raw.amount) || 0,
    currency: raw.currency || 'KES',
    status: raw.status,
    purpose,
    provider: raw.provider || 'paystack',
    paidAt: raw.paid_at,
    createdAt: raw.created_at,
    payerName: clean(payer?.full_name) || clean(donation?.donor_name) || clean(lead?.full_name) || 'Unknown payer',
    payerEmail: clean(payer?.email) || clean(donation?.donor_email) || clean(lead?.email),
    payerPhone: clean(payer?.phone) || clean(lead?.phone),
    description,
    detail: detailParts.join(' · '),
    method: summary.method,
    gatewayMessage: summary.gatewayMessage,
  };
}

function methodFromSummary(summary: unknown): { method: string; gatewayMessage: string } {
  if (!summary || typeof summary !== 'object') return { method: '', gatewayMessage: '' };
  const data = summary as Record<string, unknown>;
  const authorization =
    data.authorization && typeof data.authorization === 'object' ? (data.authorization as Record<string, unknown>) : {};
  const channel = String(data.channel ?? authorization.channel ?? '')
    .trim()
    .toLowerCase();
  let method = '';
  if (channel === 'card') {
    const brand = titleCase(clean(authorization.brand) || 'card');
    const last4 = clean(authorization.last4);
    method = last4 ? `${brand} ···· ${last4}` : brand;
  } else if (channel === 'mobile_money') {
    method = mobileMoneyLabel(clean(authorization.bank));
  } else if (channel) {
    method = titleCase(channel.replaceAll('_', ' '));
  }
  const gatewayMessage = typeof data.gateway_response === 'string' ? data.gateway_response.trim() : '';
  return { method, gatewayMessage };
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function clean(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mobileMoneyLabel(bank: string) {
  const key = bank.toLowerCase().replace(/[^a-z]/g, '');
  if (!key || key === 'mpesa') return 'M-Pesa';
  return titleCase(bank);
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayLabel(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

function startOfDay(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
}

function endOfDay(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999);
}
