-- Escrituras del panel /admin con Supabase Auth.
-- El rol `authenticated` puede gestionar el catálogo; el `anon` sigue
-- limitado a leer productos visibles (schema.sql).
-- Hardening sugerido: reemplazar por una verificación de perfil administrador
-- (tabla profiles con is_admin) cuando haya más de un operador.

alter table public.products enable row level security;

drop policy if exists "admin gestiona el catalogo" on public.products;
create policy "admin gestiona el catalogo"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);
