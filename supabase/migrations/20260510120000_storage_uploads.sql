insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'form-uploads',
  'form-uploads',
  true,
  5242880,
  array['image/jpeg','image/png','image/gif','image/webp','application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

create policy "Anyone can upload to form-uploads"
  on storage.objects for insert
  with check (bucket_id = 'form-uploads');

create policy "Anyone can read form-uploads"
  on storage.objects for select
  using (bucket_id = 'form-uploads');
