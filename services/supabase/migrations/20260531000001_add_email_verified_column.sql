-- ============================================================
-- MuzicMania Migration: Email Verification Control & Username Strictness (v3.2)
-- Fecha: 2026-05-31
-- Propósito: 
--   1. Agregar la columna email_verified (BOOLEAN, default false) a public.profiles para distinguir el estado de verificación voluntario posterior.
--   2. Actualizar handle_new_user para asegurar la estricta eliminación de espacios en blanco en el username e inicializar email_verified en false.
-- ============================================================

-- ------------------------------------------------------------
-- PASO 1: Agregar columna email_verified a la tabla profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- ------------------------------------------------------------
-- PASO 2: Robustecer handle_new_user para eliminar espacios en username
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
  -- Normalizar username: siempre en minúsculas, sin espacios en blanco internos ni externos
  v_username := LOWER(REPLACE(TRIM(COALESCE(
    NULLIF(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )), ' ', ''));

  -- Si por alguna razón el username sigue siendo demasiado corto o nulo, usar un prefijo de seguridad con su ID
  IF v_username IS NULL OR char_length(v_username) < 3 THEN
    v_username := 'user_' || substring(new.id::text from 1 for 8);
  END IF;

  -- Display name: conserva sus mayúsculas, minúsculas y espacios originales
  v_display_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );

  INSERT INTO public.profiles (
    id, username, display_name, avatar_url, email,
    country, birth_date, first_name, last_name, phone, role,
    level, xp, exp, games_played, accuracy, high_score, birth_privacy,
    email_verified
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
    'private', -- birth_privacy
    false -- email_verified (la cuenta inicia como NO VERIFICADA voluntariamente)
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

-- Asegurar permisos correctos
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ------------------------------------------------------------
-- PASO 3: Curación retroactiva estricta para usernames existentes
-- ------------------------------------------------------------

-- A. Forzar a minúsculas y sin espacios todos los usernames de perfiles existentes
UPDATE public.profiles
SET username = LOWER(REPLACE(TRIM(username), ' ', ''))
WHERE username IS NOT NULL;

-- B. Inicializar en false el campo email_verified para todos los perfiles existentes
UPDATE public.profiles
SET email_verified = COALESCE(email_verified, false);
