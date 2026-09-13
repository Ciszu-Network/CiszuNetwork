-- ============================================================
-- 20260913000001_fix_security_definer_multilang_disclaimer.sql
-- Corrige: SECURITY DEFINER -> SECURITY INVOKER en create_multilang_disclaimer
-- Resuelve lint: anon_security_definer_function_executable
--              authenticated_security_definer_function_executable
-- ============================================================

-- Cambiar la función a SECURITY INVOKER (ejecuta con permisos del caller)
CREATE OR REPLACE FUNCTION ciszunetwork.create_multilang_disclaimer(
  p_sender TEXT DEFAULT 'devcon',
  p_source TEXT DEFAULT 'dev-console',
  p_message JSONB DEFAULT '{}'::jsonb,
  p_kind TEXT DEFAULT 'info',
  p_target TEXT DEFAULT 'global',
  p_dismissible BOOLEAN DEFAULT TRUE,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_starts_at TIMESTAMPTZ DEFAULT NULL,
  p_image TEXT DEFAULT NULL,
  p_actions JSONB DEFAULT NULL
)
RETURNS ciszunetwork.global_disclaimers
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ciszunetwork, public
AS $$
DECLARE
  v_kind TEXT := COALESCE(NULLIF(p_kind, ''), 'info');
  v_row ciszunetwork.global_disclaimers;
BEGIN
  IF v_kind NOT IN ('info', 'basic', 'warning') THEN
    RAISE EXCEPTION 'kind inválido: % (info|basic|warning)', v_kind;
  END IF;

  INSERT INTO ciszunetwork.global_disclaimers
    (sender, source, message, message_i18n, kind, target, dismissible, expires_at, starts_at, image, actions)
  VALUES
    (p_sender, p_source, p_message::text, p_message, v_kind, p_target, p_dismissible, p_expires_at, p_starts_at, p_image, p_actions)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Los grants se mantienen; con SECURITY INVOKER la función ejecuta
-- con los privilegios del caller (anon/authenticated/service_role)
-- lo que respeta RLS correctamente.