-- ============================================================
-- 20260831000026_ads_impressions.sql
-- Registro de impresiones de anuncios del ecosistema (sistema ADS).
-- Cada vez que un usuario ve un anuncio (modal, esquina o banner), el
-- front registra una fila: qué anuncio, de qué tipo (intrusive /
-- particulares / reward / optional), si es patrocinado oficial de
-- Ciszu Network o de terceros (source), en qué web (site) y, si está
-- autenticado, el user_id (para reportes "anuncios vistos por usuario").
-- Idempotente.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;

CREATE TABLE IF NOT EXISTS ciszunetwork.ads_impressions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site TEXT NOT NULL,
  ad_id TEXT NOT NULL,
  ad_type TEXT NOT NULL,            -- intrusive | particulares | reward | optional
  ad_source TEXT NOT NULL DEFAULT 'external', -- ciszunetwork | muzicmania | ... | external
  user_id UUID,                     -- null si el usuario no está autenticado
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ads_impressions_seen_at_idx
  ON ciszunetwork.ads_impressions (seen_at DESC);
CREATE INDEX IF NOT EXISTS ads_impressions_user_idx
  ON ciszunetwork.ads_impressions (user_id);

ALTER TABLE ciszunetwork.ads_impressions ENABLE ROW LEVEL SECURITY;

-- Cualquiera (anon/authenticated) puede INSERTAR impresiones de anuncios
-- (es la telemetría del sistema; no expone datos del usuario salvo su id).
DROP POLICY IF EXISTS "Anyone can insert ads impressions" ON ciszunetwork.ads_impressions;
CREATE POLICY "Anyone can insert ads impressions"
  ON ciszunetwork.ads_impressions FOR INSERT
  WITH CHECK (true);

-- Solo lectura para admin/service_role (reportes de anuncios vistos).
DROP POLICY IF EXISTS "Admins can read ads impressions" ON ciszunetwork.ads_impressions;
CREATE POLICY "Admins can read ads impressions"
  ON ciszunetwork.ads_impressions FOR SELECT
  USING (auth.role() = 'service_role');