-- Enable RLS and add policies for every application table beyond profiles.
-- Rules of thumb:
--   - Published content = readable by anon + authenticated (public catalog).
--   - Staff+ can insert/update/delete content and read operational data.
--   - Users can read/update only their own operational rows.
--   - Webhook-level mutations (Paystack success) happen through Edge Functions
--     using the service role and therefore bypass RLS.

-- ---------- content tables (public read of published) ----------
alter table public.wildlife_species enable row level security;
drop policy if exists wildlife_species_read on public.wildlife_species;
create policy wildlife_species_read on public.wildlife_species
  for select using (status = 'published' or public.is_staff());
drop policy if exists wildlife_species_staff_write on public.wildlife_species;
create policy wildlife_species_staff_write on public.wildlife_species
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.wildlife_images enable row level security;
drop policy if exists wildlife_images_read on public.wildlife_images;
create policy wildlife_images_read on public.wildlife_images
  for select using (
    exists (
      select 1 from public.wildlife_species s
      where s.id = species_id and (s.status = 'published' or public.is_staff())
    )
  );
drop policy if exists wildlife_images_staff_write on public.wildlife_images;
create policy wildlife_images_staff_write on public.wildlife_images
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.tourism_services enable row level security;
drop policy if exists tourism_services_read on public.tourism_services;
create policy tourism_services_read on public.tourism_services
  for select using (status = 'published' or public.is_staff());
drop policy if exists tourism_services_staff_write on public.tourism_services;
create policy tourism_services_staff_write on public.tourism_services
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.service_availability enable row level security;
drop policy if exists service_availability_read on public.service_availability;
create policy service_availability_read on public.service_availability
  for select using (true);
drop policy if exists service_availability_staff_write on public.service_availability;
create policy service_availability_staff_write on public.service_availability
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.events enable row level security;
drop policy if exists events_read on public.events;
create policy events_read on public.events
  for select using (status = 'published' or public.is_staff());
drop policy if exists events_staff_write on public.events;
create policy events_staff_write on public.events
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.conservation_programs enable row level security;
drop policy if exists conservation_programs_read on public.conservation_programs;
create policy conservation_programs_read on public.conservation_programs
  for select using (status = 'published' or public.is_staff());
drop policy if exists conservation_programs_staff_write on public.conservation_programs;
create policy conservation_programs_staff_write on public.conservation_programs
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.education_resources enable row level security;
drop policy if exists education_resources_read on public.education_resources;
create policy education_resources_read on public.education_resources
  for select using (status = 'published' or public.is_staff());
drop policy if exists education_resources_staff_write on public.education_resources;
create policy education_resources_staff_write on public.education_resources
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.community_programs enable row level security;
drop policy if exists community_programs_read on public.community_programs;
create policy community_programs_read on public.community_programs
  for select using (status = 'published' or public.is_staff());
drop policy if exists community_programs_staff_write on public.community_programs;
create policy community_programs_staff_write on public.community_programs
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.announcements enable row level security;
drop policy if exists announcements_read on public.announcements;
create policy announcements_read on public.announcements
  for select using (
    (status = 'published' and publish_at <= now() and (expires_at is null or expires_at > now()))
    or public.is_staff()
  );
drop policy if exists announcements_staff_write on public.announcements;
create policy announcements_staff_write on public.announcements
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.faqs enable row level security;
drop policy if exists faqs_read on public.faqs;
create policy faqs_read on public.faqs
  for select using (status = 'published' or public.is_staff());
drop policy if exists faqs_staff_write on public.faqs;
create policy faqs_staff_write on public.faqs
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.about_content enable row level security;
drop policy if exists about_content_read on public.about_content;
create policy about_content_read on public.about_content
  for select using (true);
drop policy if exists about_content_staff_write on public.about_content;
create policy about_content_staff_write on public.about_content
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- donation campaigns are public content ----------
alter table public.donation_campaigns enable row level security;
drop policy if exists donation_campaigns_read on public.donation_campaigns;
create policy donation_campaigns_read on public.donation_campaigns
  for select using (status = 'published' or public.is_staff());
drop policy if exists donation_campaigns_staff_write on public.donation_campaigns;
create policy donation_campaigns_staff_write on public.donation_campaigns
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- bookings ----------
alter table public.bookings enable row level security;
drop policy if exists bookings_owner_or_staff_read on public.bookings;
create policy bookings_owner_or_staff_read on public.bookings
  for select using (user_id = auth.uid() or public.is_staff());
