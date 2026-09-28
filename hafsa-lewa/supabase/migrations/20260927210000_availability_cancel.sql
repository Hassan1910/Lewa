-- Open dates for the next 21 days, drawn from each service's capacity.
-- Holds a seat when a booking is created and returns it when the booking is cancelled.

insert into public.service_availability (service_id, date, capacity, remaining_capacity, status)
select s.id, d::date, s.capacity, s.capacity, 'open'
from public.tourism_services s
cross join generate_series(current_date + 1, current_date + 21, interval '1 day') as d
where s.status = 'published'
  and not exists (
    select 1
    from public.service_availability a
    where a.service_id = s.id
      and a.date = d::date
      and a.start_time is null
  );

create or replace function public.bookings_set_trusted_amount()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  svc public.tourism_services%rowtype;
  avail public.service_availability%rowtype;
  book_date date;
begin
  select * into svc from public.tourism_services where id = new.service_id;
  if not found then
    raise exception 'Unknown tourism service';
  end if;
  if new.guests > svc.capacity then
    raise exception 'Guest count exceeds service capacity';
  end if;
  new.amount := case
    when svc.pricing_unit = 'per_guest' then svc.price * new.guests
    else svc.price
  end;
  new.currency := svc.currency;
  new.service_title := svc.title;
  if new.image_url is null then
    new.image_url := svc.image_url;
  end if;

  book_date := (new.booking_date at time zone 'Africa/Nairobi')::date;
  select *
    into avail
    from public.service_availability
    where service_id = new.service_id
      and date = book_date
      and start_time is null
    order by remaining_capacity desc
    limit 1
    for update;
  if found then
    if avail.status <> 'open' or avail.remaining_capacity < new.guests then
      raise exception 'This date is fully booked';
    end if;
    update public.service_availability
      set remaining_capacity = avail.remaining_capacity - new.guests,
          status = case
            when avail.remaining_capacity - new.guests <= 0 then 'closed'
            else 'open'
          end
      where id = avail.id;
  end if;

  return new;
end;
$$;

-- The insert trigger lived only in the removed duplicate schema.
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'bookings_trusted_amount'
      and tgrelid = 'public.bookings'::regclass
      and not tgisinternal
  ) then
    create trigger bookings_trusted_amount
      before insert on public.bookings
      for each row execute function public.bookings_set_trusted_amount();
  end if;
end $$;

create or replace function public.bookings_restore_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  book_date date;
begin
  if old.status is distinct from 'cancelled' and new.status = 'cancelled' then
    book_date := (new.booking_date at time zone 'Africa/Nairobi')::date;
    update public.service_availability
      set remaining_capacity = least(capacity, remaining_capacity + new.guests),
          status = 'open'
      where service_id = new.service_id
        and date = book_date
        and start_time is null;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_restore_capacity on public.bookings;
create trigger bookings_restore_capacity
  before update on public.bookings
  for each row execute function public.bookings_restore_capacity();

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

  insert into public.notifications (user_id, title, body, type, deep_link, broadcast)
  values (
    b.user_id,
    'Booking cancelled',
    'Reservation ' || b.reference || ' was cancelled.',
    'booking_status',
    '/booking/status?bookingId=' || b.id::text,
    false
  );
end;
$$;

revoke all on function public.cancel_my_booking(uuid) from public;
revoke all on function public.cancel_my_booking(uuid) from anon;
grant execute on function public.cancel_my_booking(uuid) to authenticated;
