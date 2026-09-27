import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getPaystackSecret } from '../_shared/paystack-secret.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return json({ error: 'Sign in required' }, 401);

    const { reference } = (await req.json()) as { reference?: string };
    if (!reference) return json({ error: 'reference required' }, 400);

    const secret = await getPaystackSecret(admin);
    if (!secret) return json({ error: 'PAYSTACK_SECRET_KEY is not configured' }, 500);

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const payload = await res.json();
    const success = payload?.data?.status === 'success';
    const { applyVerifiedPayment } = await import('../_shared/apply-payment.ts');
    const status = await applyVerifiedPayment(admin, {
      reference,
      success,
      providerSummary: payload?.data ?? payload,
    });
    return json({ status });
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
