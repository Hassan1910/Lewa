-- Stable receipt numbers for successful Paystack charges, human donation
-- references, and booking-cancel alerts that open the specific reservation.

alter table public.payments
  add column if not exists receipt_number text;

update public.payments
set receipt_number = 'RCP-'
  || to_char(coalesce(paid_at, created_at) at time zone 'Africa/Nairobi', 'YYYYMMDD')
  || '-'
  || upper(substr(replace(id::text, '-', ''), 1, 6))
where status = 'success'
  and receipt_number is null;

create unique index if not exists payments_receipt_number_key
  on public.payments (receipt_number);

alter table public.donations
  add column if not exists reference text;

update public.donations
set reference = 'DN-' || upper(substr(replace(id::text, '-', ''), 1, 12))
where reference is null;

alter table public.donations
  alter column reference set not null;

create unique index if not exists donations_reference_key
  on public.donations (reference);

create or replace function public.cancel_my_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  select * into b from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'Booking not found';
  end if;
  if b.user_id is distinct from auth.uid() then
    raise exception 'Forbidden';
  end if;
  if b.status not in ('pending_payment', 'payment_verification', 'confirmed') then
    raise exception 'This booking cannot be cancelled';
  end if;

  update public.bookings
    set status = 'cancelled',
        updated_at = now()
    where id = b.id;

  insert into public.notifications (user_id, title, body, type, data, deep_link, broadcast)
  values (
    b.user_id,
    'Booking cancelled',
    'Reservation ' || b.reference || ' was cancelled.',
    'booking_status',
    jsonb_build_object('bookingId', b.id),
    '/bookings/' || b.id::text,
    false
  );
end;
$$;

revoke all on function public.cancel_my_booking(uuid) from public;
revoke all on function public.cancel_my_booking(uuid) from anon;
grant execute on function public.cancel_my_booking(uuid) to authenticated;
