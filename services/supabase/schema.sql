-- Ciszu Network — Esquema Central de Base de Datos
-- Las migraciones en `migrations/` son la fuente de verdad.
-- Este seed se usa para desarrollo local (`supabase db seed`).
--
-- NOTA: Todas las tablas de MuzicMania viven en el schema `muzicmania`.
-- public quedó vacío. Los schemas `ciszubot` y `ciszunetwork` están
-- listos para cuando se necesiten.

-- ============================================================
-- ESQUEMAS POR PROYECTO
-- ============================================================

CREATE SCHEMA IF NOT EXISTS muzicmania;
CREATE SCHEMA IF NOT EXISTS ciszubot;
CREATE SCHEMA IF NOT EXISTS ciszunetwork;

-- ============================================================
-- CISZUNETWORK — Tabla de mensajes de contacto
-- ============================================================

CREATE TABLE IF NOT EXISTS ciszunetwork.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ciszunetwork.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages"
  ON ciszunetwork.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read messages"
  ON ciszunetwork.messages FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- CISZUBOT — Configuración de servidores y logs
-- ============================================================

CREATE TABLE IF NOT EXISTS ciszubot.guild_config (
  guild_id TEXT PRIMARY KEY,
  prefix TEXT DEFAULT '/',
  mod_role_id TEXT,
  admin_role_id TEXT,
  welcome_channel_id TEXT,
  log_channel_id TEXT,
  music_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ciszubot.guild_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage guild config"
  ON ciszubot.guild_config USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS ciszubot.command_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  command TEXT NOT NULL,
  args JSONB,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ciszubot.command_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage command logs"
  ON ciszubot.command_logs USING (true)
  WITH CHECK (true);
