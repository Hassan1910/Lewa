type RpcClient = {
  rpc: (fn: string) => Promise<{ data: unknown; error: { message: string } | null }>;
};

/**
 * Prefer the Edge Function secret. Fall back to Vault so checkout still works
 * when PAYSTACK_SECRET_KEY was stored with SQL instead of `supabase secrets set`.
 */
export async function getPaystackSecret(admin?: RpcClient): Promise<string | null> {
  const fromEnv = Deno.env.get('PAYSTACK_SECRET_KEY')?.trim();
  if (fromEnv) return fromEnv;
  if (!admin) return null;
  const { data, error } = await admin.rpc('internal_paystack_secret');
  if (error || typeof data !== 'string' || !data.trim()) return null;
  return data.trim();
}
