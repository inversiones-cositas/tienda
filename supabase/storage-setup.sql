-- Bucket público de imágenes de productos + políticas de Storage.
-- Ejecutar en Supabase (SQL Editor). El panel /admin sube firmado con el
-- rol authenticated; el catálogo público solo lee.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "catalogo lee imagenes" on storage.objects;
create policy "catalogo lee imagenes"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admin sube imagenes" on storage.objects;
create policy "admin sube imagenes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "admin actualiza imagenes" on storage.objects;
create policy "admin actualiza imagenes"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "admin borra imagenes" on storage.objects;
create policy "admin borra imagenes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
