-- Content tables (wildlife, tourism, events, conservation, education,
-- community, announcements, faqs, about) plus the standard updated_at
-- triggers. All monetary values default to Kenyan Shillings.

-- ---------------------------------------------------------------------------
-- wildlife
-- ---------------------------------------------------------------------------
create table if not exists public.wildlife_species (
  id text primary key,
  name text not null,
  scientific_name text,
  category text not null,
  conservation_status text,
  description text,
  habitat text,
  behavior text,
  facts text[] not null default '{}',
  image_url text,
  hero_image_url text,
  featured boolean not null default false,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wildlife_species_category_idx on public.wildlife_species(category);
create index if not exists wildlife_species_status_idx on public.wildlife_species(status);
drop trigger if exists wildlife_species_set_updated_at on public.wildlife_species;
create trigger wildlife_species_set_updated_at before update on public.wildlife_species
  for each row execute function public.tg_set_updated_at();

create table if not exists public.wildlife_images (
  id uuid primary key default gen_random_uuid(),
  species_id text not null references public.wildlife_species(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists wildlife_images_species_id_idx on public.wildlife_images(species_id);

-- ---------------------------------------------------------------------------
-- tourism services & availability
-- ---------------------------------------------------------------------------
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
  capacity int not null default 1,
  price numeric(12,2) not null default 0,
  currency text not null default 'KES',
  pricing_unit public.tourism_pricing_unit not null default 'per_guest',
  image_url text,
  hero_image_url text,
  featured boolean not null default false,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tourism_services_category_idx on public.tourism_services(category);
create index if not exists tourism_services_status_idx on public.tourism_services(status);
drop trigger if exists tourism_services_set_updated_at on public.tourism_services;
create trigger tourism_services_set_updated_at before update on public.tourism_services
  for each row execute function public.tg_set_updated_at();

create table if not exists public.service_availability (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.tourism_services(id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  capacity int not null,
  remaining_capacity int not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, date, start_time)
);
create index if not exists service_availability_service_date_idx on public.service_availability(service_id, date);
drop trigger if exists service_availability_set_updated_at on public.service_availability;
create trigger service_availability_set_updated_at before update on public.service_availability
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
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
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_start_at_idx on public.events(start_at);
create index if not exists events_status_idx on public.events(status);
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- conservation & education & community programs
-- ---------------------------------------------------------------------------
create table if not exists public.conservation_programs (
  id text primary key,
  title text not null,
  summary text,
  description text,
  category text,
  cover_image text,
  status public.content_status not null default 'published',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists conservation_programs_set_updated_at on public.conservation_programs;
create trigger conservation_programs_set_updated_at before update on public.conservation_programs
  for each row execute function public.tg_set_updated_at();

create table if not exists public.education_resources (
  id text primary key,
  title text not null,
  summary text,
  content text,
  category text,
  cover_image text,
  reading_minutes int,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists education_resources_set_updated_at on public.education_resources;
create trigger education_resources_set_updated_at before update on public.education_resources
  for each row execute function public.tg_set_updated_at();

create table if not exists public.community_programs (
  id text primary key,
  title text not null,
  summary text,
  description text,
  location text,
  cover_image text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists community_programs_set_updated_at on public.community_programs;
create trigger community_programs_set_updated_at before update on public.community_programs
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- announcements / faqs / about
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null,
  tone public.announcement_tone not null default 'default',
  status public.content_status not null default 'published',
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists announcements_publish_at_idx on public.announcements(publish_at desc);
drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements
  for each row execute function public.tg_set_updated_at();

create table if not exists public.faqs (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faqs_category_idx on public.faqs(category);
drop trigger if exists faqs_set_updated_at on public.faqs;
create trigger faqs_set_updated_at before update on public.faqs
  for each row execute function public.tg_set_updated_at();

create table if not exists public.about_content (
  key text primary key,
  title text not null,
  body text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
drop trigger if exists about_content_set_updated_at on public.about_content;
create trigger about_content_set_updated_at before update on public.about_content
  for each row execute function public.tg_set_updated_at();
