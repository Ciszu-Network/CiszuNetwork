-- ============================================================
-- Fix 27 advisor warnings de Supabase Dashboard
-- ============================================================
-- 1. Funciones SECURITY DEFINER: agregar search_path fijo
-- 2. Revocar EXECUTE de anon/authenticated donde no corresponda
-- ============================================================

-- ─── check_username_available (SECURITY INVOKER pero necesita search_path) ───
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$;

-- ─── submit_game_score en public (wrapper) ───
CREATE OR REPLACE FUNCTION public.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT DEFAULT NULL,
  p_max_combo INTEGER DEFAULT 0, p_perfect INTEGER DEFAULT 0,
  p_great INTEGER DEFAULT 0, p_good INTEGER DEFAULT 0,
  p_miss INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  PERFORM muzicmania.submit_game_score(
    p_track_id, p_score, p_combo, p_accuracy, p_grade,
    p_max_combo, p_perfect, p_great, p_good, p_miss
  );
END;
$$;

-- ─── submit_game_score en muzicmania ───
CREATE OR REPLACE FUNCTION muzicmania.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT DEFAULT NULL,
  p_max_combo INTEGER DEFAULT 0, p_perfect INTEGER DEFAULT 0,
  p_great INTEGER DEFAULT 0, p_good INTEGER DEFAULT 0,
  p_miss INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $func$
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
$func$;

-- Solo authenticated puede ejecutar submit_game_score
REVOKE EXECUTE ON FUNCTION public.submit_game_score FROM anon;
REVOKE EXECUTE ON FUNCTION muzicmania.submit_game_score FROM anon;

-- ─── get_email_by_username (necesario para autenticación) ───
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username));
  RETURN v_email;
END;
$$;

-- Solo authenticated puede ejecutar (anon no necesita saber emails)
REVOKE EXECUTE ON FUNCTION public.get_email_by_username FROM anon;

-- ─── handle_account_deletion (trigger, no debe ser RPC) ───
CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  DELETE FROM muzicmania.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_account_deletion() FROM anon, authenticated;

-- ─── handle_new_user (trigger, no debe ser RPC) ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public, extensions'
AS $func$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  v_username := LOWER(REPLACE(TRIM(COALESCE(
    NULLIF(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )), ' ', ''));
  IF v_username IS NULL OR char_length(v_username) < 3 THEN
    v_username := 'user_' || substring(new.id::text from 1 for 8);
  END IF;
  v_display_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );
  INSERT INTO profiles (
    id, username, display_name, avatar_url, email,
    country, birth_date, first_name, last_name, phone, role,
    level, xp, exp, games_played, accuracy, high_score, birth_privacy,
    email_verified
  ) VALUES (
    new.id, v_username, v_display_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'country',
    NULLIF(new.raw_user_meta_data->>'birth_date', '')::date,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'user', 1, 0, 0, 0, 0, 0, 'private', false
  )
  ON CONFLICT (id) DO UPDATE SET
    username     = COALESCE(NULLIF(EXCLUDED.username, ''), profiles.username),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
    email        = EXCLUDED.email,
    first_name   = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name    = COALESCE(EXCLUDED.last_name, profiles.last_name),
    birth_date   = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
    country      = COALESCE(EXCLUDED.country, profiles.country),
    phone        = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN new;
END;
$func$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- ─── auto_confirm_user_email (trigger, no debe ser RPC) ───
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  UPDATE profiles SET email_verified = true WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.auto_confirm_user_email() FROM anon, authenticated;

-- ─── is_account_recoverable (text) ───
CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_username TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
    AND deleted_at IS NOT NULL;
  RETURN v_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_account_recoverable(p_username TEXT) FROM anon;

-- ─── is_account_recoverable (uuid) ───
CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM muzicmania.profiles
    WHERE id = p_user_id
    AND deleted_at IS NOT NULL;
  RETURN v_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_account_recoverable(p_user_id UUID) FROM anon;

-- ─── normalize_username (utilidad interna) ───
CREATE OR REPLACE FUNCTION public.normalize_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  NEW.username := LOWER(TRIM(NEW.username));
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.normalize_username() FROM anon, authenticated;

-- ─── handle_review_like (muzicmania, solo authenticated) ───
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_like() FROM anon;

-- ─── handle_review_update (muzicmania, solo authenticated) ───
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_update() FROM anon;

-- ─── update_track_like_count (muzicmania, solo authenticated) ───
REVOKE EXECUTE ON FUNCTION muzicmania.update_track_like_count() FROM anon;