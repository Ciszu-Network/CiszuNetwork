-- Migration 19: Puck multi-app — columna app en ciszu.puck_pages (19 ago 2026)
-- El editor visual Puck se integra en las 4 webs (ciszunetwork, ciszukoantony,
-- muzicmania, ciszubot). Cada web guarda sus páginas bajo su identificador `app`.
--
-- Cambios:
--   - app   : identificador de la app propietaria de la página (text not null).
--             Fila existentes heredan 'ciszunetwork' (PK anterior era path).
--   - PK compuesta (app, path) — una misma ruta puede existir por app sin colisión.
--   - Función save_puck_page actualizada a (p_app, p_path, p_data).
--   - RLS sin cambios: SELECT público (contenido publicado), write solo vía
--     service_role (invoker + search_path vacío). Reglas SECURITY_PROTOCOLS.md.

alter table ciszu.puck_pages drop constraint if exists puck_pages_pkey;

alter table ciszu.puck_pages add column app text not null default 'ciszunetwork';

alter table ciszu.puck_pages add constraint puck_pages_pkey primary key (app, path);

create index if not exists puck_pages_app_idx on ciszu.puck_pages (app);

drop policy if exists puck_pages_select_public on ciszu.puck_pages;
create policy puck_pages_select_public
  on ciszu.puck_pages
  for select
  to public
  using (true);

drop function if exists ciszu.save_puck_page(p_path text, p_data jsonb);
create or replace function ciszu.save_puck_page(p_app text, p_path text, p_data jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into ciszu.puck_pages (app, path, data, updated_at)
  values (p_app, p_path, p_data, now())
  on conflict (app, path) do update
    set data = p_data,
        updated_at = now();
end;
$$;

revoke all on function ciszu.save_puck_page(p_app text, p_path text, p_data jsonb) from public, anon;
revoke all on function ciszu.save_puck_page(p_app text, p_path text, p_data jsonb) from authenticated;
