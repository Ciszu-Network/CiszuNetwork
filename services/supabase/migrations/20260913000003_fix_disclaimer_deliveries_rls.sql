-- ============================================================
-- 20260913000003_fix_disclaimer_deliveries_rls.sql
-- Fix RLS para global_disclaimer_deliveries - permitir INSERT a anon
-- ============================================================

-- La tabla tiene PK compuesta (disclaimer_id, site)
-- Policy actual "Anyone update disclaimer deliveries" ya existe con USING (true) WITH CHECK (true)
-- Pero falta policy de INSERT para public/anon

DROP POLICY IF EXISTS "Anyone insert disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;

CREATE POLICY "Anyone insert disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR INSERT
  WITH CHECK (true);

-- Verificar que UPDATE ya permite public
DROP POLICY IF EXISTS "Anyone update disclaimer deliveries" ON ciszunetwork.global_disclaimer_deliveries;

CREATE POLICY "Anyone update disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR UPDATE
  USING (true)
  WITH CHECK (true);