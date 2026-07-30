-- Migration 10: Change muzicmania.submit_game_score to SECURITY INVOKER
-- All table operations (INSERT scores, UPDATE profiles, SELECT both) are
-- permitted through RLS for authenticated users. INVOKER is actually MORE
-- secure because RLS is enforced instead of bypassed.

CREATE OR REPLACE FUNCTION muzicmania.submit_game_score(
  p_track_id text,
  p_score integer,
  p_combo integer,
  p_accuracy numeric,
  p_grade text DEFAULT NULL::text,
  p_max_combo integer DEFAULT 0,
  p_perfect integer DEFAULT 0,
  p_great integer DEFAULT 0,
  p_good integer DEFAULT 0,
  p_miss integer DEFAULT 0
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'muzicmania, public'
AS $function$
DECLARE
  v_user_id UUID;
  v_exp_gained INTEGER;
  v_current_exp INTEGER;
  v_current_level INTEGER;
  v_current_high_score INTEGER;
  v_new_level INTEGER;
  v_avg_accuracy NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_score < 0 OR p_score > 9999999 OR p_accuracy < 0 OR p_accuracy > 100 THEN
    RAISE EXCEPTION 'Invalid score parameters detected.';
  END IF;
  v_exp_gained := GREATEST(10, (p_score / 1000) * (p_accuracy / 100));
  INSERT INTO scores (
    user_id, track_id, score, combo, accuracy, grade,
    max_combo, perfect, great, good, miss
  ) VALUES (
    v_user_id, p_track_id, p_score, p_combo, p_accuracy, p_grade,
    p_max_combo, p_perfect, p_great, p_good, p_miss
  );
  SELECT COALESCE(exp, xp, 0), COALESCE(level, 1), COALESCE(high_score, 0)
  INTO v_current_exp, v_current_level, v_current_high_score
  FROM profiles WHERE id = v_user_id;
  IF p_score > COALESCE(v_current_high_score, 0) THEN
    v_current_high_score := p_score;
  END IF;
  v_current_exp := v_current_exp + v_exp_gained;
  v_new_level := GREATEST(v_current_level, FLOOR(v_current_exp / 1000) + 1);
  SELECT ROUND(AVG(accuracy), 2) INTO v_avg_accuracy
  FROM scores WHERE user_id = v_user_id;
  UPDATE profiles SET
    exp = v_current_exp, xp = v_current_exp,
    level = v_new_level, high_score = v_current_high_score,
    games_played = COALESCE(games_played, 0) + 1,
    accuracy = COALESCE(v_avg_accuracy, p_accuracy)
  WHERE id = v_user_id;
END;
$function$;