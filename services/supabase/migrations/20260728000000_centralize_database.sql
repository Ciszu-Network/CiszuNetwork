-- Ciszu Network — Centralización de Base de Datos
-- Crea esquemas por proyecto para separar responsabilidades
-- Mantiene tablas compartidas en public
-- Los esquemas existentes se saltan si ya existen

-- ============================================================
-- ESQUEMAS POR PROYECTO
-- ============================================================

CREATE SCHEMA IF NOT EXISTS muzicmania;
CREATE SCHEMA IF NOT EXISTS ciszubot;
CREATE SCHEMA IF NOT EXISTS ciszunetwork;

COMMENT ON SCHEMA muzicmania IS 'Tablas del proyecto MuzicMania (juego de ritmo): scores, reviews, tracks, game stats';
COMMENT ON SCHEMA ciszubot IS 'Tablas del proyecto CiszuBot: configuración de comandos, logs, stats del bot';
COMMENT ON SCHEMA ciszunetwork IS 'Tablas del proyecto CiszuNetwork Page: contact form, analytics, pages';

-- ============================================================
-- COMPARTIR ESQUEMAS EN search_path POR DEFECTO
-- ============================================================

-- Nota: El search_path global se configura en config.toml
-- Los usuarios autenticados deben tener USAGE en los nuevos esquemas
GRANT USAGE ON SCHEMA muzicmania TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA ciszubot TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA ciszunetwork TO anon, authenticated, service_role;

-- ============================================================
-- TABLAS BASE PARA CISZUNETWORK (main website)
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

-- Solo admins pueden ver mensajes; cualquiera puede insertar
CREATE POLICY "Anyone can insert messages"
  ON ciszunetwork.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read messages"
  ON ciszunetwork.messages FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- TABLAS BASE PARA CISZUBOT
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
  ON ciszubot.guild_config
  USING (true)
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
  ON ciszubot.command_logs
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- NOTAS SOBRE TABLAS EXISTENTES EN public
-- ============================================================

-- Las siguientes tablas permanecen en public por ser compartidas
-- entre proyectos o requerir integración directa con auth.users:
--
-- public.profiles           — Perfiles de usuario (compartido)
-- public.support_tickets    — Tickets de soporte (compartido)
-- public.tickets            — Tickets de soporte v2 (compartido)
-- public.deleted_accounts   — Cuentas eliminadas (compartido)
--
-- Las tablas específicas de MuzicMania se quedan en public por ahora:
-- public.scores, public.likes, public.track_stats
-- public.reviews, public.review_likes
-- public.global_metrics, public.server_health, public.user_relations
--
-- En el futuro se migrarán al schema muzicmania cuando sea seguro.