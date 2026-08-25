-- ============================================================
-- MuzicMania: SCRIPT DE EMERGENCIA - REPARACIÓN DE AUTH
-- Fecha: 2026-05-23
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Propósito: Re-aplicar trigger de perfiles + desactivar email confirm
-- ============================================================

-- ============================================================
-- PASO 1: Re-crear la función handle_new_user con lógica robusta
-- ============================================================
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
  -- Normalizar username: usar el provisto, o usar prefijo del email, siempre en minúsculas
  v_username := LOWER(TRIM(COALESCE(
    NULLIF(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )));

  -- Display name: usar el provisto, o usar el username limpio
  v_display_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );

  INSERT INTO public.profiles (
    id, username, display_name, avatar_url, email,
    country, birth_date, first_name, last_name, phone
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
    new.raw_user_meta_data->>'phone'
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

-- ============================================================
-- PASO 2: Re-crear el trigger (en caso de que la DB fue reseteada)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PASO 3: Reparar perfiles existentes con username vacío/nulo
-- Esto corrige los usuarios que ya se registraron y quedaron con "@usser"
-- ============================================================
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
  email = COALESCE(p.email, u.email)
FROM auth.users u
WHERE p.id = u.id
  AND (p.username IS NULL OR p.username = '');

-- ============================================================
-- PASO 4: Verificar resultado
-- Deberías ver tus perfiles con username correcto
-- ============================================================
SELECT id, username, display_name, email FROM public.profiles;
