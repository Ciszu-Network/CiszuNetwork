-- Estado del 2FA POR WEBSITE (CISZU ID).
--
-- POR QUÉ NO EN `profiles`: el flag estaba pensado para `public.profiles`, que
-- NO existe — cada web tiene su propio `profiles` en su schema
-- (`ciszubot.profiles`, `muzicmania.profiles`, `ciszukoantony.profiles`) y
-- `ciszu` no tiene ninguno. Resultado: la ruta de estado del 2FA consultaba una
-- tabla inexistente y el 2FA nunca podía activarse.
--
-- Además el contrato del código es "único por website": un código emitido en
-- CiszuBot no vale en MuzicMania. Por eso el flag también es por web: puedes
-- tener 2FA activo en una y no en otra, que es justo lo que pidió el usuario.

create table if not exists public.two_factor_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  website text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, website)
);

comment on table public.two_factor_settings is
  'Activa la verificación en dos pasos por email para un usuario en una web concreta.';

alter table public.two_factor_settings enable row level security;

-- El usuario puede LEER su propio estado (para la pantalla de seguridad).
-- La escritura es solo del servidor: activar 2FA exige haber verificado un
-- código, así que no puede hacerse desde el cliente.
drop policy if exists "Users can view own 2FA settings" on public.two_factor_settings;
create policy "Users can view own 2FA settings"
  on public.two_factor_settings for select
  to authenticated
  using (auth.uid() = user_id);

-- Backfill: si una web ya tenía `profiles.two_factor_enabled`, se respeta.
do $backfill$
declare
  site text;
  schema_name text;
begin
  for schema_name in
    select nspname from pg_namespace
    where nspname in ('ciszubot', 'muzicmania', 'ciszukoantony')
      and exists (
        select 1 from information_schema.columns
        where table_schema = nspname
          and table_name = 'profiles'
          and column_name = 'two_factor_enabled'
      )
  loop
    site := schema_name;
    execute format(
      'insert into public.two_factor_settings (user_id, website, enabled)
       select p.id, %L, p.two_factor_enabled
       from %I.profiles p
       where p.two_factor_enabled is true
       on conflict (user_id, website) do update set enabled = excluded.enabled',
      site, schema_name
    );
  end loop;
end
$backfill$;

create index if not exists idx_two_factor_settings_enabled
  on public.two_factor_settings (website)
  where enabled;
