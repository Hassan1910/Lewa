import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
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

  const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
  if (!['staff', 'administrator', 'super_admin'].includes(profile?.role ?? '')) {
    return json({ error: 'Staff only' }, 403);
  }

  const body = (await req.json()) as { title?: string; message?: string; deepLink?: string; userId?: string };
  if (!body.title || !body.message) return json({ error: 'title and message required' }, 400);

  const { error } = await admin.from('notifications').insert({
    user_id: body.userId ?? null,
    title: body.title,
    body: body.message,
    type: 'general_announcement',
    deep_link: body.deepLink ?? '/',
    broadcast: !body.userId,
  });
  if (error) return json({ error: error.message }, 500);
  await admin.from('audit_logs').insert({
    actor_user_id: userData.user.id,
    action: 'create',
    entity_type: 'notifications',
    entity_id: null,
    metadata: { title: body.title, broadcast: !body.userId },
  });
  return json({ ok: true });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
