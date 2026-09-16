-- ============================================================
-- 20260916000001_global_changelogs.sql
-- Sistema de CHANGELOGS GLOBALES (replica el patron de GLOBAL_ADS /
-- GLOBAL_DISCLAIMERS): el admin publica entradas de changelog desde el
-- devcon a una o varias webs (o global); cada web las muestra en su
-- registro de cambios y confirma entrega (fallback "pendiente").
--
-- Idempotente: se puede re-aplicar sin romper nada.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;
GRANT USAGE ON SCHEMA ciszunetwork TO anon, authenticated, service_role;

-- ============================================================
-- Entradas de changelog
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_changelogs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Identificador de ruta en la web (/changelog/<slug>). Unico: una entrada
  -- puede apuntar a varias webs y comparte contenido.
  slug TEXT NOT NULL,
  version TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  -- Bitacora interna: [{ "text": "...", "type": "build" }, ...]
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Frases destacadas de la pagina interna
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Etiquetas (ChangelogType): add, hotfix, sec, perf, ...
  types TEXT[] NOT NULL DEFAULT ARRAY['add']::text[],
  -- Icono del catalogo compartido (CHANGELOG_ICON_OPTIONS) para el preview
  icon TEXT NOT NULL DEFAULT 'history',
  -- Ciclo de vida visible en la web
  status TEXT NOT NULL DEFAULT 'released'
    CHECK (status IN ('planned', 'in-progress', 'released', 'hotfix')),
  -- Fase/roadmap a la que pertenece (texto libre: "PATCH V2.4.0")
  phase TEXT,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at TIMESTAMPTZ,
  -- 'global' o lista de webs separada por comas (ciszu,ciszukoantony,...)
  target TEXT NOT NULL DEFAULT 'global',
  author TEXT NOT NULL DEFAULT 'CiszukoAntony',
  sender TEXT NOT NULL DEFAULT 'admin',
  source TEXT NOT NULL DEFAULT 'dev-console',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT global_changelogs_slug_key UNIQUE (slug)
);

ALTER TABLE ciszunetwork.global_changelogs ENABLE ROW LEVEL SECURITY;

-- Cualquiera (anon/authenticated) puede LEER entradas publicadas y vigentes.
DROP POLICY IF EXISTS "Anyone can read global changelogs" ON ciszunetwork.global_changelogs;
CREATE POLICY "Anyone can read global changelogs"
  ON ciszunetwork.global_changelogs FOR SELECT
  USING (published AND (expires_at IS NULL OR expires_at > NOW()));

-- SOLO admins/staff pueden INSERTAR.
DROP POLICY IF EXISTS "Only admins insert global changelogs" ON ciszunetwork.global_changelogs;
CREATE POLICY "Only admins insert global changelogs"
  ON ciszunetwork.global_changelogs FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid())
  );

-- SOLO admins/staff pueden ACTUALIZAR (editar / despublicar).
DROP POLICY IF EXISTS "Only admins update global changelogs" ON ciszunetwork.global_changelogs;
CREATE POLICY "Only admins update global changelogs"
  ON ciszunetwork.global_changelogs FOR UPDATE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid())
  );

-- SOLO admins/staff pueden BORRAR.
DROP POLICY IF EXISTS "Only admins delete global changelogs" ON ciszunetwork.global_changelogs;
CREATE POLICY "Only admins delete global changelogs"
  ON ciszunetwork.global_changelogs FOR DELETE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS global_changelogs_created_idx
  ON ciszunetwork.global_changelogs (created_at DESC);
CREATE INDEX IF NOT EXISTS global_changelogs_release_idx
  ON ciszunetwork.global_changelogs (release_date DESC);

-- ============================================================
-- Kill switch (fila unica id=1)
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_changelogs_settings (
  id INT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO ciszunetwork.global_changelogs_settings (id, enabled)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE ciszunetwork.global_changelogs_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read changelogs settings" ON ciszunetwork.global_changelogs_settings;
CREATE POLICY "Anyone read changelogs settings"
  ON ciszunetwork.global_changelogs_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins update changelogs settings" ON ciszunetwork.global_changelogs_settings;
CREATE POLICY "Only admins update changelogs settings"
  ON ciszunetwork.global_changelogs_settings FOR UPDATE
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid())
  )
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM ciszunetwork.staff_members s WHERE s.user_id = auth.uid())
  );

-- ============================================================
-- Confirmacion de entrega por sitio (telemetria del devcon --wait y del
-- fallback "pendiente hasta su creacion" por web).
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_changelog_deliveries (
  entry_id BIGINT NOT NULL REFERENCES ciszunetwork.global_changelogs(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entry_id, site)
);

ALTER TABLE ciszunetwork.global_changelog_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read changelog deliveries" ON ciszunetwork.global_changelog_deliveries;
CREATE POLICY "Anyone read changelog deliveries"
  ON ciszunetwork.global_changelog_deliveries FOR SELECT
  USING (TRUE);

-- El front (anon/authenticated) marca la entrega de su sitio (upsert).
DROP POLICY IF EXISTS "Anyone insert changelog deliveries" ON ciszunetwork.global_changelog_deliveries;
CREATE POLICY "Anyone insert changelog deliveries"
  ON ciszunetwork.global_changelog_deliveries FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone update changelog deliveries" ON ciszunetwork.global_changelog_deliveries;
CREATE POLICY "Anyone update changelog deliveries"
  ON ciszunetwork.global_changelog_deliveries FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT ON ciszunetwork.global_changelogs TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON ciszunetwork.global_changelogs TO service_role;
GRANT SELECT ON ciszunetwork.global_changelogs_settings TO anon, authenticated, service_role;
GRANT UPDATE ON ciszunetwork.global_changelogs_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON ciszunetwork.global_changelog_deliveries TO anon, authenticated, service_role;
