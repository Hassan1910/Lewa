-- Row Level Security for all exposed application tables.

alter table public.profiles enable row level security;
alter table public.wildlife_species enable row level security;
alter table public.wildlife_images enable row level security;
alter table public.conservation_programs enable row level security;
alter table public.tourism_services enable row level security;
alter table public.service_availability enable row level security;
alter table public.donation_campaigns enable row level security;
alter table public.events enable row level security;
alter table public.education_resources enable row level security;
alter table public.community_programs enable row level security;
alter table public.faqs enable row level security;
alter table public.announcements enable row level security;
alter table public.about_content enable row level security;
alter table public.site_settings enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_guests enable row level security;
alter table public.donations enable row level security;
alter table public.payments enable row level security;
alter table public.event_registrations enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.feedback enable row level security;
alter table public.audit_logs enable row level security;
alter table public.device_push_tokens enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- ---------- published content (public read, staff write) ----------
drop policy if exists wildlife_public_read on public.wildlife_species;
create policy wildlife_public_read on public.wildlife_species
  for select using (published = true or public.is_staff());
drop policy if exists wildlife_staff_write on public.wildlife_species;
create policy wildlife_staff_write on public.wildlife_species
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists wildlife_images_public_read on public.wildlife_images;
create policy wildlife_images_public_read on public.wildlife_images
  for select using (true);
drop policy if exists wildlife_images_staff_write on public.wildlife_images;
create policy wildlife_images_staff_write on public.wildlife_images
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists conservation_public_read on public.conservation_programs;
create policy conservation_public_read on public.conservation_programs
  for select using (status = 'published' or public.is_staff());
drop policy if exists conservation_staff_write on public.conservation_programs;
create policy conservation_staff_write on public.conservation_programs
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists tourism_public_read on public.tourism_services;
create policy tourism_public_read on public.tourism_services
  for select using (status = 'published' or public.is_staff());
drop policy if exists tourism_staff_write on public.tourism_services;
create policy tourism_staff_write on public.tourism_services
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists availability_public_read on public.service_availability;
create policy availability_public_read on public.service_availability
  for select using (true);
drop policy if exists availability_staff_write on public.service_availability;
create policy availability_staff_write on public.service_availability
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists campaigns_public_read on public.donation_campaigns;
create policy campaigns_public_read on public.donation_campaigns
  for select using (status = 'published' or public.is_staff());
drop policy if exists campaigns_staff_write on public.donation_campaigns;
create policy campaigns_staff_write on public.donation_campaigns
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select using (status = 'published' or public.is_staff());
drop policy if exists events_staff_write on public.events;
create policy events_staff_write on public.events
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists education_public_read on public.education_resources;
create policy education_public_read on public.education_resources
  for select using (published = true or public.is_staff());
drop policy if exists education_staff_write on public.education_resources;
create policy education_staff_write on public.education_resources
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists community_public_read on public.community_programs;
create policy community_public_read on public.community_programs
  for select using (status = 'published' or public.is_staff());
drop policy if exists community_staff_write on public.community_programs;
create policy community_staff_write on public.community_programs
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read on public.faqs
  for select using (published = true or public.is_staff());
drop policy if exists faqs_staff_write on public.faqs;
create policy faqs_staff_write on public.faqs
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements
  for select using (
    (published = true and publish_at <= now() and (expires_at is null or expires_at > now()))
    or public.is_staff()
  );
drop policy if exists announcements_staff_write on public.announcements;
create policy announcements_staff_write on public.announcements
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists about_public_read on public.about_content;
create policy about_public_read on public.about_content
  for select using (true);
drop policy if exists about_staff_write on public.about_content;
create policy about_staff_write on public.about_content
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists settings_staff_read on public.site_settings;
create policy settings_staff_read on public.site_settings
  for select using (public.is_staff());
drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- bookings ----------
drop policy if exists bookings_select_own on public.bookings;
create policy bookings_select_own on public.bookings
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists bookings_insert_own on public.bookings;
create policy bookings_insert_own on public.bookings
  for insert with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists bookings_update_own_cancel on public.bookings;
create policy bookings_update_own_cancel on public.bookings
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists bookings_staff_all on public.bookings;
create policy bookings_staff_all on public.bookings
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists booking_guests_own on public.booking_guests;
create policy booking_guests_own on public.booking_guests
  for all using (
    exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff()))
  )
  with check (
    exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff()))
  );

-- ---------- donations / payments ----------
drop policy if exists donations_select_own on public.donations;
create policy donations_select_own on public.donations
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists donations_insert_own on public.donations;
create policy donations_insert_own on public.donations
  for insert with check (auth.uid() is not null and (user_id = auth.uid() or user_id is null));

drop policy if exists donations_staff_all on public.donations;
create policy donations_staff_all on public.donations
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists payments_staff_all on public.payments;
create policy payments_staff_all on public.payments
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- events ----------
drop policy if exists event_reg_select_own on public.event_registrations;
create policy event_reg_select_own on public.event_registrations
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists event_reg_insert_own on public.event_registrations;
create policy event_reg_insert_own on public.event_registrations
  for insert with check (user_id = auth.uid());

drop policy if exists event_reg_staff on public.event_registrations;
create policy event_reg_staff on public.event_registrations
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- notifications ----------
drop policy if exists notifications_select_visible on public.notifications;
create policy notifications_select_visible on public.notifications
  for select using (broadcast = true or user_id = auth.uid() or public.is_staff());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid() or (broadcast = true and auth.uid() is not null))
  with check (user_id = auth.uid() or broadcast = true);

drop policy if exists notifications_staff_write on public.notifications;
create policy notifications_staff_write on public.notifications
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists prefs_own on public.notification_preferences;
create policy prefs_own on public.notification_preferences
  for all using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

drop policy if exists tokens_own on public.device_push_tokens;
create policy tokens_own on public.device_push_tokens
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- feedback ----------
drop policy if exists feedback_select_own on public.feedback;
create policy feedback_select_own on public.feedback
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists feedback_insert_own on public.feedback;
create policy feedback_insert_own on public.feedback
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists feedback_staff_update on public.feedback;
create policy feedback_staff_update on public.feedback
  for update using (public.is_staff()) with check (public.is_staff());

-- ---------- audit ----------
drop policy if exists audit_staff_read on public.audit_logs;
create policy audit_staff_read on public.audit_logs
  for select using (public.is_staff());

-- Storage buckets (public read for published media)
insert into storage.buckets (id, name, public)
values
  ('wildlife', 'wildlife', true),
  ('tourism', 'tourism', true),
  ('events', 'events', true),
  ('donations', 'donations', true),
  ('content', 'content', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists storage_public_read on storage.objects;
create policy storage_public_read on storage.objects
  for select using (bucket_id in ('wildlife', 'tourism', 'events', 'donations', 'content'));

drop policy if exists storage_staff_write on storage.objects;
create policy storage_staff_write on storage.objects
  for all using (
    bucket_id in ('wildlife', 'tourism', 'events', 'donations', 'content')
    and public.is_staff()
  )
  with check (
    bucket_id in ('wildlife', 'tourism', 'events', 'donations', 'content')
    and public.is_staff()
  );
