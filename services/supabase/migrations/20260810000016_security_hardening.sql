-- 20260810000016_security_hardening.sql
-- Tarea seguridad (10 ago 2026): endurecimiento RLS + reducción de superficie anónima.
-- 1) public.get_email_by_username(text): REVOKE EXECUTE de anon/authenticated
--    (exfiltración de emails vía PostgREST público; el login con @username pasa
--    a la API route /api/auth/resolve-username que usa service_role).
-- 2) ciszubot.command_logs y guild_config: limpieza de grants anon/authenticated
--    (RLS ya denegaba por policy service_role-only; se reduce superficie).
-- 3) ciszunetwork.messages: anon conserva solo INSERT (formulario de contacto);
--    se revoca UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER de anon y authenticated.
-- 4) ENABLE RLS en las 13 tablas de ciszubot que estaban sin RLS (defensa en
--    profundidad: deny-all para anon/authenticated; el bot y el dashboard usan
--    service_role que hace bypass de RLS y sigue funcionando igual).

REVOKE EXECUTE ON FUNCTION public.get_email_by_username(text) FROM anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE ciszubot.command_logs FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE ciszubot.guild_config FROM anon, authenticated;

REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE ciszunetwork.messages FROM anon, authenticated;

ALTER TABLE ciszubot.afk ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.discord_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.guild_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.snipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszubot.warns ENABLE ROW LEVEL SECURITY;
