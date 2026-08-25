-- Migration 15: Sistema de caché (Fase 3 del plan) — 9 ago 2026
-- Tablas ciszu.cache / ciszu.counters + función atómica ciszu.bump_counter.
--
-- Diseño (ver packages/utils/src/cache.ts):
--   - cache:    KV con TTL (value jsonb, expires_at) — cache-aside del CacheStore.
--   - counters: contadores atómicos persistentes (votos, stats) vía bump_counter.
--   - Seguridad: RLS desactivado (es infra de servidor, NO datos de usuario);
--     solo service_role (owner/bypass) accede; anon/authenticated sin permisos.
--   - search_path vacío en la función (regla anti-initplan/anti-injection).

create schema if not exists ciszu;

create table if not exists ciszu.cache (
  key        text primary key,
  value      jsonb not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists cache_expires_at_idx on ciszu.cache (expires_at);

create table if not exists ciszu.counters (
  key        text primary key,
  value      bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- INCR atómico (upsert que devuelve el valor nuevo).
create or replace function ciszu.bump_counter(p_key text)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare v_value bigint;
begin
  insert into ciszu.counters (key, value, updated_at)
  values (p_key, 1, now())
  on conflict (key) do update
    set value = ciszu.counters.value + 1,
        updated_at = now()
  returning value into v_value;
  return v_value;
end;
$$;

-- Infra de servidor: sin RLS; acceso solo vía service_role.
alter table ciszu.cache disable row level security;
alter table ciszu.counters disable row level security;

-- Nadie más toca la caché (PostgREST REST ni RPC).
revoke all on table ciszu.cache from anon, authenticated;
revoke all on table ciszu.counters from anon, authenticated;
revoke execute on function ciszu.bump_counter(text) from anon, authenticated;
