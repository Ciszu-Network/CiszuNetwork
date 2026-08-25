-- ============================================================
-- 20260824000022_global_announcements_fix.sql
-- Completa la migración 21 (que se aplicó en 2 pasos por orden de
-- dependencias). Añade la tabla announcement_reads (faltante) y
-- garantiza los grants. Idempotente.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;

-- Registro de anuncios vistos por usuario
CREATE TABLE IF NOT EXISTS ciszunetwork.announcement_reads (
  announcement_id BIGINT NOT NULL REFERENCES ciszunetwork.global_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

ALTER TABLE ciszunetwork.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Un usuario puede marcar/ver sus propios reads.
DROP POLICY IF EXISTS "Users can read own reads" ON ciszunetwork.announcement_reads;
CREATE POLICY "Users can read own reads"
  ON ciszunetwork.announcement_reads FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reads" ON ciszunetwork.announcement_reads;
CREATE POLICY "Users can insert own reads"
  ON ciszunetwork.announcement_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT USAGE ON SCHEMA ciszunetwork TO anon, authenticated, service_role;
GRANT SELECT ON ciszunetwork.global_announcements TO anon, authenticated, service_role;
GRANT SELECT ON ciszunetwork.announcement_reads TO authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON ciszunetwork.global_announcements TO service_role;
GRANT INSERT ON ciszunetwork.announcement_reads TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ciszunetwork.staff_members TO service_role;