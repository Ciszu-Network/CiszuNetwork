-- Migration 18: Páginas editadas con Puck (editor visual) — 18 ago 2026
-- Tabla ciszu.puck_pages: estado de páginas construidas con Puck (JSON vuerd) keyed por path.
--
-- Diseño:
--   - path   : ruta de la página (PK), ej. '/edit/home'
--   - data   : payload Data de Puck (jsonb) — el app es dueña de los datos, sin store externo.
--   - RLS    : lectura pública (las páginas publicadas son contenido público), escritura
--              solo vía service_role (bypass). anon/authenticated SIN write (denegado por defecto
--              en RLS, solo hay policy de SELECT).
--   - search_path explícito en la función de guardado (regla anti-initplan/anti-injection).

create table if not exists ciszu.puck_pages (
  path       text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table ciszu.puck_pages enable row level security;

-- Lectura pública del contenido publicado (render sin auth del lado lector).
drop policy if exists puck_pages_select_public on ciszu.puck_pages;
create policy puck_pages_select_public
  on ciszu.puck_pages
  for select
  to public
  using (true);

-- Guardado upsert server-side (service_role bypassa RLS; anon/authenticated quedan sin write).
create or replace function ciszu.save_puck_page(p_path text, p_data jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into ciszu.puck_pages (path, data, updated_at)
  values (p_path, p_data, now())
  on conflict (path) do update
    set data = p_data,
        updated_at = now();
end;
$$;

revoke all on function ciszu.save_puck_page(p_path text, p_data jsonb) from public, anon;
revoke all on function ciszu.save_puck_page(p_path text, p_data jsonb) from authenticated;
