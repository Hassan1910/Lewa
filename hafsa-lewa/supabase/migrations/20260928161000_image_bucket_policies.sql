-- wildlife, tourism, and events buckets already exist and are public,
-- but they had no storage policies, so staff uploads were denied.
-- Public read matches the content bucket. Staff write matches is_staff().

drop policy if exists wildlife_public_read on storage.objects;
create policy wildlife_public_read on storage.objects
  for select
  using (bucket_id = 'wildlife');

drop policy if exists wildlife_staff_insert on storage.objects;
create policy wildlife_staff_insert on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'wildlife' and public.is_staff());

drop policy if exists wildlife_staff_update on storage.objects;
create policy wildlife_staff_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'wildlife' and public.is_staff())
  with check (bucket_id = 'wildlife' and public.is_staff());

drop policy if exists wildlife_staff_delete on storage.objects;
create policy wildlife_staff_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'wildlife' and public.is_staff());

drop policy if exists tourism_public_read on storage.objects;
create policy tourism_public_read on storage.objects
  for select
  using (bucket_id = 'tourism');

drop policy if exists tourism_staff_insert on storage.objects;
create policy tourism_staff_insert on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'tourism' and public.is_staff());

drop policy if exists tourism_staff_update on storage.objects;
create policy tourism_staff_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'tourism' and public.is_staff())
  with check (bucket_id = 'tourism' and public.is_staff());

drop policy if exists tourism_staff_delete on storage.objects;
create policy tourism_staff_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'tourism' and public.is_staff());

drop policy if exists events_public_read on storage.objects;
create policy events_public_read on storage.objects
  for select
  using (bucket_id = 'events');

drop policy if exists events_staff_insert on storage.objects;
create policy events_staff_insert on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'events' and public.is_staff());

drop policy if exists events_staff_update on storage.objects;
create policy events_staff_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'events' and public.is_staff())
  with check (bucket_id = 'events' and public.is_staff());

drop policy if exists events_staff_delete on storage.objects;
create policy events_staff_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'events' and public.is_staff());
