import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getPaystackSecret } from '../_shared/paystack-secret.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Body =
  | { purpose: 'booking'; bookingId: string; email: string }
  | { purpose: 'donation'; donationId: string; email: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: 'Sign in required' }, 401);
    }

    const body = (await req.json()) as Body;
    const secret = await getPaystackSecret(admin);
    if (!secret) return json({ error: 'PAYSTACK_SECRET_KEY is not configured' }, 500);

    let amount = 0;
    let currency = 'KES';
    let bookingId: string | null = null;
    let donationId: string | null = null;
    const email = body.email || userData.user.email;
    if (!email) return json({ error: 'Email is required for payment' }, 400);

    if (body.purpose === 'booking') {
      const { data: booking, error } = await admin
        .from('bookings')
        .select('id, user_id, service_id, guests, amount, currency, status')
        .eq('id', body.bookingId)
        .single();
      if (error || !booking) return json({ error: 'Booking not found' }, 404);
      if (booking.user_id !== userData.user.id) return json({ error: 'Forbidden' }, 403);

      const { data: service } = await admin
        .from('tourism_services')
        .select('price, currency, pricing_unit')
        .eq('id', booking.service_id)
        .single();
      if (!service) return json({ error: 'Service not found' }, 404);
      amount = service.pricing_unit === 'per_guest' ? Number(service.price) * booking.guests : Number(service.price);
      currency = service.currency ?? 'KES';
      bookingId = booking.id;
      await admin.from('bookings').update({ amount, currency, status: 'pending_payment', payment_status: 'pending' }).eq('id', booking.id);
    } else {
      const { data: donation, error } = await admin
        .from('donations')
        .select('id, user_id, amount, currency, status')
        .eq('id', body.donationId)
        .single();
      if (error || !donation) return json({ error: 'Donation not found' }, 404);
      if (donation.user_id && donation.user_id !== userData.user.id) return json({ error: 'Forbidden' }, 403);
      amount = Number(donation.amount);
      currency = donation.currency ?? 'KES';
      donationId = donation.id;
    }

    if (amount <= 0) return json({ error: 'Invalid amount' }, 400);
    const amountMinor = Math.round(amount * 100);
    const reference = `LWC-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountMinor,
        currency,
        reference,
        callback_url: 'hafsalewa://paystack-callback',
        metadata: { purpose: body.purpose, bookingId, donationId, userId: userData.user.id },
      }),
    });
    const initJson = await initRes.json();
    if (!initRes.ok || !initJson.status) {
      return json({ error: initJson.message ?? 'Paystack initialize failed' }, 502);
    }

    const { data: payment, error: payErr } = await admin
      .from('payments')
      .insert({
        user_id: userData.user.id,
        booking_id: bookingId,
        donation_id: donationId,
        purpose: body.purpose,
        provider: 'paystack',
        reference,
        access_code: initJson.data.access_code,
        authorization_url: initJson.data.authorization_url,
        amount,
        amount_minor: amountMinor,
        currency,
        status: 'pending',
      })
      .select('id')
      .single();
    if (payErr) return json({ error: payErr.message }, 500);

    if (donationId) {
      await admin.from('donations').update({ payment_id: payment.id, status: 'processing' }).eq('id', donationId);
    }
    if (bookingId) {
      await admin.from('bookings').update({ payment_status: 'processing', status: 'payment_verification' }).eq('id', bookingId);
    }

    return json({
      paymentId: payment.id,
      reference,
      authorizationUrl: initJson.data.authorization_url,
      accessCode: initJson.data.access_code,
      amount,
      currency,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
