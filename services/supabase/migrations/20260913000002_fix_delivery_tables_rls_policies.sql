-- ============================================================
-- 20260913000002_fix_delivery_tables_rls_policies.sql
-- Permite a anon/public INSERT/UPDATE en tablas de entregas
-- Fix para 401 Unauthorized en global_ads_deliveries,
-- global_disclaimer_deliveries, global_announcement_deliveries
-- ============================================================

-- ============================================================
-- global_ads_deliveries: permitir INSERT/UPDATE a public/anon
-- ============================================================
DROP POLICY IF EXISTS "Service role inserts ads deliveries" ON ciszunetwork.global_ads_deliveries;
DROP POLICY IF EXISTS "Service role updates ads deliveries" ON ciszunetwork.global_ads_deliveries;

CREATE POLICY "Anyone insert ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone update ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- global_disclaimer_deliveries: permitir UPDATE a public/anon
-- ============================================================
DROP POLICY IF EXISTS "Service role can update disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;

CREATE POLICY "Anyone update disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- global_announcement_deliveries: ya permite public, pero
-- aseguramos que la condición no bloquee a anon
-- ============================================================
-- La policy "Anyone can insert deliveries" ya existe y permite public
-- La policy "Anyone can update deliveries" ya existe y permite public
-- No hay cambios necesarios, pero verificamos que no haya restricciones extra

-- Grants ya están correctos: GRANT SELECT, INSERT, UPDATE ON ... TO anon, authenticated, service_role;