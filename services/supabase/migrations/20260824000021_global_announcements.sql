-- ============================================================
-- 20260824000021_global_announcements.sql
-- Sistema de mensajes globales (GLOBAL_ADVISOR_SYSTEM, TODO #3)
-- Tabla de anuncios/mensajes que el admin envía desde la dev console
-- a una o varias webs del ecosistema (o global).
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ciszunetwork;

-- ============================================================
-- Tabla de staff (quién puede enviar mensajes globales)
-- Se crea ANTES porque las políticas de global_announcements la referencian.
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.staff_members (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ciszunetwork.staff_members ENABLE ROW LEVEL SECURITY;

-- El propio staff puede ver su fila; admins ven todo.
CREATE POLICY "Staff can read own"
  ON ciszunetwork.staff_members FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- SOLO admins gestionan el staff.
CREATE POLICY "Only admins manage staff"
  ON ciszunetwork.staff_members FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- Tabla de anuncios globales
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.global_announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Quién lo envió y desde dónde (dev console / web / API)
  sender TEXT NOT NULL DEFAULT 'admin',
  source TEXT NOT NULL DEFAULT 'dev-console',
  -- Mensaje (texto plano; el front lo renderiza escapado)
  message TEXT NOT NULL,
  -- Tipo de toast: info | success | warning | error
  kind TEXT NOT NULL DEFAULT 'info' CHECK (kind IN ('info','success','warning','error')),
  -- Target: 'global' o lista de webs (ciszu, ciszukoantony, muzicmania, ciszubot)
  target TEXT NOT NULL DEFAULT 'global',
  -- Timestamp de expiración (opcional; si pasa, el front no lo muestra)
  expires_at TIMESTAMPTZ,
  -- Creado en
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ciszunetwork.global_announcements ENABLE ROW LEVEL SECURITY;

-- Cualquier persona (anon/authenticated) puede LEER anuncios activos.
-- El front filtra por target (matching web) y por expiración.
CREATE POLICY "Anyone can read announcements"
  ON ciszunetwork.global_announcements FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

-- SOLO admins (staff) pueden INSERTAR.
CREATE POLICY "Only admins can insert announcements"
  ON ciszunetwork.global_announcements FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- SOLO admins pueden actualizar (borrar / editar) anuncios.
CREATE POLICY "Only admins can update announcements"
  ON ciszunetwork.global_announcements FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- SOLO admins pueden borrar anuncios.
CREATE POLICY "Only admins can delete announcements"
  ON ciszunetwork.global_announcements FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM ciszunetwork.staff_members s
      WHERE s.user_id = auth.uid()
    )
  );

-- ============================================================
-- Registro de anuncios vistos por usuario (para "resetear notif" del usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS ciszunetwork.announcement_reads (
  announcement_id BIGINT NOT NULL REFERENCES ciszunetwork.global_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

ALTER TABLE ciszunetwork.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Un usuario puede marcar/ver sus propios reads.
CREATE POLICY "Users can read own reads"
  ON ciszunetwork.announcement_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reads"
  ON ciszunetwork.announcement_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Permisos de esquema
-- ============================================================
GRANT USAGE ON SCHEMA ciszunetwork TO anon, authenticated, service_role;
GRANT SELECT ON ciszunetwork.global_announcements TO anon, authenticated, service_role;
GRANT SELECT ON ciszunetwork.announcement_reads TO authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON ciszunetwork.global_announcements TO service_role;
GRANT INSERT ON ciszunetwork.announcement_reads TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ciszunetwork.staff_members TO service_role;