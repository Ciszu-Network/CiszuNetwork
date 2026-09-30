-- Privacidad de perfil (visibility) + detección de ban por IP.
-- Ver ACCOUNT_SYSTEM.md (§ privacidad y § sanciones).

-- 1) Privacidad de perfil: por defecto público. `friends` y `private` limitan
-- los datos detallados (records, historial, logros, amistades, comentarios) a
-- amigos/owner; los datos básicos (nombre, foto, bio) siguen visibles.
-- `sections` queda para futuras restricciones por sector.
create table if not exists public.account_privacy (
  user_id uuid primary key references auth.users(id) on delete cascade,
  visibility text not null default 'public' check (visibility in ('public','friends','private')),
  sections jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.account_privacy enable row level security;

-- Lectura pública del NIVEL de privacidad (el perfil necesita saber cuánto mostrar).
drop policy if exists "account_privacy_select_public" on public.account_privacy;
create policy "account_privacy_select_public"
  on public.account_privacy for select to anon, authenticated
  using (true);
-- Sin policies de escritura: solo service_role (API con sesión validada).

-- 2) Detección de ban por IP: IPs bloqueadas explícitamente + IP anotada en la
-- sanción del usuario. Los checks corren server-side (service role), por eso
-- estas tablas no exponen policies públicas.
create table if not exists public.banned_ips (
  ip inet primary key,
  reason text not null default '',
  actor text not null default 'staff',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.banned_ips enable row level security;

alter table public.sanctions add column if not exists ip inet;
create index if not exists sanctions_ip_idx on public.sanctions (ip);
