import assert from 'node:assert/strict';

import type { BookingPayment } from '../services/payments.ts';
import type { MyDonation } from '../services/donations.ts';
import type { BookingDetail } from '../services/types.ts';
import { formatCurrency, formatDate } from './format.ts';
import {
  bookingReceiptModel,
  donationReceiptModel,
  loadReceiptLogoDataUri,
  receiptHtml,
} from './receipt.ts';

const generatedAt = new Date('2026-06-15T12:00:00.000Z');

const payment: BookingPayment = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  reference: 'PSK-REF-9',
  receiptNumber: 'RCP-20260615-AAAAAA',
  provider: 'paystack',
  authorizationUrl: null,
  amount: 18000,
  currency: 'KES',
  status: 'success',
  paidAt: '2026-06-15T12:00:00.000Z',
  createdAt: '2026-06-15T11:00:00.000Z',
};

const booking: BookingDetail = {
  id: '11111111-1111-1111-1111-111111111111',
  reference: 'BK-LIVE-42',
  userId: null,
  serviceId: 'rhino-tracking',
  serviceTitle: 'Rhino tracking',
  imageUrl: null,
  bookingDate: '2026-06-15T03:00:00.000Z',
  guests: 2,
  amount: 18000,
  currency: 'KES',
  status: 'completed',
  paymentStatus: 'success',
  createdAt: '2026-06-14T09:00:00.000Z',
  specialRequests: null,
  meetingPoint: 'Lewa airstrip',
  leadGuest: { fullName: 'Amina Otieno', email: 'amina@example.com', phone: '+254700000000' },
};

const total = formatCurrency(18000, { currency: 'KES', useCode: true });
const model = bookingReceiptModel(booking, payment, generatedAt);
const html = receiptHtml(model);

assert.equal(model.paymentStatus, 'success');
assert.equal(model.recordStatus, 'completed');
assert.equal(model.total, total);
assert.ok(html.includes('RCP-20260615-AAAAAA'));
assert.ok(html.includes('BK-LIVE-42'));
assert.ok(html.includes(total));
assert.ok(html.includes('KES'));
assert.ok(html.includes('success'));
assert.ok(html.includes('completed'));
assert.ok(html.includes('Amina Otieno'));
assert.ok(html.includes('amina@example.com'));
assert.ok(html.includes('Rhino tracking'));
assert.ok(html.includes('Paystack'));
assert.ok(html.includes('PSK-REF-9'));
assert.ok(html.includes('Lewa Wildlife Conservancy'));
assert.ok(html.includes('Thank you for visiting Lewa'));
assert.ok(html.includes(formatDate(generatedAt.toISOString())));
assert.equal(html.includes('Booking time'), false);
assert.equal(html.includes('Paid'), false);
assert.equal(html.includes('Confirmed'), false);
assert.equal(html.includes('Fees'), false);
assert.equal(html.includes('Donation amount'), false);
assert.ok(html.includes('class="mark"'));

const timed = bookingReceiptModel(
  { ...booking, bookingDate: '2026-06-15T08:30:00.000Z' },
  payment,
  generatedAt,
);
assert.ok(receiptHtml(timed).includes('Booking time'));

const donation: MyDonation = {
  id: '33333333-3333-3333-3333-333333333333',
  reference: 'DN-LIVE-7',
  campaignId: 'campaign-1',
  campaignTitle: 'Rhino sanctuary',
  amount: 18000,
  currency: 'KES',
  status: 'succeeded',
  donorName: 'Amina Otieno',
  donorEmail: 'amina@example.com',
  message: null,
  createdAt: '2026-06-15T10:00:00.000Z',
};
const gift = donationReceiptModel(donation, payment, generatedAt);
const giftHtml = receiptHtml(gift);
assert.equal(gift.recordStatus, 'succeeded');
assert.equal(gift.paymentStatus, 'success');
assert.ok(giftHtml.includes('DN-LIVE-7'));
assert.ok(giftHtml.includes(total));
assert.ok(giftHtml.includes('succeeded'));
assert.equal(giftHtml.includes('Received'), false);
assert.equal(giftHtml.includes('Paid'), false);

const logo = await loadReceiptLogoDataUri();
assert.ok(logo?.startsWith('data:image/png;base64,'));
const withLogo = receiptHtml(model, logo);
assert.ok(withLogo.includes(`src="${logo}"`));
assert.equal(withLogo.includes('class="mark"'), false);
assert.equal(receiptHtml(model, null).includes('data:image/png'), false);

console.log('receipt model tests passed');
