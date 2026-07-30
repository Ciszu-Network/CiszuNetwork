-- Fix: Revocar grants excesivos a anon en schema muzicmania
-- Los grants originales otorgaban ALL a anon, lo que es riesgo de seguridad.
-- RLS mitiga parcialmente, pero si una tabla no tiene RLS, anon tiene acceso total.

-- Revocar ALL de anon en muzicmania
REVOKE ALL ON ALL TABLES IN SCHEMA muzicmania FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA muzicmania FROM anon;
REVOKE USAGE ON SCHEMA muzicmania FROM anon;

-- Solo otorgar lo mínimo necesario a anon
GRANT USAGE ON SCHEMA muzicmania TO anon;

-- Tablas públicas: solo SELECT (lectura pública)
-- profiles: anon necesita SELECT para check_username_available
GRANT SELECT ON ALL TABLES IN SCHEMA muzicmania TO anon;

-- authenticated y service_role mantienen ALL
GRANT ALL ON ALL TABLES IN SCHEMA muzicmania TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA muzicmania TO authenticated, service_role;

-- También arreglar schemas ciszubot y ciszunetown si tienen grants similares
REVOKE ALL ON ALL TABLES IN SCHEMA ciszubot FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ciszubot FROM anon;
GRANT USAGE ON SCHEMA ciszubot TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA ciszubot TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA ciszubot TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ciszubot TO authenticated, service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA ciszunetwork FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ciszunetwork FROM anon;
GRANT USAGE ON SCHEMA ciszunetwork TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA ciszunetwork TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA ciszunetwork TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ciszunetwork TO authenticated, service_role;