-- Lewa Wildlife Conservancy — core schema
-- Monetary columns default to KES. Client-supplied amounts are overwritten
-- from trusted catalogue rows before persist.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum (
    'visitor', 'donor', 'researcher', 'community_member',
    'staff', 'administrator', 'super_admin'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.profile_status as enum ('active', 'suspended', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'draft', 'pending_payment', 'payment_verification',
    'confirmed', 'pending_review', 'cancelled', 'completed', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.donation_status as enum (
    'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tourism_pricing_unit as enum ('per_guest', 'per_booking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_type as enum (
    'wildlife_sighting', 'conservation_announcement', 'event_reminder',
    'booking_status', 'payment_confirmation', 'donation_confirmation',
    'general_announcement'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'visitor',
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table if not exists public.wildlife_species (
  id text primary key,
  name text not null,
  scientific_name text,
  category text not null default 'Mammals',
  conservation_status text,
  description text,
  habitat text,
  behavior text,
  facts text[] not null default '{}',
  image_url text,
  hero_image_url text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wildlife_images (
  id uuid primary key default gen_random_uuid(),
  species_id text not null references public.wildlife_species (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0
);

create table if not exists public.conservation_programs (
  id text primary key,
  title text not null,
  summary text,
  description text,
  category text,
  cover_image text,
  status text not null default 'published',
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tourism_services (
  id text primary key,
  title text not null,
  category text not null,
  service_type text,
  summary text,
  description text,
  highlights text[] not null default '{}',
  includes text[] not null default '{}',
  meeting_point text,
  duration_label text,
  capacity int not null default 1 check (capacity > 0),
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'KES',
  pricing_unit public.tourism_pricing_unit not null default 'per_guest',
  image_url text,
  hero_image_url text,
  featured boolean not null default false,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_availability (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.tourism_services (id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  capacity int not null,
  remaining_capacity int not null,
  status text not null default 'open',
  unique (service_id, date)
);

create table if not exists public.donation_campaigns (
  id text primary key,
  title text not null,
  summary text,
  description text,
  story_paragraphs text[] not null default '{}',
  impact jsonb not null default '[]'::jsonb,
  suggested_amounts numeric[] not null default '{}',
  goal_amount numeric(14, 2) not null default 0,
  amount_raised numeric(14, 2) not null default 0,
  currency text not null default 'KES',
  cover_image text,
  active boolean not null default true,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  description text,
  event_type text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  organiser text,
  capacity int,
  registration_required boolean not null default false,
  image_url text,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education_resources (
  id text primary key,
  title text not null,
  summary text,
  content text,
  category text,
  cover_image text,
  reading_minutes int,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_programs (
  id text primary key,
  title text not null,
  summary text,
  description text,
  location text,
  cover_image text,
  status text not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  published boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null,
  type text not null default 'general',
  tone text not null default 'default' check (tone in ('default', 'urgent')),
  priority int not null default 0,
  published boolean not null default true,
  publish_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.about_content (
  key text primary key,
  title text not null,
  body text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- User-owned transactional tables
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  service_id text not null references public.tourism_services (id),
  service_title text not null,
  image_url text,
  booking_date timestamptz not null,
  guests int not null check (guests > 0),
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'KES',
  status public.booking_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_guests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  country text,
  is_lead boolean not null default false
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.donation_campaigns (id),
  user_id uuid references auth.users (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'KES',
  payment_id uuid,
  status public.donation_status not null default 'pending',
  donor_email text,
  donor_name text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  donation_id uuid references public.donations (id) on delete set null,
  provider text not null default 'paystack',
  reference text not null unique,
  amount numeric(12, 2) not null,
  currency text not null default 'KES',
  status public.payment_status not null default 'pending',
  access_code text,
  authorization_url text,
  paid_at timestamptz,
  provider_response_summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations
  drop constraint if exists donations_payment_id_fkey;
alter table public.donations
  add constraint donations_payment_id_fkey
  foreign key (payment_id) references public.payments (id) on delete set null;

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  type public.notification_type not null default 'general_announcement',
  data jsonb not null default '{}'::jsonb,
  deep_link text,
  broadcast boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  wildlife_sightings boolean not null default true,
  booking_updates boolean not null default true,
  event_reminders boolean not null default true,
  donation_receipts boolean not null default true,
  conservation_news boolean not null default true
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  category text not null,
  subject text not null,
  message text not null,
  reference text,
  rating int,
  status text not null default 'open',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  platform text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists bookings_user_idx on public.bookings (user_id, booking_date desc);
create index if not exists payments_user_idx on public.payments (user_id, created_at desc);
create index if not exists donations_user_idx on public.donations (user_id, created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_broadcast_idx on public.notifications (broadcast, created_at desc);
create index if not exists events_start_idx on public.events (start_at);

-- ---------------------------------------------------------------------------
-- Updated-at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: create profile + prefs on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'guest'), '@', 1)),
    new.email,
    'visitor',
    'active'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Trusted booking amount (never trust the client)
-- ---------------------------------------------------------------------------
create or replace function public.bookings_set_trusted_amount()
returns trigger
language plpgsql
as $$
declare
  svc public.tourism_services%rowtype;
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
  return new;
end;
$$;

drop trigger if exists bookings_trusted_amount on public.bookings;
create trigger bookings_trusted_amount
  before insert on public.bookings
  for each row execute function public.bookings_set_trusted_amount();

-- ---------------------------------------------------------------------------
-- Role helpers (security definer so RLS can call them)
-- ---------------------------------------------------------------------------
create or replace function public.current_profile_role()
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
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
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
    select 1 from public.profiles
    where id = auth.uid()
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
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Audit helper
-- ---------------------------------------------------------------------------
create or replace function public.write_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(new.id::text, old.id::text),
    jsonb_build_object('op', tg_op)
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists wildlife_audit on public.wildlife_species;
create trigger wildlife_audit after insert or update or delete on public.wildlife_species
  for each row execute function public.write_audit();

drop trigger if exists tourism_audit on public.tourism_services;
create trigger tourism_audit after insert or update or delete on public.tourism_services
  for each row execute function public.write_audit();

drop trigger if exists bookings_audit on public.bookings;
create trigger bookings_audit after insert or update or delete on public.bookings
  for each row execute function public.write_audit();

drop trigger if exists donations_audit on public.donations;
create trigger donations_audit after insert or update or delete on public.donations
  for each row execute function public.write_audit();

drop trigger if exists payments_audit on public.payments;
create trigger payments_audit after insert or update or delete on public.payments
  for each row execute function public.write_audit();
