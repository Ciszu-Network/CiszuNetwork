-- ============================================================
-- 20260824000023_global_advisor_settings_deliveries.sql
-- Extiende GLOBAL_ADVISOR_SYSTEM:
--   1) global_announcement_settings: kill switch global (enabled).
--      El devcon lo apaga/enciende con service role para poder DETENER
--      todos los mensajes globales al instante si el sistema se ve
--      comprometido. El front consulta este flag en cada poll.
--   2) global_announcement_deliveries: confirmación de entrega por web.
--      Cada GlobalAdvisor marca (upsert) que recibió un anuncio; el devcon
--      usa --wait para esperar a que TODAS las webs destino confirmen.
-- Idempotente.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;

-- ============================================================
-- Kill switch global (fila única id=1)
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_announcement_settings (
  id INT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO ciszunetwork.global_announcement_settings (id, enabled)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE ciszunetwork.global_announcement_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede LEER el flag (el front lo consulta).
DROP POLICY IF EXISTS "Anyone can read advisor settings" ON ciszunetwork.global_announcement_settings;
CREATE POLICY "Anyone can read advisor settings"
  ON ciszunetwork.global_announcement_settings FOR SELECT
  USING (TRUE);

-- SOLO admins/staff pueden APAGAR/ENCENDER (el devcon usa service role).
DROP POLICY IF EXISTS "Only admins update advisor settings" ON ciszunetwork.global_announcement_settings;
CREATE POLICY "Only admins update advisor settings"
  ON ciszunetwork.global_announcement_settings FOR UPDATE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid()
    )
  );

-- ============================================================
-- Confirmación de entrega por sitio (telemetría)
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_announcement_deliveries (
  announcement_id BIGINT NOT NULL REFERENCES ciszunetwork.global_announcements(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, site)
);

ALTER TABLE ciszunetwork.global_announcement_deliveries ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede LEER entregas (el devcon consulta para el --wait).
DROP POLICY IF EXISTS "Anyone can read deliveries" ON ciszunetwork.global_announcement_deliveries;
CREATE POLICY "Anyone can read deliveries"
  ON ciszunetwork.global_announcement_deliveries FOR SELECT
  USING (TRUE);

-- El front (anon/authenticated) marca la entrega de su sitio (upsert).
DROP POLICY IF EXISTS "Anyone can insert deliveries" ON ciszunetwork.global_announcement_deliveries;
CREATE POLICY "Anyone can insert deliveries"
  ON ciszunetwork.global_announcement_deliveries FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone can update deliveries" ON ciszunetwork.global_announcement_deliveries;
CREATE POLICY "Anyone can update deliveries"
  ON ciszunetwork.global_announcement_deliveries FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT ON ciszunetwork.global_announcement_settings TO anon, authenticated, service_role;
GRANT UPDATE ON ciszunetwork.global_announcement_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON ciszunetwork.global_announcement_deliveries TO anon, authenticated, service_role;