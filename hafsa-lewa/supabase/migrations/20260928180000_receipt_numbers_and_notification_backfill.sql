-- Stable receipt numbers for successful payments, and notification links that
-- already name a booking or donation. No receipts table: payments.receipt_number
-- is the receipt. Broadcast announcements with no record id are left alone.

-- Service role (the Paystack edge functions) bypasses RLS and can update
-- payments. SECURITY INVOKER keeps that boundary: the function does not run as
-- the owner, and anon/authenticated cannot execute it. A definer function is
-- not required and would bypass RLS if a grant were ever widened.
create or replace function public.assign_receipt_number(p_payment_id uuid)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_number text;
  v_existing text;
begin
  select *
    into v_payment
    from public.payments
    where id = p_payment_id
    for update;

  if not found then
    raise exception 'Payment not found';
  end if;

  -- A second call returns the number already stored. Later status changes
  -- (refund, cancel) do not mint a new one.
  if v_payment.receipt_number is not null and btrim(v_payment.receipt_number) <> '' then
    return v_payment.receipt_number;
  end if;

  if v_payment.status is distinct from 'success' then
    raise exception 'Receipt number requires a successful payment';
  end if;

  -- RCP-YYYYMMDD- plus the first 6 hex chars of the payment id. The date is
  -- the Nairobi calendar day of paid_at, so a retry cannot change the number.
  -- No random suffix: the unique index on payments.receipt_number rejects a
  -- collision instead of inventing another value.
  v_number := 'RCP-'
    || to_char(
      (coalesce(v_payment.paid_at, v_payment.created_at, now()) at time zone 'Africa/Nairobi'),
      'YYYYMMDD'
    )
    || '-'
    || upper(substr(replace(v_payment.id::text, '-', ''), 1, 6));

  update public.payments
    set receipt_number = v_number
    where id = v_payment.id
      and receipt_number is null
      and status = 'success';

  if not found then
    select receipt_number
      into v_existing
      from public.payments
      where id = v_payment.id;
    if v_existing is null or btrim(v_existing) = '' then
      raise exception 'Receipt number was not stored';
    end if;
    return v_existing;
  end if;

  return v_number;
end;
$$;

revoke all on function public.assign_receipt_number(uuid) from public;
revoke all on function public.assign_receipt_number(uuid) from anon;
revoke all on function public.assign_receipt_number(uuid) from authenticated;
grant execute on function public.assign_receipt_number(uuid) to service_role;

-- Links that already carry a booking or donation id get that id in data and a
-- canonical deep_link. Announcements with no record id are not matched.
with extracted as (
  select
    n.id,
    lower(
      coalesce(
        substring(n.deep_link from '/bookings/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'),
        substring(n.deep_link from 'bookingId=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')
      )
    ) as booking_id,
    lower(
      coalesce(
        substring(n.deep_link from '/donations/record/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'),
        substring(n.deep_link from 'donationId=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')
      )
    ) as donation_id
  from public.notifications n
  where n.deep_link is not null
)
update public.notifications n
set
  data = coalesce(n.data, '{}'::jsonb) || jsonb_strip_nulls(
    jsonb_build_object('bookingId', e.booking_id, 'donationId', e.donation_id)
  ),
  deep_link = case
    when e.booking_id is not null then '/bookings/' || e.booking_id
    else '/donations/record/' || e.donation_id
  end
from extracted e
where n.id = e.id
  and (e.booking_id is not null or e.donation_id is not null);
