-- Suspended and archived accounts cannot write visitor records.
-- Booking dates with no open availability row are rejected.
-- Published tourism services are given open dates through 90 days from today.

create or replace function public.caller_account_is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when (select auth.uid()) is null then true
    else coalesce(
      (
        select p.status = 'active'
        from public.profiles p
        where p.id = (select auth.uid())
      ),
      false
    )
  end;
$$;

revoke all on function public.caller_account_is_active() from public;
revoke all on function public.caller_account_is_active() from anon, authenticated;
grant execute on function public.caller_account_is_active() to anon, authenticated;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and status = 'active'
      and role in ('staff', 'administrator', 'super_admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and status = 'active'
      and role in ('administrator', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and status = 'active'
      and role = 'super_admin'
  );
$$;

-- Visitor inserts only. Select policies and owner/staff update policies stay as they are.
drop policy if exists bookings_owner_insert on public.bookings;
create policy bookings_owner_insert on public.bookings
  for insert
  with check (
    user_id = (select auth.uid())
    and public.caller_account_is_active()
  );

drop policy if exists donations_owner_insert on public.donations;
create policy donations_owner_insert on public.donations
  for insert
  with check (
    (user_id = (select auth.uid()) or user_id is null)
    and public.caller_account_is_active()
  );

drop policy if exists feedback_owner_insert on public.feedback;
create policy feedback_owner_insert on public.feedback
  for insert
  with check (
    (user_id = (select auth.uid()) or user_id is null)
    and public.caller_account_is_active()
  );

drop policy if exists event_registrations_owner_insert on public.event_registrations;
create policy event_registrations_owner_insert on public.event_registrations
  for insert
  with check (
    user_id = (select auth.uid())
    and public.caller_account_is_active()
  );

create or replace function public.profiles_sync_auth_ban()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status in ('suspended', 'archived') then
    update auth.users
      set banned_until = now() + interval '100 years'
      where id = new.id;
    delete from auth.sessions
      where user_id = new.id;
  elsif new.status = 'active' then
    update auth.users
      set banned_until = null
      where id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function public.profiles_sync_auth_ban() from public;
revoke all on function public.profiles_sync_auth_ban() from anon, authenticated;

drop trigger if exists profiles_sync_auth_ban on public.profiles;
create trigger profiles_sync_auth_ban
  after update of status on public.profiles
  for each row
  execute function public.profiles_sync_auth_ban();

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
  if not found then
    raise exception 'This date is not open for booking';
  end if;
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

  return new;
end;
$$;

insert into public.service_availability (service_id, date, capacity, remaining_capacity, status)
select
  s.id,
  gs.day::date,
  s.capacity,
  s.capacity,
  'open'
from public.tourism_services s
cross join lateral (
  select coalesce(max(a.date) + 1, current_date) as start_on
  from public.service_availability a
  where a.service_id = s.id
) bounds
cross join lateral generate_series(
  bounds.start_on,
  current_date + 90,
  interval '1 day'
) as gs(day)
where s.status = 'published'
  and not exists (
    select 1
    from public.service_availability existing
    where existing.service_id = s.id
      and existing.date = gs.day::date
      and existing.start_time is null
  );
