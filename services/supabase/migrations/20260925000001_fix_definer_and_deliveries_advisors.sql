-- ============================================================
-- 20260925000001_fix_definer_and_deliveries_advisors.sql
-- Cierra los advisors de seguridad pendientes (2026-09-25):
--
--   1) rls_policy_always_true — tablas de entrega globales:
--      · ciszunetwork.global_ads_deliveries
--      · ciszunetwork.global_changelog_deliveries
--      · ciszunetwork.global_disclaimer_deliveries
--      El INSERT/UPDATE usaba USING/WITH CHECK (TRUE). Se cambia por una
--      condición real —site de una web del ecosistema Y fila padre
--      existente y no caducada— sin romper el upsert que hace el front
--      con la clave anónima (confirmación de entrega del --wait).
--      Mismo patrón ya aplicado en global_announcement_deliveries
--      (20260824000025_global_announcement_deliveries_rls_harden.sql).
--
--   2) anon/authenticated_security_definer_function_executable:
--      · <schema>.handle_review_like() / handle_review_update():
--        son funciones de TRIGGER. El motor no exige EXECUTE al rol que
--        hace el DML, así que se revoca a PUBLIC/anon/authenticated y
--        dejan de ser invocables por /rest/v1/rpc.
--      · public.purge_stale_two_factor_codes(): tarea de mantenimiento,
--        solo service_role.
--      · <schema>.user_is_admin(uuid): la política de borrado de reseñas
--        la sigue necesitando, así que se muda al schema `private` (NO
--        expuesto por PostgREST) y la política apunta allí. Deja de ser
--        invocable por RPC y el advisor desaparece.
--
-- Idempotente: se puede re-aplicar sin romper nada.
-- ============================================================

