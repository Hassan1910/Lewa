-- Payment integrity: staff cannot write payments, owners cannot move booking
-- status, settled bookings cannot re-enter the payment funnel, and new
-- donations must be at least 100 KES. Existing donation rows are not rewritten.

-- Staff keep payments_owner_or_staff_read. Service role bypasses RLS.
drop policy if exists payments_staff_write on public.payments;

-- Owners cancel through cancel_my_booking. No direct status or payment_status update.
drop policy if exists bookings_owner_update on public.bookings;

create or replace function public.bookings_guard_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null
     and auth.uid() = old.user_id
     and not coalesce(public.is_staff(), false) then
    if new.payment_status is distinct from old.payment_status then
      raise exception 'Owners cannot change payment status'
        using errcode = '42501';
    end if;
    if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
      raise exception 'Owners cannot confirm a booking'
        using errcode = '42501';
    end if;
    -- cancel_my_booking is the owner cancel path. It sets status to cancelled
    -- and does not change payment_status. Any other owner status write is rejected.
    if new.status is distinct from old.status and new.status is distinct from 'cancelled' then
      raise exception 'Owners cannot change booking status'
        using errcode = '42501';
    end if;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  -- Confirmed, completed, cancelled, and refunded bookings stay out of checkout.
  if old.status in ('confirmed', 'completed', 'cancelled', 'refunded')
     and new.status in ('draft', 'pending_payment', 'payment_verification') then
    raise exception 'Booking status cannot move from % to %', old.status, new.status
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_guard_status_transition on public.bookings;
create trigger bookings_guard_status_transition
  before update on public.bookings
  for each row
  execute function public.bookings_guard_status_transition();

revoke all on function public.bookings_guard_status_transition() from public;
revoke all on function public.bookings_guard_status_transition() from anon;
revoke all on function public.bookings_guard_status_transition() from authenticated;

-- Insert-only so an existing gift under 100 KES is left as it is.
create or replace function public.donations_enforce_minimum()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT'
     and coalesce(new.currency, 'KES') = 'KES'
     and new.amount < 100 then
    raise exception 'Donation amount must be at least 100 KES'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists donations_enforce_minimum on public.donations;
create trigger donations_enforce_minimum
  before insert on public.donations
  for each row
  execute function public.donations_enforce_minimum();

revoke all on function public.donations_enforce_minimum() from public;
revoke all on function public.donations_enforce_minimum() from anon;
revoke all on function public.donations_enforce_minimum() from authenticated;

-- One transaction: lock the payment, accept success only when Paystack's minor
-- units match payments.amount, and add the gift to the campaign once.
create or replace function public.claim_verified_payment(
  p_payment_id uuid,
  p_success boolean,
  p_charged_minor bigint,
  p_paid_at timestamptz,
  p_summary jsonb,
  p_campaign_id text
) returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_expected_minor bigint;
  v_rows integer;
begin
  select *
    into v_payment
    from public.payments
    where id = p_payment_id
    for update;

  if not found then
    return 'failed';
  end if;

  if v_payment.status = 'success' then
    return 'already_success';
  end if;

  if p_success then
    v_expected_minor := round(v_payment.amount * 100)::bigint;
    if p_charged_minor is null
       or p_charged_minor is distinct from v_expected_minor
       or v_payment.amount_minor is distinct from v_expected_minor then
      update public.payments
        set status = 'failed',
            paid_at = null,
            provider_response_summary = coalesce(p_summary, '{}'::jsonb)
        where id = v_payment.id;
      return 'amount_mismatch';
    end if;

    update public.payments
      set status = 'success',
          paid_at = coalesce(p_paid_at, now()),
          provider_response_summary = coalesce(p_summary, '{}'::jsonb)
      where id = v_payment.id
        and status is distinct from 'success';

    if p_campaign_id is not null then
      update public.donation_campaigns
        set amount_raised = amount_raised + v_payment.amount
        where id = p_campaign_id;
      get diagnostics v_rows = row_count;
      if v_rows <> 1 then
        raise exception 'Donation campaign not found';
      end if;
    end if;

    return 'success';
  end if;

  update public.payments
    set status = 'failed',
        paid_at = null,
        provider_response_summary = coalesce(p_summary, '{}'::jsonb)
    where id = v_payment.id
      and status is distinct from 'success';

  return 'failed';
end;
$$;

revoke all on function public.claim_verified_payment(uuid, boolean, bigint, timestamptz, jsonb, text) from public;
revoke all on function public.claim_verified_payment(uuid, boolean, bigint, timestamptz, jsonb, text) from anon;
revoke all on function public.claim_verified_payment(uuid, boolean, bigint, timestamptz, jsonb, text) from authenticated;
grant execute on function public.claim_verified_payment(uuid, boolean, bigint, timestamptz, jsonb, text) to service_role;
