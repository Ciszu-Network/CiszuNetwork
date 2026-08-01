-- Migration 12: Red de seguridad — REVOKE EXECUTE idempotente de todas las
-- funciones SECURITY DEFINER tipo trigger/uso interno desde anon/authenticated.
-- Cierra advisor anon/authenticated_security_definer_function_executable.
-- Seguridad: REVOKE es idempotente (no falla si ya no tienen el privilegio) y
-- los triggers NO requieren EXECUTE del rol del DML (los invoca el motor).
-- Verificado (grep frontend): ninguna se llama via RPC desde la app.

-- muzicmania (migración 11, se re-asegura por si un redeploy restauró grants)
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_like() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION muzicmania.update_track_like_count() FROM anon, authenticated;

-- public: triggers de auth/profiles (BEFORE/AFTER INSERT/UPDATE)
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user_email() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_account_deletion() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_username() FROM anon, authenticated;
