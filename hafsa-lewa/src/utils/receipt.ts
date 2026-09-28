import type { BookingDetail } from '@/services/types';
import type { BookingPayment } from '@/services/payments';
import type { MyDonation } from '@/services/donations';
import { formatBookingTime, formatCurrency, formatDate, formatDateOnly } from './format.ts';

const ORGANIZATION = 'Lewa Wildlife Conservancy';

export type ReceiptModel = {
  kind: 'Booking' | 'Donation';
  receiptNumber: string;
  referenceLabel: string;
  reference: string;
  customerName: string;
  customerContact: string;
  itemLabel: string;
  itemName: string;
  rows: { label: string; value: string }[];
  amountPaid: string;
  total: string;
  paymentStatus: string;
  recordStatus: string;
  message: string;
  generatedAt: string;
};

function money(amount: number, currency: string): string {
  return formatCurrency(amount, { currency, useCode: true });
}

function paymentMethod(provider: string): string {
  if (provider.toLowerCase() === 'paystack') return 'Paystack';
  return provider;
}

function contactLine(parts: (string | null | undefined)[]): string {
  const values = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  return values.length > 0 ? values.join(' · ') : '—';
}

export function bookingReceiptModel(booking: BookingDetail, payment: BookingPayment, generatedAt = new Date()): ReceiptModel {
  const time = formatBookingTime(booking.bookingDate);
  const rows = [
    { label: 'Booking date', value: formatDateOnly(booking.bookingDate) },
    ...(time ? [{ label: 'Booking time', value: time }] : []),
    { label: 'Guests', value: String(booking.guests) },
    { label: 'Location', value: booking.meetingPoint ?? 'Lewa Wildlife Conservancy' },
    { label: 'Payment date', value: formatDate(payment.paidAt ?? payment.createdAt) },
    { label: 'Payment method', value: paymentMethod(payment.provider) },
    { label: 'Transaction reference', value: payment.reference },
  ];
  if (booking.specialRequests) rows.push({ label: 'Notes', value: booking.specialRequests });

  return {
    kind: 'Booking',
    receiptNumber: payment.receiptNumber ?? payment.reference,
    referenceLabel: 'Booking reference',
    reference: booking.reference,
    customerName: booking.leadGuest?.fullName ?? 'Guest',
    customerContact: contactLine([booking.leadGuest?.email, booking.leadGuest?.phone]),
    itemLabel: 'Experience',
    itemName: booking.serviceTitle,
    rows,
    amountPaid: money(payment.amount, payment.currency),
    total: money(payment.amount, payment.currency),
    paymentStatus: payment.status,
    recordStatus: booking.status,
    message: 'Thank you for visiting Lewa. This receipt confirms your payment in Kenyan Shillings.',
    generatedAt: formatDate(generatedAt.toISOString()),
  };
}

