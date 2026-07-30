-- ============================================================
-- MuzicMania Master Migration: Core Repair, Auto-Confirm & Integrity (v3.1)
-- Fecha: 2026-05-31
-- Propósito: 
--   1. Asegurar que las columnas faltantes (games_played, accuracy, exp, rank, birth_privacy) existan en public.profiles.
--   2. Implementar auto-confirmación de email en auth.users (BEFORE INSERT) para evitar esperas y correos de confirmación.
--   3. Sincronizar handle_new_user robusto inicializando todas las columnas necesarias.
--   4. Corregir y mejorar la función submit_game_score para usar las columnas adecuadas, actualizar la precisión promedio e incrementar games_played.
--   5. Hacer que get_email_by_username sea case-insensitive.
--   6. Curar y reparar retroactivamente las cuentas con perfiles faltantes (404) o usernames corruptos (@usser).
-- ============================================================

-- ------------------------------------------------------------
-- PASO 1: Asegurar la existencia de todas las columnas requeridas en profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accuracy NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS play_time BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank INTEGER,
  ADD COLUMN IF NOT EXISTS birth_privacy TEXT DEFAULT 'private';

-- ------------------------------------------------------------
-- PASO 2: Crear función y trigger para auto-confirmar emails
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Confirmar automáticamente el email antes de insertar en auth.users
  new.email_confirmed_at := COALESCE(new.email_confirmed_at, now());
  new.confirmed_at := COALESCE(new.confirmed_at, now());
  RETURN new;
END;
$$;

-- Revocar privilegios públicos por seguridad
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user_email() FROM public;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user_email() FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user_email() FROM authenticated;

-- Crear trigger BEFORE INSERT
DROP TRIGGER IF EXISTS tr_auto_confirm_user_email ON auth.users;
CREATE TRIGGER tr_auto_confirm_user_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user_email();

-- ------------------------------------------------------------
-- PASO 3: Re-crear función handle_new_user con lógica ultra-robusta
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  -- Normalizar username: usar el provisto, o usar el prefijo del email si no viene, siempre en minúsculas y sin espacios
  v_username := LOWER(TRIM(COALESCE(
    NULLIF(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )));

  -- Si por alguna razón el username sigue siendo demasiado corto o nulo, usar un prefijo de seguridad con su ID
  IF v_username IS NULL OR char_length(v_username) < 3 THEN
    v_username := 'user_' || substring(new.id::text from 1 for 8);
  END IF;

  -- Display name: usar el provisto, o usar el username limpio
  v_display_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );

  INSERT INTO public.profiles (
    id, username, display_name, avatar_url, email,
    country, birth_date, first_name, last_name, phone, role,
    level, xp, exp, games_played, accuracy, high_score, birth_privacy
  )
  VALUES (
    new.id,
    v_username,
    v_display_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'country',
    NULLIF(new.raw_user_meta_data->>'birth_date', '')::date,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'user',
    1, -- level
    0, -- xp
    0, -- exp
    0, -- games_played
    0, -- accuracy
    0, -- high_score
    'private' -- birth_privacy
  )
  ON CONFLICT (id) DO UPDATE
  SET
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
$$;

