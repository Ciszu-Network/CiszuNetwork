-- Endurecimiento de la verificación en dos pasos (CISZU ID).
--
-- POR QUÉ: la tabla original solo guardaba código, caducidad y `used`. Sin
-- columnas de intentos ni de reenvíos era imposible aplicar el contrato
-- acordado: 3 intentos antes de suspender, 2 reenvíos con enfriamiento, y
-- suspensión local de 30 minutos. Sin esto, cualquiera podía probar códigos
-- indefinidamente contra un código de 6 dígitos.
--
-- Se añaden además dos índices que necesita el flujo nuevo:
--   - búsqueda del último código por (usuario, web) — la consulta de cada
--     petición de estado/verificación;
--   - limpieza de códigos caducados.

alter table public.two_factor_codes
  add column if not exists attempts integer not null default 0,
  add column if not exists resends integer not null default 0,
  add column if not exists last_sent_at timestamptz not null default now(),
  add column if not exists suspended_until timestamptz;

comment on column public.two_factor_codes.attempts is
  'Intentos de verificación fallidos del código. Al llegar a 3 se suspende el acceso.';
comment on column public.two_factor_codes.resends is
  'Reenvíos acumulados de la sesión de verificación (máximo 2).';
comment on column public.two_factor_codes.last_sent_at is
  'Último envío del código, para calcular el enfriamiento entre reenvíos.';
comment on column public.two_factor_codes.suspended_until is
  'Hasta cuándo dura la suspensión local por intentos o reenvíos agotados.';

create index if not exists idx_two_factor_codes_latest
  on public.two_factor_codes (user_id, website, created_at desc);

create index if not exists idx_two_factor_codes_expires
  on public.two_factor_codes (expires_at);

-- El acceso a esta tabla es EXCLUSIVAMENTE del servidor (service_role), que
-- salta RLS. Las políticas del propietario se mantienen para que el usuario
-- pueda auditar sus propios códigos, pero se prohíbe insertar/actualizar desde
-- el cliente: si el navegador pudiera escribir un código, el 2FA no valdría
-- nada (el atacante se emitiría el código él mismo).
drop policy if exists "Users can insert own 2FA codes" on public.two_factor_codes;
drop policy if exists "Users can update own 2FA codes" on public.two_factor_codes;

-- Limpieza de códigos caducados hace más de 30 días (evita crecimiento sin fin).
create or replace function public.purge_stale_two_factor_codes()
returns integer
language sql
security definer
set search_path = public
as $$
  with removed as (
    delete from public.two_factor_codes
    where expires_at < now() - interval '30 days'
    returning 1
  )
  select count(*)::integer from removed;
$$;

comment on function public.purge_stale_two_factor_codes() is
  'Borra códigos 2FA caducados hace más de 30 días. Pensado para un cron semanal.';
