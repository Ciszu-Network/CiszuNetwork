-- Migración: roles/tags, sanciones y ciclo de eliminación de cuentas.
-- Ver ACCOUNT_SYSTEM_PLAN.md (bloques B y C).

-- 1) Roles/tags globales por website (uno por usuario y web).
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website text not null,
  role text not null check (role in ('owner','admin','mod','bot','vip','betatesting','support')),
  granted_by text not null default 'system',
  created_at timestamptz not null default now(),
  unique (user_id, website)
);

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_public" on public.user_roles;
create policy "user_roles_select_public"
  on public.user_roles for select to anon, authenticated
  using (true);
-- Sin policies de escritura: solo service_role (devcon / staff).

-- 2) Sanciones (bans/mutes/warnings). El ban vive en el UUID: un email que se
-- re-registre sigue sancionado (se consulta por el user_id del UUID).
create table if not exists public.sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('ban','mute','warning')),
  scope text not null default 'global',
  reason text not null default '',
  actor text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists sanctions_user_type_idx on public.sanctions (user_id, type);
create index if not exists sanctions_expires_idx on public.sanctions (expires_at);

alter table public.sanctions enable row level security;

-- Lectura pública: el perfil muestra si la cuenta está baneada y quién lo hizo.
drop policy if exists "sanctions_select_public" on public.sanctions;
create policy "sanctions_select_public"
  on public.sanctions for select to anon, authenticated
  using (true);
-- Escritura solo service_role.

-- 3) Ciclo de eliminación (15 días de suspensión + respaldo + recuperación).
-- La cuenta NUNCA se borra: se desindexa, se anonimiza lo público y se
-- respalda en `backup`. A los 15 días sin recuperar se eliminan credenciales
-- y validación (contraseña aleatoria + email sin confirmar), pero el UUID,
-- el correo y los datos permanecen vinculados para siempre.
create table if not exists public.account_deletions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','recovered','expired')),
  recovered_at timestamptz,
  no_delete_until timestamptz,
  backup jsonb not null default '{}'::jsonb
);

create index if not exists account_deletions_status_idx on public.account_deletions (status, expires_at);

alter table public.account_deletions enable row level security;

-- El dueño puede leer su propio registro (estado/recuperación). El respaldo
-- (`backup`) queda privado: nadie más lo lee por API.
drop policy if exists "account_deletions_select_own" on public.account_deletions;
create policy "account_deletions_select_own"
  on public.account_deletions for select to authenticated
  using ((select auth.uid()) = user_id);

-- Vista pública SIN `backup`: marca pública de cuenta eliminada para perfiles
-- (desindexación visible) sin exponer los datos respaldados.
create or replace view public.account_public_status as
  select user_id, status, requested_at, expires_at, no_delete_until
  from public.account_deletions
  where status in ('pending', 'expired');

grant select on public.account_public_status to anon, authenticated;
