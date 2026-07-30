-- Revocar de PUBLIC (que hereda anon) y regrantear solo a authenticated/service_role

REVOKE EXECUTE ON FUNCTION public.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT, p_max_combo INTEGER,
  p_perfect INTEGER, p_great INTEGER, p_good INTEGER, p_miss INTEGER
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT, p_max_combo INTEGER,
  p_perfect INTEGER, p_great INTEGER, p_good INTEGER, p_miss INTEGER
) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION muzicmania.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT, p_max_combo INTEGER,
  p_perfect INTEGER, p_great INTEGER, p_good INTEGER, p_miss INTEGER
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION muzicmania.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT, p_max_combo INTEGER,
  p_perfect INTEGER, p_great INTEGER, p_good INTEGER, p_miss INTEGER
) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_account_recoverable(p_user_id UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_recoverable(p_user_id UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_account_recoverable(p_username TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_recoverable(p_username TEXT) TO authenticated, service_role;

-- check_username_available: anon necesita ejecutar (SECURITY INVOKER), mantener
-- pero asegurar que solo ejecuten quienes deben
GRANT EXECUTE ON FUNCTION public.check_username_available(p_username TEXT) TO anon, authenticated, service_role;