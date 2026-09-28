-- Reject a registration that would put registered or attended rows
-- over events.capacity. A null capacity stays unlimited. The same
-- person can still update their own seat-holding row.
-- SECURITY DEFINER is required so the count sees every registration;
-- visitors cannot read other people's rows under RLS.

create or replace function public.event_registrations_enforce_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap integer;
  taken integer;
  holding public.event_registration_status[] := array['registered', 'attended']::public.event_registration_status[];
begin
  if new.status <> all (holding) then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and old.event_id = new.event_id
     and old.status = any (holding) then
    return new;
  end if;

  select capacity
    into cap
    from public.events
    where id = new.event_id
    for update;

  if not found then
    raise exception 'Event not found';
  end if;
  if cap is null then
    return new;
  end if;

  select count(*)::integer
    into taken
    from public.event_registrations
    where event_id = new.event_id
      and status = any (holding)
      and id is distinct from new.id;

  if taken >= cap then
    raise exception 'This event is full';
  end if;

  return new;
end;
$$;

revoke all on function public.event_registrations_enforce_capacity() from public;
revoke all on function public.event_registrations_enforce_capacity() from anon, authenticated;

drop trigger if exists event_registrations_enforce_capacity on public.event_registrations;
create trigger event_registrations_enforce_capacity
  before insert or update of status, event_id on public.event_registrations
  for each row
  execute function public.event_registrations_enforce_capacity();
