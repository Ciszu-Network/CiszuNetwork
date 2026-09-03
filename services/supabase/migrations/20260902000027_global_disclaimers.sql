-- ============================================================
-- 20260902000027_global_disclaimers.sql
-- Sistema de DISCLAIMERS GLOBALES (replica el patrón de GLOBAL_ADVISOR_SYSTEM).
-- El admin envía disclaimers desde el devcon a una o varias webs (o global);
-- cada web los muestra en su DisclaimerStack (cabecera) y confirma entrega.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;

-- ============================================================
-- Tabla de disclaimers globales
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_disclaimers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender TEXT NOT NULL DEFAULT 'admin',
  source TEXT NOT NULL DEFAULT 'dev-console',
  -- Mensaje (texto plano; el front lo renderiza escapado)
  message TEXT NOT NULL,
  -- Tipo de disclaimer: info | beta | warning
  kind TEXT NOT NULL DEFAULT 'info' CHECK (kind IN ('info','beta','warning')),
  -- Target: 'global' o lista de webs (ciszu, ciszukoantony, muzicmania, ciszubot)
  target TEXT NOT NULL DEFAULT 'global',
  -- false = obligatorio (sin botón X)
  dismissible BOOLEAN NOT NULL DEFAULT TRUE,
  -- Timestamp de culminación (opcional; si pasa, el front lo auto-cierra)
  expires_at TIMESTAMPTZ,
  -- Imagen opcional (URL)
  image TEXT,
  -- Creado en
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ciszunetwork.global_disclaimers ENABLE ROW LEVEL SECURITY;

-- Cualquier persona (anon/authenticated) puede LEER disclaimers activos.
CREATE POLICY "Anyone can read global disclaimers"
  ON ciszunetwork.global_disclaimers FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

-- SOLO admins/staff pueden INSERTAR.
CREATE POLICY "Only admins insert global disclaimers"
  ON ciszunetwork.global_disclaimers FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- SOLO admins/staff pueden actualizar (borrar / editar).
CREATE POLICY "Only admins update global disclaimers"
  ON ciszunetwork.global_disclaimers FOR UPDATE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- SOLO admins/staff pueden borrar.
CREATE POLICY "Only admins delete global disclaimers"
  ON ciszunetwork.global_disclaimers FOR DELETE
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
CREATE TABLE IF NOT EXISTS ciszunetwork.global_disclaimer_settings (
  id INT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO ciszunetwork.global_disclaimer_settings (id, enabled)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE ciszunetwork.global_disclaimer_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede LEER el flag.
CREATE POLICY "Anyone read disclaimer settings"
  ON ciszunetwork.global_disclaimer_settings FOR SELECT
  USING (TRUE);

-- SOLO admins/staff pueden APAGAR/ENCENDER.
CREATE POLICY "Only admins update disclaimer settings"
  ON ciszunetwork.global_disclaimer_settings FOR UPDATE
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
CREATE TABLE IF NOT EXISTS ciszunetwork.global_disclaimer_deliveries (
  disclaimer_id BIGINT NOT NULL REFERENCES ciszunetwork.global_disclaimers(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (disclaimer_id, site)
);

ALTER TABLE ciszunetwork.global_disclaimer_deliveries ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede LEER entregas (el devcon consulta para el --wait).
CREATE POLICY "Anyone read disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR SELECT
  USING (TRUE);

-- El front (anon/authenticated) marca la entrega de su sitio (upsert).
CREATE POLICY "Anyone insert disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone update disclaimer deliveries"
  ON ciszunetwork.global_disclaimer_deliveries FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT ON ciszunetwork.global_disclaimers TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON ciszunetwork.global_disclaimers TO service_role;
GRANT SELECT ON ciszunetwork.global_disclaimer_settings TO anon, authenticated, service_role;
GRANT UPDATE ON ciszunetwork.global_disclaimer_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON ciszunetwork.global_disclaimer_deliveries TO anon, authenticated, service_role;