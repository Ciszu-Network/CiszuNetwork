-- Fix preciso: revocar EXECUTE de anon con signature exacta
-- (los REVOKE anteriores no matchearon la firma completa)

REVOKE EXECUTE ON FUNCTION public.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT, p_max_combo INTEGER,
  p_perfect INTEGER, p_great INTEGER, p_good INTEGER, p_miss INTEGER
) FROM anon;

REVOKE EXECUTE ON FUNCTION muzicmania.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT, p_max_combo INTEGER,
  p_perfect INTEGER, p_great INTEGER, p_good INTEGER, p_miss INTEGER
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_account_recoverable(p_user_id UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_account_recoverable(p_username TEXT) FROM anon;