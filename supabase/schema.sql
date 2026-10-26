-- Catálogo de Inversiones Cositas — esquema inicial
-- Ejecutar en Supabase (Dashboard → SQL Editor o supabase/migrations).

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  images      text[] not null default '{}',
  category    text,
  stock       integer,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Índices sencillos para el catálogo público
create index if not exists products_visible_idx
  on public.products (is_visible, created_at desc);

-- RLS: el anon key del catálogo solo puede leer filas visibles.
alter table public.products enable row level security;

drop policy if exists "catálogo público lee productos visibles" on public.products;
create policy "catálogo público lee productos visibles"
  on public.products
  for select
  to anon, authenticated
  using (is_visible = true);

-- Las escrituras quedan para la fase del panel /admin con Supabase Auth
-- (policy para el rol de administrador, nunca del todo público).
