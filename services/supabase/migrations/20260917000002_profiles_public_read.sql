-- ============================================================
-- PERFILES PÚBLICOS LEGIBLES + ADMIN CHECK SEGURO (2026-09-17)
-- ------------------------------------------------------------
-- Problema detectado: en los schemas ciszunetwork, ciszubot y
-- ciszukoantony la tabla `profiles` NO tenía ningún grant para
-- `anon`/`authenticated` (solo `postgres`). Las APIs públicas
-- devolvían `42501 permission denied for table profiles`, así que
-- cualquier listado que embeba el perfil del autor (reseñas) se
-- quedaba sin nombre/usuario/avatar.
--
-- Solución:
--   1. Grant a nivel de COLUMNA (no de tabla) limitado a los campos
--      públicos: id, username, display_name, avatar_url. El email,
--      teléfono, rol y demás datos personales siguen sin ser
--      accesibles con la clave anónima.
--   2. La comprobación de admin de la política de borrado de reseñas
--      pasa a una función SECURITY DEFINER (`user_is_admin`), de modo
--      que no hace falta exponer `profiles.role`.
-- ============================================================

do $$
declare
  s text;
  schemas text[] := array['ciszunetwork', 'ciszubot', 'ciszukoantony'];
begin
  foreach s in array schemas loop
    -- 1. Lectura pública (solo columnas públicas)
    execute format(
      'grant select (id, username, display_name, avatar_url) on %I.profiles to anon, authenticated',
      s
    );

    -- 2. Comprobación de admin sin exponer `role`
    execute format($f$
      create or replace function %I.user_is_admin(check_uid uuid)
      returns boolean
      language sql
      stable
      security definer
      set search_path = %I, public
      as $body$
        select exists (
          select 1 from %I.profiles p
          where p.id = check_uid and p.role = 'admin'
        );
      $body$;
    $f$, s, s, s);

    execute format('revoke all on function %I.user_is_admin(uuid) from public', s);
    execute format('grant execute on function %I.user_is_admin(uuid) to authenticated', s);

    -- 3. Política de borrado usando la función
    execute format('drop policy if exists "Users and admins can delete reviews" on %I.reviews', s);
    execute format($f$
      create policy "Users and admins can delete reviews" on %I.reviews for delete
      using (
        auth.uid() = user_id
        or %I.user_is_admin(auth.uid())
      )
    $f$, s, s);
  end loop;
end $$;

-- Muzicmania ya podía leer profiles, pero igualmente usamos la función
-- para mantener la política idéntica y no depender de `role` expuesto.
do $$
begin
  execute $f$
    create or replace function muzicmania.user_is_admin(check_uid uuid)
    returns boolean
    language sql
    stable
    security definer
    set search_path = muzicmania, public
    as $body$
      select exists (
        select 1 from muzicmania.profiles p
        where p.id = check_uid and (p.role = 'admin' or p.is_admin = true)
      );
    $body$;
  $f$;
  execute 'revoke all on function muzicmania.user_is_admin(uuid) from public';
  execute 'grant execute on function muzicmania.user_is_admin(uuid) to authenticated';
  execute 'drop policy if exists "Users and admins can delete reviews" on muzicmania.reviews';
  execute $f$
    create policy "Users and admins can delete reviews" on muzicmania.reviews for delete
    using (
      auth.uid() = user_id
      or muzicmania.user_is_admin(auth.uid())
    )
  $f$;
end $$;
