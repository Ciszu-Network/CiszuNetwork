-- Migration 11: Cerrar advisors authenticated_security_definer_function_executable
-- Las 3 funciones restantes (handle_review_like, handle_review_update, update_track_like_count)
-- son RETURNS TRIGGER: SOLO las invoca el motor de triggers. No se llaman via RPC desde la app
-- (verificado: grep sin usos en el frontend). Los triggers NO requieren EXECUTE del rol del DML,
-- asi que REVOKE es seguro y elimina el advisor.
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_like() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION muzicmania.update_track_like_count() FROM anon, authenticated;
