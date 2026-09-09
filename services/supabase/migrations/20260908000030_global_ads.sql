-- ============================================================
-- 20260908000030_global_ads.sql
-- Sistema de ADS GLOBALES (replica el patrón de GLOBAL_DISCLAIMERS).
-- El admin envía anuncios desde el devcon a una o varias webs (o global);
-- cada web los muestra en su AdsProvider y confirma entrega.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;

-- ============================================================
-- Tabla de anuncios globales
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_ads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender TEXT NOT NULL DEFAULT 'admin',
  source TEXT NOT NULL DEFAULT 'dev-console',
  -- Contenido del anuncio
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT 'Abrir',
  href TEXT NOT NULL DEFAULT 'https://ciszunetwork.vercel.app',
  -- Tipo de anuncio: intrusive | particulares | reward | optional
  type TEXT NOT NULL DEFAULT 'particulares' CHECK (type IN ('intrusive','particulares','reward','optional')),
  -- Fuente: web oficial de Ciszu Network o external (terceros)
  source_web TEXT NOT NULL DEFAULT 'external',
  -- Marca oficial a usar como isotipo (opcional; si source_web es oficial)
  brand TEXT,
  -- true = anuncio de recompensa forzado
  require_reward BOOLEAN NOT NULL DEFAULT FALSE,
  -- Target: 'global' o lista de webs (ciszu, ciszukoantony, muzicmania, ciszubot)
  target TEXT NOT NULL DEFAULT 'global',
  -- Timestamp de culminación (opcional; si pasa, el front lo auto-cierra)
  expires_at TIMESTAMPTZ,
  -- Fecha de inicio opcional (rango "inicio - culminación" en el contador)
  starts_at TIMESTAMPTZ,
  -- Creado en
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ciszunetwork.global_ads ENABLE ROW LEVEL SECURITY;

-- Cualquier persona (anon/authenticated) puede LEER anuncios activos.
CREATE POLICY "Anyone can read global ads"
  ON ciszunetwork.global_ads FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

-- SOLO admins/staff pueden INSERTAR.
CREATE POLICY "Only admins insert global ads"
  ON ciszunetwork.global_ads FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- SOLO admins/staff pueden actualizar (borrar / editar).
CREATE POLICY "Only admins update global ads"
  ON ciszunetwork.global_ads FOR UPDATE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- SOLO admins/staff pueden borrar.
CREATE POLICY "Only admins delete global ads"
  ON ciszunetwork.global_ads FOR DELETE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- ============================================================
-- Kill switch global (fila única id=1)
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_ads_settings (
  id INT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO ciszunetwork.global_ads_settings (id, enabled)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE ciszunetwork.global_ads_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede LEER el flag.
CREATE POLICY "Anyone read ads settings"
  ON ciszunetwork.global_ads_settings FOR SELECT
  USING (TRUE);

-- SOLO admins/staff pueden APAGAR/ENCENDER.
CREATE POLICY "Only admins update ads settings"
  ON ciszunetwork.global_ads_settings FOR UPDATE
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
-- Confirmación de entrega por sitio (telemetría para el devcon --wait)
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_ads_deliveries (
  ad_id BIGINT NOT NULL REFERENCES ciszunetwork.global_ads(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ad_id, site)
);

ALTER TABLE ciszunetwork.global_ads_deliveries ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede LEER entregas (el devcon consulta para el --wait).
CREATE POLICY "Anyone read ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR SELECT
  USING (TRUE);

-- El front (anon/authenticated) marca la entrega de su sitio (upsert).
CREATE POLICY "Anyone insert ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone update ads deliveries"
  ON ciszunetwork.global_ads_deliveries FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT ON ciszunetwork.global_ads TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON ciszunetwork.global_ads TO service_role;
GRANT SELECT ON ciszunetwork.global_ads_settings TO anon, authenticated, service_role;
GRANT UPDATE ON ciszunetwork.global_ads_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON ciszunetwork.global_ads_deliveries TO anon, authenticated, service_role;