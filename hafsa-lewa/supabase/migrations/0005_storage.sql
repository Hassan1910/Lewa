-- Storage buckets for public content assets. All buckets are public-read; only
-- authenticated staff can upload/update/delete. Bucket layout keeps assets by
-- domain (wildlife/, tourism/, events/, donations/, content/, avatars/).

insert into storage.buckets (id, name, public)
  values ('content', 'content', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- content bucket: public read, staff write
drop policy if exists "content_public_read" on storage.objects;
create policy "content_public_read"
  on storage.objects for select
  using (bucket_id = 'content');

drop policy if exists "content_staff_insert" on storage.objects;
create policy "content_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'content' and public.is_staff());

drop policy if exists "content_staff_update" on storage.objects;
create policy "content_staff_update"
  on storage.objects for update
  using (bucket_id = 'content' and public.is_staff());

drop policy if exists "content_staff_delete" on storage.objects;
create policy "content_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'content' and public.is_staff());

-- avatars bucket: public read, users can upload/update/delete their own folder
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
