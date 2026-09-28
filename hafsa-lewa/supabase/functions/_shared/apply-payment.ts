type Admin = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
        single: () => Promise<{ data: Record<string, unknown> | null }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<unknown>;
    };
    insert: (values: Record<string, unknown>) => Promise<unknown>;
  };
};

export async function applyVerifiedPayment(
  admin: Admin,
  input: { reference: string; success: boolean; providerSummary: unknown },
): Promise<'pending' | 'processing' | 'success' | 'failed'> {
  const { data: payment } = await admin
    .from('payments')
    .select('id, user_id, booking_id, donation_id, amount, currency, status')
    .eq('reference', input.reference)
    .maybeSingle();
  if (!payment) return 'failed';
  if (payment.status === 'success') return 'success';

  const nextStatus = input.success ? 'success' : 'failed';
  await admin.from('payments').update({
    status: nextStatus,
    paid_at: input.success ? new Date().toISOString() : null,
    provider_response_summary: input.providerSummary ?? {},
  }).eq('id', payment.id as string);

  if (!input.success) {
    if (payment.booking_id) {
      await admin.from('bookings').update({
        status: 'pending_payment',
        payment_status: 'failed',
      }).eq('id', payment.booking_id as string);
    }
    if (payment.donation_id) {
      await admin.from('donations').update({ status: 'failed' }).eq('id', payment.donation_id as string);
    }
    return 'failed';
  }

  if (payment.booking_id) {
    const bookingId = payment.booking_id as string;
    await admin.from('bookings').update({
      status: 'confirmed',
      payment_status: 'success',
    }).eq('id', bookingId);
    await admin.from('notifications').insert({
      user_id: payment.user_id,
      title: 'Booking confirmed',
      body: 'Your Lewa booking is confirmed. Paystack verified the payment in Kenyan Shillings.',
      type: 'payment_confirmation',
      deep_link: `/bookings/${bookingId}`,
      data: { bookingId },
      broadcast: false,
    });
  }

  if (payment.donation_id) {
    const { data: donation } = await admin
      .from('donations')
      .select('id, campaign_id, amount')
      .eq('id', payment.donation_id as string)
      .maybeSingle();
    await admin.from('donations').update({ status: 'success', payment_id: payment.id }).eq('id', payment.donation_id as string);
    if (donation?.campaign_id) {
      const { data: campaign } = await admin
        .from('donation_campaigns')
        .select('amount_raised')
        .eq('id', donation.campaign_id as string)
        .maybeSingle();
      const raised = Number(campaign?.amount_raised ?? 0) + Number(donation.amount ?? payment.amount);
      await admin.from('donation_campaigns').update({ amount_raised: raised }).eq('id', donation.campaign_id as string);
    }
    await admin.from('notifications').insert({
      user_id: payment.user_id,
      title: 'Donation received',
      body: 'Thank you. Your gift has been verified and will support conservation at Lewa.',
      type: 'donation_confirmation',
      deep_link: '/donations',
      broadcast: false,
    });
  }

  return 'success';
}