-- Revocar privilegios públicos por seguridad
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Asegurar trigger AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- PASO 4: Corregir y optimizar la función de envío de puntuaciones submit_game_score
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_game_score(
    p_track_id TEXT,
    p_score INTEGER,
    p_combo INTEGER,
    p_accuracy NUMERIC,
    p_grade TEXT,
    p_max_combo INTEGER,
    p_perfect INTEGER,
    p_great INTEGER,
    p_good INTEGER,
    p_miss INTEGER,
    p_duration_seconds INTEGER DEFAULT 120
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_exp_gained INTEGER;
    v_current_exp INTEGER;
    v_current_level INTEGER;
    v_current_high_score INTEGER;
    v_new_level INTEGER;
    v_avg_accuracy NUMERIC;
BEGIN
    -- Obtener el ID del usuario autenticado
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validación de seguridad básica para evitar puntuaciones imposibles
    IF p_score < 0 OR p_score > 9999999 OR p_accuracy < 0 OR p_accuracy > 100 THEN
        RAISE EXCEPTION 'Invalid score parameters detected.';
    END IF;

    -- Calcular EXP ganada basándose en puntuación y precisión (fórmula segura en backend)
    v_exp_gained := GREATEST(10, (p_score / 1000) * (p_accuracy / 100));

    -- Insertar el registro de la partida en la tabla scores
    INSERT INTO public.scores (
        user_id, track_id, score, combo, accuracy, grade, 
        max_combo, perfect, great, good, miss
    ) VALUES (
        v_user_id, p_track_id, p_score, p_combo, p_accuracy, p_grade, 
        p_max_combo, p_perfect, p_great, p_good, p_miss
    );

    -- Obtener las estadísticas actuales del perfil (asegurando COALESCE)
    SELECT COALESCE(exp, xp, 0), COALESCE(level, 1), COALESCE(high_score, 0)
    INTO v_current_exp, v_current_level, v_current_high_score
    FROM public.profiles WHERE id = v_user_id;

    -- Actualizar puntuación máxima si corresponde
    IF p_score > COALESCE(v_current_high_score, 0) THEN
        v_current_high_score := p_score;
    END IF;

    -- Calcular nuevo nivel y EXP
    v_current_exp := v_current_exp + v_exp_gained;
    v_new_level := GREATEST(v_current_level, FLOOR(v_current_exp / 1000) + 1);

    -- Calcular la precisión promedio acumulada del usuario
    SELECT ROUND(AVG(accuracy), 2) INTO v_avg_accuracy
    FROM public.scores WHERE user_id = v_user_id;

    -- Actualizar el perfil del usuario de forma atómica y segura
    UPDATE public.profiles SET 
        exp = v_current_exp,
        xp = v_current_exp, -- Sincronizar ambas columnas por compatibilidad total
        level = v_new_level,
        high_score = v_current_high_score,
        games_played = COALESCE(games_played, 0) + 1,
        accuracy = COALESCE(v_avg_accuracy, p_accuracy)
    WHERE id = v_user_id;

END;
$$;

-- Asegurar los permisos correctos de ejecución para usuarios autenticados
REVOKE EXECUTE ON FUNCTION public.submit_game_score FROM public;
REVOKE EXECUTE ON FUNCTION public.submit_game_score FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_game_score TO authenticated;

-- ------------------------------------------------------------
-- PASO 5: Mejorar get_email_by_username para ser case-insensitive y seguro
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE LOWER(TRIM(p.username)) = LOWER(TRIM(p_username));
  
  RETURN v_email;
END;
$$;

-- Permisos de ejecución del endpoint get_email_by_username
REVOKE EXECUTE ON FUNCTION public.get_email_by_username(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------
-- PASO 6: Curación y Reparación Retroactiva Completa
-- ------------------------------------------------------------

-- A. Crear perfiles faltantes para usuarios de auth.users que no tienen perfil (evita 404s)
INSERT INTO public.profiles (
  id, username, display_name, email, role,
  level, xp, exp, games_played, accuracy, high_score, birth_privacy
)
SELECT 
  u.id, 
  LOWER(TRIM(COALESCE(NULLIF(u.raw_user_meta_data->>'username', ''), split_part(u.email, '@', 1)))),
  COALESCE(NULLIF(u.raw_user_meta_data->>'display_name', ''), LOWER(TRIM(COALESCE(NULLIF(u.raw_user_meta_data->>'username', ''), split_part(u.email, '@', 1))))),
  u.email,
  'user',
  1, 0, 0, 0, 0, 0, 'private'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- B. Reparar perfiles con usernames vacíos, nulos o por defecto bugeados (corrige "@usser")
UPDATE public.profiles p
SET
  username = LOWER(TRIM(COALESCE(
    NULLIF(u.raw_user_meta_data->>'username', ''),
    split_part(u.email, '@', 1)
  ))),
  display_name = COALESCE(
    NULLIF(u.raw_user_meta_data->>'display_name', ''),
    LOWER(TRIM(COALESCE(
      NULLIF(u.raw_user_meta_data->>'username', ''),
      split_part(u.email, '@', 1)
    )))
  ),
  email = COALESCE(p.email, u.email),
  level = COALESCE(p.level, 1),
  xp = COALESCE(p.xp, p.exp, 0),
  exp = COALESCE(p.exp, p.xp, 0),
  games_played = COALESCE(p.games_played, 0),
  accuracy = COALESCE(p.accuracy, 0),
  high_score = COALESCE(p.high_score, 0),
  birth_privacy = COALESCE(p.birth_privacy, 'private')
FROM auth.users u
WHERE p.id = u.id
  AND (p.username IS NULL OR p.username = '' OR p.username = 'user');

-- C. En caso de que el username final sea menor a 3 caracteres (regla del constraint), asignarle sufijo
UPDATE public.profiles
SET username = 'user_' || substring(id::text from 1 for 8)
WHERE char_length(username) < 3;
