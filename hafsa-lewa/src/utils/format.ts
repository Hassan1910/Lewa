const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an amount in Kenyan Shillings.
 * - Default: `KSh 18,000` (whole shillings)
 * - `withCurrencyCode`: `KES 18,000.00` for admin / receipts
 */
export function formatCurrency(
  amount: number,
  options: { currency?: string; showDecimals?: boolean; useCode?: boolean } = {},
): string {
  const { currency = 'KES', showDecimals = false, useCode = false } = options;
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = value.toLocaleString('en-KE', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  if (useCode || currency !== 'KES') {
    return `${currency} ${formatted}`;
  }
  return `KSh ${formatted}`;
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const month = MONTHS_SHORT[date.getMonth()];
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${month} ${day}, ${date.getFullYear()} · ${time}`;
}

/**
 * Clock time in Nairobi. Date-only reservations are stored at 06:00 and return null.
 */
export function formatBookingTime(isoDate: string): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const clock = new Intl.DateTimeFormat('en-KE', {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  if (clock === '06:00') return null;
  return new Intl.DateTimeFormat('en-KE', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDateOnly(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatMonthDay(isoDate: string): { month: string; day: string } {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return { month: '', day: '' };
  return {
    month: MONTHS_SHORT[date.getMonth()].toUpperCase(),
    day: String(date.getDate()),
  };
}

/**
 * Human-friendly relative time. Falls back to absolute date beyond a week.
 */
export function formatRelativeTime(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const diffMs = date.getTime() - now.getTime();
  const past = diffMs < 0;
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (abs < minute) return past ? 'just now' : 'in a moment';
  if (abs < hour) {
    const n = Math.round(abs / minute);
    return past ? `${n}m ago` : `in ${n}m`;
  }
  if (abs < day) {
    const n = Math.round(abs / hour);
    return past ? `${n}h ago` : `in ${n}h`;
  }
  if (abs < week) {
    const n = Math.round(abs / day);
    return past ? `${n}d ago` : `in ${n}d`;
  }
  return formatDateOnly(isoDate);
}