drop policy if exists bookings_owner_insert on public.bookings;
create policy bookings_owner_insert on public.bookings
  for insert with check (user_id = auth.uid());
drop policy if exists bookings_owner_update on public.bookings;
create policy bookings_owner_update on public.bookings
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    -- users may only cancel their own booking, never mark it paid/confirmed
    and status in ('draft','pending_payment','cancelled')
  );
drop policy if exists bookings_staff_write on public.bookings;
create policy bookings_staff_write on public.bookings
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.booking_guests enable row level security;
drop policy if exists booking_guests_owner_or_staff_read on public.booking_guests;
create policy booking_guests_owner_or_staff_read on public.booking_guests
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff())
    )
  );
drop policy if exists booking_guests_owner_insert on public.booking_guests;
create policy booking_guests_owner_insert on public.booking_guests
  for insert with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
    or public.is_staff()
  );
drop policy if exists booking_guests_owner_update on public.booking_guests;
create policy booking_guests_owner_update on public.booking_guests
  for update using (
    exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff()))
  );
drop policy if exists booking_guests_owner_delete on public.booking_guests;
create policy booking_guests_owner_delete on public.booking_guests
  for delete using (
    exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff()))
  );

-- ---------- donations ----------
alter table public.donations enable row level security;
drop policy if exists donations_owner_or_staff_read on public.donations;
create policy donations_owner_or_staff_read on public.donations
  for select using (user_id = auth.uid() or public.is_staff());
drop policy if exists donations_owner_insert on public.donations;
create policy donations_owner_insert on public.donations
  for insert with check (user_id = auth.uid() or user_id is null);
drop policy if exists donations_staff_write on public.donations;
create policy donations_staff_write on public.donations
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- payments (mobile/admin read only; writes via Edge Function) -----
alter table public.payments enable row level security;
drop policy if exists payments_owner_or_staff_read on public.payments;
create policy payments_owner_or_staff_read on public.payments
  for select using (user_id = auth.uid() or public.is_staff());
drop policy if exists payments_staff_write on public.payments;
create policy payments_staff_write on public.payments
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- event registrations ----------
alter table public.event_registrations enable row level security;
drop policy if exists event_registrations_owner_or_staff_read on public.event_registrations;
create policy event_registrations_owner_or_staff_read on public.event_registrations
  for select using (user_id = auth.uid() or public.is_staff());
drop policy if exists event_registrations_owner_insert on public.event_registrations;
create policy event_registrations_owner_insert on public.event_registrations
  for insert with check (user_id = auth.uid());
drop policy if exists event_registrations_owner_update on public.event_registrations;
create policy event_registrations_owner_update on public.event_registrations
  for update using (user_id = auth.uid() or public.is_staff());
drop policy if exists event_registrations_owner_delete on public.event_registrations;
create policy event_registrations_owner_delete on public.event_registrations
  for delete using (user_id = auth.uid() or public.is_staff());

-- ---------- notifications & preferences ----------
alter table public.notifications enable row level security;
drop policy if exists notifications_read_own_or_broadcast on public.notifications;
create policy notifications_read_own_or_broadcast on public.notifications
  for select using (
    user_id = auth.uid()
    or (broadcast = true and user_id is null and auth.uid() is not null)
    or public.is_staff()
  );
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notifications_staff_write on public.notifications;
create policy notifications_staff_write on public.notifications
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.notification_preferences enable row level security;
drop policy if exists notif_prefs_owner_read on public.notification_preferences;
create policy notif_prefs_owner_read on public.notification_preferences
  for select using (user_id = auth.uid() or public.is_staff());
drop policy if exists notif_prefs_owner_upsert on public.notification_preferences;
create policy notif_prefs_owner_upsert on public.notification_preferences
  for insert with check (user_id = auth.uid());
drop policy if exists notif_prefs_owner_update on public.notification_preferences;
create policy notif_prefs_owner_update on public.notification_preferences
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- feedback ----------
alter table public.feedback enable row level security;
drop policy if exists feedback_owner_or_staff_read on public.feedback;
create policy feedback_owner_or_staff_read on public.feedback
  for select using (user_id = auth.uid() or public.is_staff());
drop policy if exists feedback_owner_insert on public.feedback;
create policy feedback_owner_insert on public.feedback
  for insert with check (user_id = auth.uid() or user_id is null);
drop policy if exists feedback_staff_update on public.feedback;
create policy feedback_staff_update on public.feedback
  for update using (public.is_staff()) with check (public.is_staff());

-- ---------- audit logs (admin only) ----------
alter table public.audit_logs enable row level security;
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select using (public.is_admin());
