-- Migration 13: Heartbeat de estado del bot (ciszubot.bot_status)
-- La web de ciszubot consume estos datos dinámicos en tiempo real:
-- online, última vez visto, versión, nº de servidores y comandos totales.
-- El bot escribe con service_role (bypassa RLS); anon/authenticated solo leen.
-- Seguridad: tabla de estado público (info no sensible), single-row
-- (id = 1 CHECK), policy SELECT pura sin auth.*() (evita initplan advisor).

CREATE TABLE IF NOT EXISTS ciszubot.bot_status (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  version TEXT,
  guilds INT DEFAULT 0,
  commands_total BIGINT DEFAULT 0,
  prefix TEXT DEFAULT 'cz!',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ciszubot.bot_status ENABLE ROW LEVEL SECURITY;

-- Lectura pública del estado (no expone datos de usuarios)
CREATE POLICY "Anyone can read bot status" ON ciszubot.bot_status
  FOR SELECT USING (true);

GRANT SELECT ON ciszubot.bot_status TO anon, authenticated;
-- Management API no aplica grants default: service_role necesita escritura explícita
GRANT ALL ON ciszubot.bot_status TO service_role;
