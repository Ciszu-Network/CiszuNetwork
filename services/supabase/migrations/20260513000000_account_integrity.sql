-- MuzicMania Migration: Account Integrity System (v2.2)
-- Fecha: 2026-05-13
-- Propósito: Sistema de integridad de cuentas:
--   1. Unique constraint en username (ya existía, se asegura)
--   2. Unique constraint en phone (nuevo)
--   3. Tabla deleted_accounts para preservar IDs de cuentas eliminadas
--   4. Índice único en username case-insensitive
--   5. Función RPC para verificar disponibilidad de username/email
--   6. Columna role en profiles
--   7. Trigger para normalizar username a minúsculas al insertar/actualizar

-- ============================================================
-- 1. ASEGURAR UNIQUE EN USERNAME (case-insensitive)
-- ============================================================
-- Eliminar el constraint de unicidad simple si existe y crear uno case-insensitive
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Crear índice único case-insensitive para username
DROP INDEX IF EXISTS idx_profiles_username_lower;
CREATE UNIQUE INDEX idx_profiles_username_lower 
  ON public.profiles (LOWER(username));

-- ============================================================
-- 2. UNIQUE EN PHONE (opcional, solo si no es vacío)
-- ============================================================
DROP INDEX IF EXISTS idx_profiles_phone_unique;
CREATE UNIQUE INDEX idx_profiles_phone_unique 
  ON public.profiles (phone) 
  WHERE phone IS NOT NULL AND phone != '';

-- ============================================================
-- 3. COLUMNA ROLE EN PROFILES
-- ============================================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS email TEXT; -- Cache del email para consultas rápidas

-- Rellenar el email desde auth.users si está vacío
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- ============================================================
-- 4. TABLA DE CUENTAS ELIMINADAS (preserva IDs permanentemente)
-- ============================================================
-- Cuando una cuenta se elimina, su UUID se guarda aquí para siempre.
-- Esto garantiza que ningún recurso vinculado (scores, reviews, etc.) 
-- quede huérfano sin referencia y se puede mostrar como "[Usuario Eliminado]".
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id UUID PRIMARY KEY,                                          -- El mismo UUID de auth.users
  username TEXT,                                                -- Username al momento de eliminar
  display_name TEXT,                                            -- Nombre al momento de eliminar
  email_hash TEXT,                                              -- Hash del email (no guardar en claro)
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  reason TEXT DEFAULT 'user_request'                           -- Razón de eliminación
);

ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver cuentas eliminadas
DROP POLICY IF EXISTS "Solo admins ven cuentas eliminadas" ON public.deleted_accounts;
CREATE POLICY "Solo admins ven cuentas eliminadas" ON public.deleted_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
    )
  );

-- ============================================================
-- 5. TRIGGER: Guardar en deleted_accounts cuando se borra un perfil
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.deleted_accounts (id, username, display_name, email_hash, reason)
  VALUES (
    OLD.id,
    OLD.username,
    OLD.display_name,
    -- Hash del email para referencia sin exponer datos personales
    encode(sha256(COALESCE(OLD.email, '')::bytea), 'hex'),
    'cascade_delete'
  )
  ON CONFLICT (id) DO NOTHING; -- No duplicar si ya existe
  RETURN OLD;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_account_deletion() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_account_deletion() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_account_deletion() FROM authenticated;

DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
CREATE TRIGGER on_profile_deleted
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_account_deletion();

-- ============================================================
-- 6. TRIGGER: Normalizar username a minúsculas siempre
-- ============================================================
CREATE OR REPLACE FUNCTION public.normalize_username()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.username = LOWER(TRIM(NEW.username));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_username_on_upsert ON public.profiles;
CREATE TRIGGER normalize_username_on_upsert
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_username();

-- ============================================================
-- 7. FUNCIÓN RPC: Verificar disponibilidad de username
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$;

-- Permitir que usuarios anónimos llamen a esta función (necesario para el registro)
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO authenticated;

-- ============================================================
-- 8. ACTUALIZAR handle_new_user PARA SINCRONIZAR EMAIL
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Normalizar username: usar el provisto, sino prefijo del email, en minúsculas
  v_username := LOWER(TRIM(COALESCE(
    new.raw_user_meta_data->>'username', 
    split_part(new.email, '@', 1)
  )));

  INSERT INTO public.profiles (
    id, username, display_name, avatar_url, email,
    country, birth_date, first_name, last_name, phone
  )
  VALUES (
    new.id,
    v_username,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
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
    username     = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    email        = EXCLUDED.email,
    first_name   = EXCLUDED.first_name,
    last_name    = EXCLUDED.last_name,
    birth_date   = EXCLUDED.birth_date,
    country      = EXCLUDED.country,
    phone        = EXCLUDED.phone;

  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Re-crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 9. NOTAS PARA EL DESARROLLADOR
-- ============================================================
-- Para ejecutar este script:
-- 1. Ir al Dashboard de Supabase > SQL Editor
-- 2. Pegar y ejecutar todo el contenido
-- 3. Verificar en Table Editor que deleted_accounts existe
-- 4. Verificar en Database > Functions que check_username_available existe
