-- ============================================================
-- 20260913000004_fix_global_ads_deliveries_grants.sql
-- Añade grants INSERT/UPDATE para anon/authenticated en global_ads_deliveries
-- ============================================================

GRANT INSERT, UPDATE ON ciszunetwork.global_ads_deliveries TO anon, authenticated, service_role;