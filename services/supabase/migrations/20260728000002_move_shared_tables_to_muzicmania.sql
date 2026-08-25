-- Ciszu Network — Mover tablas compartidas a muzicmania
-- MuzicMania opera 100% independiente; public queda vacío.

-- ============================================================
-- 1. MOVER TABLAS RESTANTES A muzicmania
-- ============================================================

ALTER TABLE IF EXISTS public.profiles SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.deleted_accounts SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.support_tickets SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.tickets SET SCHEMA muzicmania;

-- ============================================================
-- 2. ACTUALIZAR FUNCIONES DE TRIGGER (se quedan en public
--    porque auth.users las llama sin schema)
-- ============================================================

-- 2a. handle_new_user() — inserta en profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public, extensions'
AS $$
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
    1, 0, 0, 0, 0, 0,
    'private',
    false
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

-- 2b. check_username_available()
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$;

-- 2c. get_email_by_username()
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN profiles p ON u.id = p.id
  WHERE LOWER(TRIM(p.username)) = LOWER(TRIM(p_username));
  RETURN v_email;
END;
$$;

-- 2d. is_account_recoverable()
CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND deleted_at IS NOT NULL
    AND deleted_at > (NOW() - INTERVAL '30 days')
  );
END;
$$;

-- ============================================================
-- 3. ACTUALIZAR submit_game_score WRAPPER (ya en public)
--    para que apunte a muzicmania.submit_game_score
-- ============================================================

-- Ya existe y funciona correctamente, no necesita cambios.

-- ============================================================
-- 4. handle_account_deletion() — inserta en deleted_accounts
--    (ahora en muzicmania)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  INSERT INTO deleted_accounts (id, username, display_name, email_hash, reason)
  VALUES (
    OLD.id,
    OLD.username,
    OLD.display_name,
    encode(sha256(COALESCE(OLD.email, '')::bytea), 'hex'),
    'cascade_delete'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN OLD;
END;
$$;

-- ============================================================
-- 5. normalize_username() — trigger BEFORE INSERT/UPDATE
-- ============================================================

CREATE OR REPLACE FUNCTION public.normalize_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania'
AS $$
BEGIN
  NEW.username := LOWER(TRIM(NEW.username));
  RETURN NEW;
END;
$$;

-- ============================================================
-- 6. GRANT PERMISOS EN muzicmania
-- ============================================================

GRANT ALL ON ALL TABLES IN SCHEMA muzicmania TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA muzicmania TO anon, authenticated, service_role;