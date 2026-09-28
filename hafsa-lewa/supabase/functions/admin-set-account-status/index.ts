import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STATUSES = ['active', 'suspended', 'archived'] as const;
type AccountStatus = (typeof STATUSES)[number];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Sign in required' }, 401);

    const { data: caller } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', userData.user.id)
      .single();
    const callerIsAdmin =
      caller?.status === 'active' &&
      (caller.role === 'administrator' || caller.role === 'super_admin');
    if (!callerIsAdmin) return json({ error: 'Administrator only' }, 403);

    const body = (await req.json()) as { userId?: string; status?: string };
    const userId = body.userId?.trim() ?? '';
    const status = body.status as AccountStatus;
    if (!userId || !STATUSES.includes(status)) {
      return json({ error: 'userId and a valid status are required' }, 400);
    }
    if (userId === userData.user.id && status !== 'active') {
      return json({ error: 'You cannot suspend your own account' }, 400);
    }

    const { data: target, error: targetErr } = await admin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (targetErr) return json({ error: targetErr.message }, 500);
    if (!target) return json({ error: 'User not found' }, 404);

    const { error: updateErr } = await admin.from('profiles').update({ status }).eq('id', userId);
    if (updateErr) return json({ error: updateErr.message }, 500);

    if (status === 'suspended' || status === 'archived') {
      const { error: banErr } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h',
      });
      if (banErr) return json({ error: banErr.message }, 500);
      await revokeSessions(supabaseUrl, serviceKey, userId);
    } else {
      const { error: unbanErr } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });
      if (unbanErr) return json({ error: unbanErr.message }, 500);
    }

    await admin.from('audit_logs').insert({
      actor_user_id: userData.user.id,
      action: 'update',
      entity_type: 'profiles',
      entity_id: userId,
      metadata: { status },
    });

    return json({ ok: true, status });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});

async function revokeSessions(supabaseUrl: string, serviceKey: string, userId: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}/sessions`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
  });
  if (response.ok || response.status === 404) return;
  const text = await response.text();
  throw new Error(text || 'Could not sign the user out');
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
