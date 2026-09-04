-- ============================================================
-- 20260904000028_rls_hardening.sql
-- Refuerza RLS de ads_impressions y global_disclaimer_deliveries
-- para cumplir con el linter de Supabase (alertas WARN).
-- ============================================================

-- ============================================================
-- 1) ads_impressions: reemplazar WITH CHECK (true) por validación
--    de campos requeridos. La tabla es telemetría pública de
--    anuncios; sigue siendo insertable por anon/authenticated.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert ads impressions" ON ciszunetwork.ads_impressions;
CREATE POLICY "Anyone can insert ads impressions"
  ON ciszunetwork.ads_impressions FOR INSERT
  WITH CHECK (
    NEW.site IS NOT NULL
    AND NEW.ad_id IS NOT NULL
    AND NEW.ad_type IS NOT NULL
    AND NEW.seen_at IS NOT NULL
  );

-- ============================================================
-- 2) global_disclaimer_deliveries: endurecer INSERT y UPDATE
-- ============================================================

-- INSERT: exigir que disclaimer_id exista y site no sea nulo.
DROP POLICY IF EXISTS "Anyone insert disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;
CREATE POLICY "Anyone insert disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR INSERT
  WITH CHECK (
    NEW.disclaimer_id IS NOT NULL
    AND NEW.site IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_disclaimers g
      WHERE g.id = NEW.disclaimer_id
    )
  );

-- UPDATE: solo service_role puede modificar filas existentes.
-- El front usará POST con Prefer: resolution=merge-duplicates
-- (upsert) en vez de PATCH, por lo que no necesita UPDATE directo.
DROP POLICY IF EXISTS "Anyone update disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;
CREATE POLICY "Service role can update disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
