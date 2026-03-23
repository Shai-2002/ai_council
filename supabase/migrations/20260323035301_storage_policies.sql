create policy "Authenticated users can upload" on storage.objects
  for insert with check (bucket_id = 'workspace-files' and auth.role() = 'authenticated');

create policy "Authenticated users can read" on storage.objects
  for select using (bucket_id = 'workspace-files' and auth.role() = 'authenticated');

create policy "Authenticated users can delete" on storage.objects
  for delete using (bucket_id = 'workspace-files' and auth.role() = 'authenticated');
