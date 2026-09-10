-- ============================================================
-- 20260910000007_fix_security_advisors.sql
-- Arregla advisors de seguridad reportados:
--  1. RLS policies demasiado permisivas en global_ads_deliveries.
--  2. SECURITY DEFINER en create_multilang_disclaimer() con grant
--     a anon/authenticated.
-- Idempotente.
-- ============================================================

-- ============================================================
-- 1. global_ads_deliveries: endurecer RLS
-- ============================================================

-- Borrar políticas demasiado permisivas si existen.
DROP POLICY IF EXISTS "Anyone insert ads deliveries" ON ciszunetwork.global_ads_deliveries;
DROP POLICY IF EXISTS "Anyone update ads deliveries" ON ciszunetwork.global_ads_deliveries;

-- Solo service_role puede insertar/actualizar (telemetría del sistema).
CREATE POLICY "Service role inserts ads deliveries"
  ON ciszunetwork.global_ads_deliveries
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "Service role updates ads deliveries"
  ON ciszunetwork.global_ads_deliveries
  FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Revocar grants excesivos (dejar solo service_role con escritura).
REVOKE INSERT, UPDATE ON ciszunetwork.global_ads_deliveries FROM anon, authenticated;
GRANT SELECT ON ciszunetwork.global_ads_deliveries TO anon, authenticated, service_role;
GRANT INSERT, UPDATE ON ciszunetwork.global_ads_deliveries TO service_role;

-- ============================================================
-- 2. create_multilang_disclaimer(): quitar SECURITY DEFINER y
--    restringir ejecución a service_role.
-- ============================================================

-- Si existe la función, reemplazarla por SECURITY INVOKER.
DROP FUNCTION IF EXISTS ciszunetwork.create_multilang_disclaimer(
  TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, JSONB
);

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

-- Solo service_role puede ejecutar esta RPC (el devcon/usado internamente).
GRANT EXECUTE ON FUNCTION ciszunetwork.create_multilang_disclaimer(
  TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, JSONB
) TO service_role;

REVOKE EXECUTE ON FUNCTION ciszunetwork.create_multilang_disclaimer(
  TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, JSONB
) FROM anon, authenticated;
