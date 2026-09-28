-- The original database enum used `succeeded`. The app and Paystack
-- verifier use `success`, plus `processing` while checkout is open.
alter type public.donation_status add value if not exists 'processing';
alter type public.donation_status add value if not exists 'success';
alter type public.donation_status add value if not exists 'cancelled';

-- donations.payment_id lived only in the removed duplicate schema.
-- Checkout writes it after the payments row exists.
alter table public.donations
  add column if not exists payment_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'donations_payment_id_fkey'
      and conrelid = 'public.donations'::regclass
  ) then
    alter table public.donations
      add constraint donations_payment_id_fkey
      foreign key (payment_id) references public.payments (id) on delete set null;
  end if;
end $$;
