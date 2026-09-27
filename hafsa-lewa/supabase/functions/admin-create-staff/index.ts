import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ROLES = ['staff', 'administrator'] as const;
type StaffRole = (typeof ALLOWED_ROLES)[number];

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
    if (userErr || !userData.user) return json({ error: 'Sign in required' }, 401);

    const { data: caller } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', userData.user.id)
      .single();
    if (caller?.role !== 'super_admin' || caller.status !== 'active') {
      return json({ error: 'Super admin only' }, 403);
    }

    const body = (await req.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      role?: string;
    };
    const fullName = body.fullName?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    const role = body.role as StaffRole;

    if (!fullName || !email || !email.includes('@')) return json({ error: 'Name and email are required' }, 400);
    if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
    if (!ALLOWED_ROLES.includes(role)) return json({ error: 'Role must be staff or administrator' }, 400);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr || !created.user) return json({ error: createErr?.message ?? 'Could not create user' }, 400);

    const { error: roleErr } = await admin
      .from('profiles')
      .update({ role, full_name: fullName, email, status: 'active' })
      .eq('id', created.user.id);
    if (roleErr) return json({ error: roleErr.message }, 500);

    await admin.from('audit_logs').insert({
      actor_user_id: userData.user.id,
      action: 'create',
      entity_type: 'profiles',
      entity_id: created.user.id,
      metadata: { email, role },
    });

    return json({ id: created.user.id, email, role });
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
