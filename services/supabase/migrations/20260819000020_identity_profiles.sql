-- Migration 20: Identidad por web (auth no centralizada, nivel N1 de AUTH_SYSTEM)
-- 19 ago 2026. Tablas de perfil por proyecto (ciszunetwork, ciszukoantony, ciszubot)
-- para el login/registro CISZU ID (email/password) de cada web, replicando el
-- patrón de muzicmania.profiles pero sin centralizar. Cada web autentica contra
-- auth.users (proyecto compartido) pero mantiene su propio `profiles`.
--
-- RLS: lectura pública de datos básicos, escritura solo del propio usuario
-- (auth.uid() = id). Nada FOR ALL, políticas separadas por comando.
-- Trigger handle_new_user por schema (SECURITY DEFINER, search_path explícito).

-- ── Schema ciszukoantony (si no existe) ─────────────────────────────────────
create schema if not exists ciszukoantony;
grant usage on schema ciszukoantony to anon, authenticated, service_role;

-- ── Perfiles ciszunetwork ──────────────────────────────────────────────────
create table if not exists ciszunetwork.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  username       text not null,
  display_name   text not null,
  avatar_url     text,
  email          text,
  role           text not null default 'user',
  settings_lang  text not null default 'es',
  settings_theme text not null default 'dark',
  settings_controls jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table ciszunetwork.profiles enable row level security;

drop policy if exists ciszunetwork_profiles_select on ciszunetwork.profiles;
create policy ciszunetwork_profiles_select
  on ciszunetwork.profiles for select to authenticated, anon
  using (true);

drop policy if exists ciszunetwork_profiles_insert on ciszunetwork.profiles;
create policy ciszunetwork_profiles_insert
  on ciszunetwork.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists ciszunetwork_profiles_update on ciszunetwork.profiles;
create policy ciszunetwork_profiles_update
  on ciszunetwork.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists ciszunetwork_profiles_delete on ciszunetwork.profiles;
create policy ciszunetwork_profiles_delete
  on ciszunetwork.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- ── Perfiles ciszukoantony ─────────────────────────────────────────────────
create table if not exists ciszukoantony.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  username       text not null,
  display_name   text not null,
  avatar_url     text,
  email          text,
  role           text not null default 'user',
  settings_lang  text not null default 'en',
  settings_theme text not null default 'dark',
  settings_controls jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table ciszukoantony.profiles enable row level security;

drop policy if exists ciszukoantony_profiles_select on ciszukoantony.profiles;
create policy ciszukoantony_profiles_select
  on ciszukoantony.profiles for select to authenticated, anon
  using (true);

drop policy if exists ciszukoantony_profiles_insert on ciszukoantony.profiles;
create policy ciszukoantony_profiles_insert
  on ciszukoantony.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists ciszukoantony_profiles_update on ciszukoantony.profiles;
create policy ciszukoantony_profiles_update
  on ciszukoantony.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists ciszukoantony_profiles_delete on ciszukoantony.profiles;
create policy ciszukoantony_profiles_delete
  on ciszukoantony.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- ── Perfiles ciszubot (CISZU ID opcional; Discord sigue siendo el obligatorio) ──
create table if not exists ciszubot.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  username       text not null,
  display_name   text not null,
  avatar_url     text,
  email          text,
  role           text not null default 'user',
  settings_lang  text not null default 'es',
  settings_theme text not null default 'dark',
  settings_controls jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table ciszubot.profiles enable row level security;

drop policy if exists ciszubot_profiles_select on ciszubot.profiles;
create policy ciszubot_profiles_select
  on ciszubot.profiles for select to authenticated, anon
  using (true);

drop policy if exists ciszubot_profiles_insert on ciszubot.profiles;
create policy ciszubot_profiles_insert
  on ciszubot.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists ciszubot_profiles_update on ciszubot.profiles;
create policy ciszubot_profiles_update
  on ciszubot.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists ciszubot_profiles_delete on ciszubot.profiles;
create policy ciszubot_profiles_delete
  on ciszubot.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- ── Trigger handle_new_user por schema (con search_path explícito) ─────────
create or replace function ciszunetwork.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_display  text;
begin
  v_username := lower(trim(coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )));
  v_display := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );
  insert into ciszunetwork.profiles (id, username, display_name, avatar_url, email)
  values (new.id, v_username, v_display, new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function ciszukoantony.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_display  text;
begin
  v_username := lower(trim(coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )));
  v_display := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );
  insert into ciszukoantony.profiles (id, username, display_name, avatar_url, email)
  values (new.id, v_username, v_display, new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function ciszubot.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_display  text;
begin
  v_username := lower(trim(coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )));
  v_display := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );
  insert into ciszubot.profiles (id, username, display_name, avatar_url, email)
  values (new.id, v_username, v_display, new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ciszunetwork on auth.users;
create trigger on_auth_user_created_ciszunetwork
  after insert on auth.users
  for each row execute function ciszunetwork.handle_new_user();

drop trigger if exists on_auth_user_created_ciszukoantony on auth.users;
create trigger on_auth_user_created_ciszukoantony
  after insert on auth.users
  for each row execute function ciszukoantony.handle_new_user();

drop trigger if exists on_auth_user_created_ciszubot on auth.users;
create trigger on_auth_user_created_ciszubot
  after insert on auth.users
  for each row execute function ciszubot.handle_new_user();

revoke all on function ciszunetwork.handle_new_user() from public;
revoke all on function ciszukoantony.handle_new_user() from public;
revoke all on function ciszubot.handle_new_user() from public;
