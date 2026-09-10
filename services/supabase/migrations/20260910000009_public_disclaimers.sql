-- ============================================================
-- 20260910000009_public_disclaimers.sql
-- Crea las tablas de disclaimers globales y deliveries en el
-- schema public, porque PostgREST solo expone public por defecto.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.global_disclaimers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender TEXT NOT NULL DEFAULT 'devcon',
  source TEXT NOT NULL DEFAULT 'dev-console',
  message TEXT NOT NULL DEFAULT '',
  message_i18n JSONB,
  kind TEXT NOT NULL DEFAULT 'info' CHECK (kind IN ('info', 'basic', 'warning', 'beta')),
  target TEXT NOT NULL DEFAULT 'global',
  dismissible BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  image TEXT,
  actions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.global_disclaimers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global disclaimers"
  ON public.global_disclaimers FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins insert global disclaimers"
  ON public.global_disclaimers FOR INSERT
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins update global disclaimers"
  ON public.global_disclaimers FOR UPDATE
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins delete global disclaimers"
  ON public.global_disclaimers FOR DELETE
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Confirmación de entrega por sitio (telemetría)
CREATE TABLE IF NOT EXISTS public.global_disclaimer_deliveries (
  disclaimer_id BIGINT NOT NULL REFERENCES public.global_disclaimers(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (disclaimer_id, site)
);

ALTER TABLE public.global_disclaimer_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read disclaimer deliveries"
  ON public.global_disclaimer_deliveries FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role inserts disclaimer deliveries"
  ON public.global_disclaimer_deliveries FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "Service role updates disclaimer deliveries"
  ON public.global_disclaimer_deliveries FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Grants
GRANT SELECT ON public.global_disclaimers TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.global_disclaimers TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.global_disclaimer_deliveries TO anon, authenticated, service_role;
