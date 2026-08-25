-- 20260811000017_audit_log.sql
-- Tarea seguridad (11 ago 2026): log de auditoría del dashboard de CiszuBot.
-- Eventos: login/logout del dashboard (OAuth Discord), cambios de configuración
-- por guild. Tabla deny-all: SOLO service_role (bot/dashboard/server-side) la
-- toca; anon/authenticated no tienen ni SELECT (cierra el pendiente "falta log
-- de logins del dashboard" de SECURITY_TASKS.md §7).

CREATE TABLE IF NOT EXISTS ciszubot.audit_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event      text NOT NULL,          -- login | login_failed | logout | config_update
  actor_id   text,                   -- id de Discord del usuario que actuó
  actor_name text,                   -- username legible (para auditoría humana)
  target     text,                   -- guild_id u objetivo del evento
  ip         text,                   -- IP de origen (dashboard)
  detail     jsonb,                  -- payload adicional (campos cambiados, etc.)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON ciszubot.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_event_idx       ON ciszubot.audit_log (event);

ALTER TABLE ciszubot.audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE ciszubot.audit_log FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE ciszubot.audit_log TO service_role;