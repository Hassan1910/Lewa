import assert from 'node:assert/strict';

import { resolveNotificationDestination } from './notification-destination.ts';

const bookingId = '11111111-1111-1111-1111-111111111111';
const otherBookingId = '22222222-2222-2222-2222-222222222222';
const donationId = '33333333-3333-3333-3333-333333333333';
const otherDonationId = '55555555-5555-5555-5555-555555555555';
const paymentId = '44444444-4444-4444-4444-444444444444';

function dest(deepLink: string | null, data: Record<string, unknown> = {}) {
  return resolveNotificationDestination({ deepLink, data });
}

assert.equal(dest(`/bookings/${bookingId}`), `/bookings/${bookingId}`);
assert.equal(dest(`/(tabs)/bookings/${bookingId}`), `/bookings/${bookingId}`);
assert.equal(dest('/bookings', { bookingId }), `/bookings/${bookingId}`);
assert.equal(dest('/(tabs)/bookings', { bookingId: otherBookingId }), `/bookings/${otherBookingId}`);
assert.equal(dest(`/booking/status?bookingId=${bookingId}`), `/bookings/${bookingId}`);
assert.equal(dest(null, { bookingId }), `/bookings/${bookingId}`);

assert.equal(dest('/donations/history', { donationId }), `/donations/record/${donationId}`);
assert.equal(dest(`/donations/record/${donationId}`), `/donations/record/${donationId}`);
assert.equal(dest(null, { donationId }), `/donations/record/${donationId}`);
assert.equal(dest('/donations/history'), '/donations/history');
assert.equal(dest('/wildlife/rhino'), '/wildlife/rhino');
assert.equal(dest(null, {}), null);

assert.equal(dest('/bookings', { booking_id: bookingId }), `/bookings/${bookingId}`);
assert.equal(dest('/(tabs)/bookings', { booking_id: otherBookingId }), `/bookings/${otherBookingId}`);
assert.equal(dest('/booking/status', { booking_id: bookingId }), `/bookings/${bookingId}`);
assert.equal(dest(null, { booking_id: bookingId }), `/bookings/${bookingId}`);
assert.equal(dest('/donations/history', { donation_id: donationId }), `/donations/record/${donationId}`);
assert.equal(dest(null, { donation_id: donationId }), `/donations/record/${donationId}`);

assert.equal(dest(`/bookings/${bookingId}`, { bookingId: otherBookingId }), `/bookings/${bookingId}`);
assert.equal(dest(`/bookings/${bookingId}`, { booking_id: otherBookingId }), `/bookings/${bookingId}`);
assert.equal(dest('/bookings', { bookingId, booking_id: otherBookingId }), `/bookings/${bookingId}`);
assert.equal(
  dest(`/booking/status?bookingId=${bookingId}`, { booking_id: otherBookingId }),
  `/bookings/${otherBookingId}`,
);
assert.equal(dest(`/donations/record/${donationId}`, { donationId: otherDonationId }), `/donations/record/${donationId}`);
assert.equal(dest(`/donations/record/${donationId}`, { donation_id: otherDonationId }), `/donations/record/${donationId}`);

assert.equal(dest('/bookings', { bookingId: ['not-a-string'] }), '/bookings');
assert.equal(dest('/bookings', { booking_id: 42 }), '/bookings');
assert.equal(dest(null, { donation_id: '' }), null);
assert.equal(dest('/wildlife/rhino', { bookingId }), '/wildlife/rhino');
assert.equal(dest('/wildlife/rhino', { booking_id: otherBookingId }), '/wildlife/rhino');
assert.equal(dest('/events/lewa-safari-marathon', { donationId }), '/events/lewa-safari-marathon');
assert.equal(dest('/events/lewa-safari-marathon', { donation_id: donationId, paymentId }), '/events/lewa-safari-marathon');

assert.deepEqual(dest(null, { paymentId }), { paymentId });
assert.deepEqual(dest(null, { payment_id: paymentId }), { paymentId });
assert.deepEqual(dest('/bookings', { paymentId }), { paymentId });
assert.deepEqual(dest('/(tabs)/bookings', { payment_id: paymentId }), { paymentId });
assert.deepEqual(dest('/booking/status', { paymentId }), { paymentId });
assert.deepEqual(dest('/donations/history', { payment_id: paymentId }), { paymentId });
assert.equal(dest('/bookings', { bookingId, paymentId }), `/bookings/${bookingId}`);
assert.equal(dest('/donations/history', { donation_id: donationId, paymentId }), `/donations/record/${donationId}`);
assert.equal(dest('/wildlife/rhino', { paymentId }), '/wildlife/rhino');
assert.equal(dest(null, { paymentId: 12 }), null);
assert.equal(dest('/bookings', { payment_id: ['nope'] }), '/bookings');

console.log('notification destination tests passed');
