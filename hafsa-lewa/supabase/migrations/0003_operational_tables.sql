-- Operational tables: bookings + guests, donation campaigns + donations,
-- payments, event registrations, notifications, feedback, audit logs.
-- All monetary amounts default to KES.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  service_id text not null references public.tourism_services(id) on delete restrict,
  service_title text not null,
  image_url text,
  booking_date timestamptz not null,
  guests int not null default 1,
  amount numeric(12,2) not null default 0,
  currency text not null default 'KES',
  status public.booking_status not null default 'draft',
  payment_status public.payment_status not null default 'pending',
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_service_id_idx on public.bookings(service_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_booking_date_idx on public.bookings(booking_date);
drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.tg_set_updated_at();

create table if not exists public.booking_guests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  country text,
  is_lead boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists booking_guests_booking_id_idx on public.booking_guests(booking_id);

create table if not exists public.donation_campaigns (
  id text primary key,
  title text not null,
  summary text,
  description text,
  story_paragraphs text[] not null default '{}',
  impact jsonb not null default '[]'::jsonb,
  suggested_amounts numeric(12,2)[] not null default '{}',
  goal_amount numeric(12,2) not null default 0,
  amount_raised numeric(12,2) not null default 0,
  currency text not null default 'KES',
  cover_image text,
  status public.content_status not null default 'published',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists donation_campaigns_active_idx on public.donation_campaigns(active);
drop trigger if exists donation_campaigns_set_updated_at on public.donation_campaigns;
create trigger donation_campaigns_set_updated_at before update on public.donation_campaigns
  for each row execute function public.tg_set_updated_at();

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.donation_campaigns(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  donor_email text,
  donor_name text,
  amount numeric(12,2) not null,
  currency text not null default 'KES',
  status public.donation_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists donations_campaign_id_idx on public.donations(campaign_id);
create index if not exists donations_user_id_idx on public.donations(user_id);
create index if not exists donations_status_idx on public.donations(status);
drop trigger if exists donations_set_updated_at on public.donations;
create trigger donations_set_updated_at before update on public.donations
  for each row execute function public.tg_set_updated_at();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  donation_id uuid references public.donations(id) on delete set null,
  purpose public.payment_purpose not null,
  provider text not null default 'paystack',
  reference text not null unique,
  access_code text,
  authorization_url text,
  amount numeric(12,2) not null,
  amount_minor bigint not null,
  currency text not null default 'KES',
  status public.payment_status not null default 'pending',
  provider_response_summary jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (purpose = 'booking'  and booking_id  is not null and donation_id is null) or
    (purpose = 'donation' and donation_id is not null and booking_id  is null)
  )
);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_booking_id_idx on public.payments(booking_id);
create index if not exists payments_donation_id_idx on public.payments(donation_id);
create index if not exists payments_status_idx on public.payments(status);
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
  for each row execute function public.tg_set_updated_at();

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  status public.event_registration_status not null default 'registered',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);
create index if not exists event_registrations_event_id_idx on public.event_registrations(event_id);
create index if not exists event_registrations_user_id_idx on public.event_registrations(user_id);
drop trigger if exists event_registrations_set_updated_at on public.event_registrations;
create trigger event_registrations_set_updated_at before update on public.event_registrations
  for each row execute function public.tg_set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type public.notification_type not null default 'general_announcement',
  data jsonb not null default '{}'::jsonb,
  deep_link text,
  broadcast boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
create index if not exists notifications_broadcast_idx on public.notifications(broadcast) where broadcast = true;

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  wildlife_sightings boolean not null default true,
  booking_updates boolean not null default true,
  event_reminders boolean not null default true,
  donation_receipts boolean not null default true,
  conservation_news boolean not null default false,
  updated_at timestamptz not null default now()
);
drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at before update on public.notification_preferences
  for each row execute function public.tg_set_updated_at();

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  category text not null default 'General',
  subject text not null,
  message text not null,
  reference text,
  rating int check (rating is null or (rating between 1 and 5)),
  status public.feedback_status not null default 'open',
  admin_response text,
  responded_by uuid references public.profiles(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists feedback_user_id_idx on public.feedback(user_id);
create index if not exists feedback_status_idx on public.feedback(status);
drop trigger if exists feedback_set_updated_at on public.feedback;
create trigger feedback_set_updated_at before update on public.feedback
  for each row execute function public.tg_set_updated_at();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
