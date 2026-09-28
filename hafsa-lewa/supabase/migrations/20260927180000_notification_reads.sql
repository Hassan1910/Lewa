-- Per-user read receipts. Broadcast announcements are shared rows, so
-- notifications.read_at cannot record that one account opened them.
create table if not exists public.notification_reads (
  user_id uuid not null references auth.users (id) on delete cascade,
  notification_id uuid not null references public.notifications (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_id)
);

alter table public.notification_reads enable row level security;

drop policy if exists notification_reads_own on public.notification_reads;
create policy notification_reads_own on public.notification_reads
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.notification_reads to authenticated;
grant all on public.notification_reads to service_role;

-- Push tokens lived only in the removed duplicate schema. The app and the
-- push sender upsert this table. Skip policy creation when it already exists.
create table if not exists public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  platform text,
  updated_at timestamptz not null default now()
);

alter table public.device_push_tokens enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'device_push_tokens'
      and policyname = 'device_tokens_own'
  ) then
    create policy device_tokens_own on public.device_push_tokens
      for all
      using (user_id = (select auth.uid()))
      with check (user_id = (select auth.uid()));
  end if;
end $$;

grant select, insert, update, delete on public.device_push_tokens to authenticated;
grant all on public.device_push_tokens to service_role;
