-- Lewa Wildlife Conservancy — foundation schema
-- Enables required extensions, defines role/status enums, creates profiles
-- linked to auth.users with an insert trigger, and adds role-check helpers
-- used by RLS across the rest of the schema.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'visitor',
      'donor',
      'researcher',
      'community_member',
      'staff',
      'administrator',
      'super_admin'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'suspended', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum (
      'draft',
      'pending_payment',
      'payment_verification',
      'confirmed',
      'pending_review',
      'cancelled',
      'completed',
      'refunded'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending',
      'processing',
      'success',
      'failed',
      'cancelled',
      'refunded'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_purpose') then
    create type public.payment_purpose as enum ('booking', 'donation');
  end if;

  if not exists (select 1 from pg_type where typname = 'donation_status') then
    create type public.donation_status as enum ('pending', 'succeeded', 'failed', 'refunded');
  end if;

  if not exists (select 1 from pg_type where typname = 'event_registration_status') then
    create type public.event_registration_status as enum ('registered', 'cancelled', 'attended', 'waitlisted');
  end if;

  if not exists (select 1 from pg_type where typname = 'feedback_status') then
    create type public.feedback_status as enum ('open', 'in_progress', 'resolved', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'wildlife_sighting',
      'conservation_announcement',
      'event_reminder',
      'booking_status',
      'payment_confirmation',
      'donation_confirmation',
      'general_announcement'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'announcement_tone') then
    create type public.announcement_tone as enum ('default', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'tourism_pricing_unit') then
    create type public.tourism_pricing_unit as enum ('per_guest', 'per_booking');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email citext,
  phone text,
  avatar_url text,
  role public.user_role not null default 'visitor',
  status public.account_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);

-- Shared updated_at trigger factory
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.tg_set_updated_at();

-- Auto-provision a profile when a new auth user signs up so RLS + FK lookups
-- always find a row for the caller.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Role helpers used by RLS everywhere. security definer so anon RLS can still
-- consult them without recursive policy evaluation on profiles.
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('staff','administrator','super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('administrator','super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'super_admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.current_user_role() to authenticated, anon;
grant execute on function public.is_staff() to authenticated, anon;
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.is_super_admin() to authenticated, anon;

-- profile RLS
alter table public.profiles enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select
  using (auth.uid() = id or public.is_staff());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- users cannot elevate their own role or lock themselves out
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert
  with check (public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete
  using (public.is_super_admin());