-- ============================================================
-- 1. Tablas de entrega: policies con condición real
-- ------------------------------------------------------------
-- Sitios válidos del ecosistema (coinciden con la prop `site` de
-- GlobalAdvisor / GlobalDisclaimer / AdsWithUser y con ALL_SITES de
-- scripts/*.js). El front confirma la entrega de SU web con un upsert,
-- así que se permite INSERT/UPDATE solo para filas de una web real y
-- cuyo padre sigue publicado/vigente.
-- ============================================================

-- ── ciszunetwork.global_ads_deliveries ──
DROP POLICY IF EXISTS "Anyone insert ads deliveries" ON ciszunetwork.global_ads_deliveries;
DROP POLICY IF EXISTS "Anyone update ads deliveries" ON ciszunetwork.global_ads_deliveries;
DROP POLICY IF EXISTS "Service role inserts ads deliveries" ON ciszunetwork.global_ads_deliveries;
DROP POLICY IF EXISTS "Service role updates ads deliveries" ON ciszunetwork.global_ads_deliveries;

CREATE POLICY "Anyone insert ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR INSERT
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_ads a
      WHERE a.id = ad_id
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    )
  );

CREATE POLICY "Anyone update ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR UPDATE
  USING (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_ads a
      WHERE a.id = ad_id
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    )
  )
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_ads a
      WHERE a.id = ad_id
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    )
  );

-- ── ciszunetwork.global_changelog_deliveries ──
DROP POLICY IF EXISTS "Anyone insert changelog deliveries" ON ciszunetwork.global_changelog_deliveries;
DROP POLICY IF EXISTS "Anyone update changelog deliveries" ON ciszunetwork.global_changelog_deliveries;

CREATE POLICY "Anyone insert changelog deliveries"
  ON ciszunetwork.global_changelog_deliveries FOR INSERT
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_changelogs c
      WHERE c.id = entry_id
        AND c.published
        AND (c.expires_at IS NULL OR c.expires_at > NOW())
    )
  );

CREATE POLICY "Anyone update changelog deliveries"
  ON ciszunetwork.global_changelog_deliveries FOR UPDATE
  USING (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_changelogs c
      WHERE c.id = entry_id
        AND c.published
        AND (c.expires_at IS NULL OR c.expires_at > NOW())
    )
  )
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_changelogs c
      WHERE c.id = entry_id
        AND c.published
        AND (c.expires_at IS NULL OR c.expires_at > NOW())
    )
  );

-- ── ciszunetwork.global_disclaimer_deliveries ──
DROP POLICY IF EXISTS "Anyone insert disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;
DROP POLICY IF EXISTS "Anyone update disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;
DROP POLICY IF EXISTS "Service role can update disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;
DROP POLICY IF EXISTS "Service role inserts disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;

CREATE POLICY "Anyone insert disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR INSERT
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_disclaimers d
      WHERE d.id = disclaimer_id
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
    )
  );

CREATE POLICY "Anyone update disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR UPDATE
  USING (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_disclaimers d
      WHERE d.id = disclaimer_id
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
    )
  )
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_disclaimers d
      WHERE d.id = disclaimer_id
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
    )
  );

-- ============================================================
-- 2. Funciones de trigger de reseñas: sin EXECUTE para nadie
-- ------------------------------------------------------------
-- handle_review_like / handle_review_update solo se disparan desde los
-- triggers `on_review_like` / `on_review_update`; el motor las ejecuta
-- sin comprobar EXECUTE del rol que hace el DML. Se revoca también a
-- PUBLIC porque el ACL por defecto de una función nueva se lo concede,
-- y de ahí lo heredan anon y authenticated.
-- ============================================================
DO $$
DECLARE
  s TEXT;
  schemas TEXT[] := ARRAY['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania'];
BEGIN
  FOREACH s IN ARRAY schemas LOOP
    IF to_regprocedure(format('%I.handle_review_like()', s)) IS NOT NULL THEN
      EXECUTE format(
        'REVOKE ALL ON FUNCTION %I.handle_review_like() FROM PUBLIC, anon, authenticated',
        s
      );
    END IF;

    IF to_regprocedure(format('%I.handle_review_update()', s)) IS NOT NULL THEN
      EXECUTE format(
        'REVOKE ALL ON FUNCTION %I.handle_review_update() FROM PUBLIC, anon, authenticated',
        s
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 3. public.purge_stale_two_factor_codes(): mantenimiento interno
-- ------------------------------------------------------------
-- Borra códigos 2FA caducados. La llama un cron del servidor, nunca el
-- cliente, así que solo service_role (el dueño la conserva).
-- ============================================================
DO $$
BEGIN
  IF to_regprocedure('public.purge_stale_two_factor_codes()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.purge_stale_two_factor_codes() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.purge_stale_two_factor_codes() TO service_role;
  END IF;
END $$;

-- ============================================================
-- 4. user_is_admin(uuid): fuera de los schemas expuestos
-- ------------------------------------------------------------
-- La política «Users and admins can delete reviews» necesita saber si el
-- usuario es admin sin exponer `profiles.role`, y para eso usa una
-- función SECURITY DEFINER. Tenerla en un schema expuesto la hacía
-- invocable por RPC (advisor 0028/0029). Se mueve al schema `private`,
-- que PostgREST NO expone (no está en `[api] schemas` de config.toml),
-- y se refiere en la política con su nombre cualificado: la política
-- sigue funcionando y la función deja de ser alcanzable desde la API.
--
-- `set search_path = ''` + nombres cualificados evitan el clásico
-- secuestro de search_path en funciones SECURITY DEFINER.
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

DO $$
DECLARE
  s TEXT;
  schemas TEXT[] := ARRAY['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania'];
  admin_cond TEXT;
BEGIN
  FOREACH s IN ARRAY schemas LOOP
    -- MuzicMania conserva su doble marca de admin (role | is_admin).
    admin_cond := CASE WHEN s = 'muzicmania' THEN ' OR p.is_admin = TRUE' ELSE '' END;

    EXECUTE format($f$
      CREATE OR REPLACE FUNCTION private.%I_user_is_admin(check_uid UUID)
      RETURNS BOOLEAN
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = ''
      AS $body$
        SELECT EXISTS (
          SELECT 1
          FROM %I.profiles p
          WHERE p.id = check_uid
            AND (p.role = 'admin'%s)
        );
      $body$;
    $f$, s, s, admin_cond);

    EXECUTE format(
      'REVOKE ALL ON FUNCTION private.%I_user_is_admin(uuid) FROM PUBLIC', s
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION private.%I_user_is_admin(uuid) TO anon, authenticated', s
    );

    -- La política de borrado pasa a usar la función privada.
    IF to_regclass(format('%I.reviews', s)) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "Users and admins can delete reviews" ON %I.reviews', s);
      EXECUTE format($f$
        CREATE POLICY "Users and admins can delete reviews" ON %I.reviews FOR DELETE
        USING (
          auth.uid() = user_id
          OR private.%I_user_is_admin(auth.uid())
        )
      $f$, s, s);
    END IF;

    -- Ya no hace falta la copia pública (era la invocable por RPC).
    IF to_regprocedure(format('%I.user_is_admin(uuid)', s)) IS NOT NULL THEN
      BEGIN
        EXECUTE format('DROP FUNCTION %I.user_is_admin(uuid)', s);
      EXCEPTION WHEN dependent_objects_still_exist THEN
        -- Algún objeto fuera de las migraciones la usa: se deja y se avisa.
        RAISE NOTICE '%: user_is_admin(uuid) tiene dependencias, no se elimina', s;
      END;
    END IF;
  END LOOP;
END $$;
