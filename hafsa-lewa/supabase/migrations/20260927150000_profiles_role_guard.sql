-- Only a signed-in super admin, or the service role (Edge Functions), may change profiles.role.
create or replace function public.profiles_guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.role(), '') is distinct from 'service_role'
       and not public.is_super_admin() then
      raise exception 'Only a super admin can change roles';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
  before update of role on public.profiles
  for each row
  execute function public.profiles_guard_role_change();
