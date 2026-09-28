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
      if (!(await bookingCanStartCheckout(admin, booking))) {
        return json({ error: 'This booking is not awaiting payment' }, 409);
      }

      const { data: service } = await admin
        .from('tourism_services')
        .select('price, currency, pricing_unit')
        .eq('id', booking.service_id)
        .single();
      if (!service) return json({ error: 'Service not found' }, 404);
      amount = service.pricing_unit === 'per_guest' ? Number(service.price) * booking.guests : Number(service.price);
      currency = service.currency ?? 'KES';
      bookingId = booking.id;
    } else {
      const { data: donation, error } = await admin
        .from('donations')
        .select('id, user_id, amount, currency, status')
        .eq('id', body.donationId)
        .single();
      if (error || !donation) return json({ error: 'Donation not found' }, 404);
      if (donation.user_id && donation.user_id !== userData.user.id) return json({ error: 'Forbidden' }, 403);
      if (donation.status !== 'pending' && donation.status !== 'failed') {
        return json({ error: 'This donation is not awaiting payment' }, 409);
      }
      amount = Number(donation.amount);
      currency = donation.currency ?? 'KES';
      if (currency === 'KES' && amount < 100) return json({ error: 'Minimum gift is KSh 100' }, 400);
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
        callback_url: 'https://standard.paystack.co/close',
        metadata: {
          purpose: body.purpose,
          bookingId,
          donationId,
          userId: userData.user.id,
          cancel_action: 'https://standard.paystack.co/cancel',
        },
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
      const { data: moved, error: moveErr } = await admin
        .from('donations')
        .update({ payment_id: payment.id, status: 'processing' })
        .eq('id', donationId)
        .in('status', ['pending', 'failed'])
        .select('id');
      if (moveErr) return json({ error: moveErr.message }, 500);
      if (!moved?.length) {
        await admin.from('payments').update({ status: 'cancelled' }).eq('id', payment.id);
        return json({ error: 'This donation is not awaiting payment' }, 409);
      }
    }
    if (bookingId) {
      const { data: moved, error: moveErr } = await admin
        .from('bookings')
        .update({ amount, currency, payment_status: 'processing', status: 'payment_verification' })
        .eq('id', bookingId)
        .in('status', ['pending_payment', 'payment_verification'])
        .select('id');
      if (moveErr) return json({ error: moveErr.message }, 500);
      if (!moved?.length) {
        await admin.from('payments').update({ status: 'cancelled' }).eq('id', payment.id);
        return json({ error: 'This booking is not awaiting payment' }, 409);
      }
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

async function bookingCanStartCheckout(
  admin: {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => {
            limit: (n: number) => {
              maybeSingle: () => Promise<{ data: { status?: string; provider_response_summary?: unknown } | null; error: { message: string } | null }>;
            };
          };
        };
      };
    };
  },
  booking: { id: string; status?: string },
): Promise<boolean> {
  if (booking.status === 'pending_payment') return true;
  if (booking.status !== 'payment_verification') return false;

  const { data: latest, error } = await admin
    .from('payments')
    .select('status, provider_response_summary')
    .eq('booking_id', booking.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!latest) return false;
  const status = String(latest.status ?? '');
  if (status === 'failed' || status === 'abandoned') return true;
  const summary = latest.provider_response_summary;
  const providerStatus = summary && typeof summary === 'object'
    ? String((summary as { status?: unknown }).status ?? '')
    : '';
  return providerStatus === 'failed' || providerStatus === 'abandoned';
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