export function donationReceiptModel(donation: MyDonation, payment: BookingPayment, generatedAt = new Date()): ReceiptModel {
  const rows = [
    { label: 'Donation date', value: formatDate(donation.createdAt) },
    { label: 'Payment date', value: formatDate(payment.paidAt ?? payment.createdAt) },
    { label: 'Payment method', value: paymentMethod(payment.provider) },
    { label: 'Transaction reference', value: payment.reference },
  ];
  if (donation.message) rows.push({ label: 'Message', value: donation.message });

  return {
    kind: 'Donation',
    receiptNumber: payment.receiptNumber ?? payment.reference,
    referenceLabel: 'Donation reference',
    reference: donation.reference,
    customerName: donation.donorName ?? 'Donor',
    customerContact: donation.donorEmail ?? '—',
    itemLabel: 'Campaign',
    itemName: donation.campaignTitle,
    rows,
    amountPaid: money(payment.amount, payment.currency),
    total: money(payment.amount, payment.currency),
    paymentStatus: payment.status,
    recordStatus: donation.status,
    message: 'Thank you. Your gift supports wildlife conservation at Lewa.',
    generatedAt: formatDate(generatedAt.toISOString()),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** PNG bytes as a data URI. Used when the app icon can be read at generation time. */
export function pngBytesToDataUri(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

function isPng(bytes: Uint8Array): boolean {
  return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function canReadIconFromNode(): boolean {
  if (typeof process === 'undefined' || !process.versions?.node) return false;
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') return false;
  return true;
}

/** Node-only read of assets/images/icon.png. Dynamic so the app bundle does not depend on node:fs. */
async function readIconFromNode(): Promise<Uint8Array | null> {
  if (!canReadIconFromNode()) return null;
  try {
    const loader = new Function(
      'url',
      `return (async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const { fileURLToPath } = await import('node:url');
        return fs.readFile(path.join(path.dirname(fileURLToPath(url)), '../../assets/images/icon.png'));
      })();`,
    ) as (url: string) => Promise<Uint8Array>;
    const bytes = new Uint8Array(await loader(import.meta.url));
    return isPng(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

async function readIconFromBundle(): Promise<Uint8Array | null> {
  try {
    const { Image } = await import('react-native');
    const source = Image.resolveAssetSource(require('../../assets/images/icon.png'));
    const uri = source?.uri;
    if (!uri) return null;
    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2000);
    });
    const body = (async () => {
      const response = await fetch(uri);
      if (!response.ok) return null;
      return new Uint8Array(await response.arrayBuffer());
    })();
    const bytes = await Promise.race([body, timeout]);
    if (!bytes || !isPng(bytes)) return null;
    return bytes;
  } catch {
    return null;
  }
}

/**
 * App icon as a data URI, or null when the file cannot be read.
 * PDF generation continues with the letter mark in that case.
 */
export async function loadReceiptLogoDataUri(): Promise<string | null> {
  try {
    const fromDisk = await readIconFromNode();
    const bytes = fromDisk ?? (await readIconFromBundle());
    return bytes ? pngBytesToDataUri(bytes) : null;
  } catch {
    return null;
  }
}

function logoMarkup(logoDataUri: string | null | undefined): string {
  if (logoDataUri?.startsWith('data:image/')) {
    return `<img class="logo" src="${escapeHtml(logoDataUri)}" alt="" width="44" height="44" />`;
  }
  return `<div class="mark">L</div>`;
}

export function receiptHtml(model: ReceiptModel, logoDataUri?: string | null): string {
  const rows = model.rows
    .map(
      (row) =>
        `<tr><td class="label">${escapeHtml(row.label)}</td><td>${escapeHtml(row.value)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(model.receiptNumber)}</title>
  <style>
    @page { margin: 24px; }
    body { margin: 0; font-family: Helvetica, Arial, sans-serif; color: #172019; background: #ffffff; }
    .sheet { max-width: 640px; margin: 0 auto; padding: 28px 24px 36px; }
    .mark { width: 44px; height: 44px; border-radius: 22px; background: #2F5D3A; color: #ffffff; text-align: center; line-height: 44px; font-weight: 700; letter-spacing: 0.04em; }
    .logo { width: 44px; height: 44px; border-radius: 22px; object-fit: cover; display: block; }
    .brand { margin-top: 12px; font-size: 22px; font-weight: 700; color: #2F5D3A; }
    .sub { margin-top: 4px; color: #667068; font-size: 13px; }
    h1 { margin: 28px 0 4px; font-size: 20px; font-weight: 700; }
    .meta { color: #667068; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; border-bottom: 1px solid #DDE2DC; vertical-align: top; font-size: 14px; }
    td.label { color: #667068; width: 46%; }
    .total { margin-top: 18px; padding: 14px 16px; background: #E8F0EA; border-radius: 12px; }
    .total span { display: block; color: #667068; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
    .total strong { display: block; margin-top: 4px; font-size: 22px; color: #23482D; }
    .thanks { margin-top: 22px; font-size: 14px; line-height: 1.5; }
    .foot { margin-top: 28px; color: #667068; font-size: 12px; }
  </style>
</head>
<body>
  <div class="sheet">
    ${logoMarkup(logoDataUri)}
    <div class="brand">${escapeHtml(ORGANIZATION)}</div>
    <div class="sub">${escapeHtml(model.kind)} receipt · Kenyan Shillings</div>
    <h1>Receipt ${escapeHtml(model.receiptNumber)}</h1>
    <div class="meta">${escapeHtml(model.referenceLabel)} ${escapeHtml(model.reference)}</div>
    <table>
      <tr><td class="label">Customer</td><td>${escapeHtml(model.customerName)}</td></tr>
      <tr><td class="label">Contact</td><td>${escapeHtml(model.customerContact)}</td></tr>
      <tr><td class="label">${escapeHtml(model.itemLabel)}</td><td>${escapeHtml(model.itemName)}</td></tr>
      ${rows}
      <tr><td class="label">Amount paid</td><td>${escapeHtml(model.amountPaid)}</td></tr>
      <tr><td class="label">Payment status</td><td>${escapeHtml(model.paymentStatus)}</td></tr>
      <tr><td class="label">${escapeHtml(model.kind)} status</td><td>${escapeHtml(model.recordStatus)}</td></tr>
    </table>
    <div class="total"><span>Total paid</span><strong>${escapeHtml(model.total)}</strong></div>
    <p class="thanks">${escapeHtml(model.message)}</p>
    <p class="foot">Generated ${escapeHtml(model.generatedAt)} · ${escapeHtml(ORGANIZATION)}</p>
  </div>
</body>
</html>`;
}
