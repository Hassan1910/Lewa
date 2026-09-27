import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { applyVerifiedPayment } from '../_shared/apply-payment.ts';
import { getPaystackSecret } from '../_shared/paystack-secret.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

async function hmacSha512Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
  const secret = (await getPaystackSecret(admin)) ?? '';
  const raw = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';
  const expected = await hmacSha512Hex(secret, raw);
  if (!secret || signature !== expected) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: cors });
  }

  const event = JSON.parse(raw) as { event?: string; data?: { reference?: string; status?: string } };
  if (event.event !== 'charge.success' && event.event !== 'charge.failed') {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const reference = event.data?.reference;
  if (!reference) return new Response(JSON.stringify({ error: 'Missing reference' }), { status: 400, headers: cors });

  const status = await applyVerifiedPayment(admin as never, {
    reference,
    success: event.event === 'charge.success' || event.data?.status === 'success',
    providerSummary: event.data ?? {},
  });

  return new Response(JSON.stringify({ ok: true, status }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
