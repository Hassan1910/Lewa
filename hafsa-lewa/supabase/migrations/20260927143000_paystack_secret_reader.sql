-- Service-role-only reader for the Paystack secret stored in Vault.
-- The secret value itself is not in this migration. Edge functions still
-- prefer the PAYSTACK_SECRET_KEY environment secret when it is set.

create or replace function public.internal_paystack_secret()
returns text
language sql
stable
security definer
set search_path = vault, public
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'PAYSTACK_SECRET_KEY'
  limit 1;
$$;

revoke all on function public.internal_paystack_secret() from public;
revoke all on function public.internal_paystack_secret() from anon;
revoke all on function public.internal_paystack_secret() from authenticated;
grant execute on function public.internal_paystack_secret() to service_role;
