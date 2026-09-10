-- ============================================================
-- 20260910000001_global_disclaimers_multilang.sql
-- Multi-idioma para disclaimers globales:
--  1. message_i18n (JSONB) almacena mensajes por idioma.
--  2. RPC create_multilang_disclaimer() inserta con soporte i18n.
-- Idempotente.
-- ============================================================

-- 1. Columna i18n (nullable para backward compatibility).
ALTER TABLE ciszunetwork.global_disclaimers
  ADD COLUMN IF NOT EXISTS message_i18n JSONB;

-- 2. RPC para crear disclaimer multi-idioma.
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
SECURITY DEFINER
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

-- 3. Grants para la RPC (service_role la usa el devcon; anon/authenticated pueden consultar).
GRANT EXECUTE ON FUNCTION ciszunetwork.create_multilang_disclaimer(
  TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, JSONB
) TO service_role, anon, authenticated;
