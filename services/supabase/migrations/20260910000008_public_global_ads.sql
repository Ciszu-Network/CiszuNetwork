-- ============================================================
-- 20260910000008_public_global_ads.sql
-- Crea las tablas de ads globales y disclaimer deliveries en el
-- schema public, porque PostgREST solo expone public por defecto.
-- Idempotente.
-- ============================================================

-- Tabla de anuncios globales
CREATE TABLE IF NOT EXISTS public.global_ads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender TEXT NOT NULL DEFAULT 'admin',
  source TEXT NOT NULL DEFAULT 'dev-console',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT 'Abrir',
  href TEXT NOT NULL DEFAULT 'https://ciszunetwork.vercel.app',
  type TEXT NOT NULL DEFAULT 'particulares' CHECK (type IN ('intrusive','particulares','reward','optional')),
  source_web TEXT NOT NULL DEFAULT 'external',
  brand TEXT,
  require_reward BOOLEAN NOT NULL DEFAULT FALSE,
  target TEXT NOT NULL DEFAULT 'global',
  expires_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.global_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global ads"
  ON public.global_ads FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

CREATE POLICY "Only admins insert global ads"
  ON public.global_ads FOR INSERT
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins update global ads"
  ON public.global_ads FOR UPDATE
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins delete global ads"
  ON public.global_ads FOR DELETE
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Kill switch global (fila única id=1)
CREATE TABLE IF NOT EXISTS public.global_ads_settings (
  id INT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

INSERT INTO public.global_ads_settings (id, enabled)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.global_ads_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read ads settings"
  ON public.global_ads_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins update ads settings"
  ON public.global_ads_settings FOR UPDATE
  USING ((SELECT auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Confirmación de entrega por sitio (telemetría)
CREATE TABLE IF NOT EXISTS public.global_ads_deliveries (
  ad_id BIGINT NOT NULL REFERENCES public.global_ads(id) ON DELETE CASCADE,
  site TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ad_id, site)
);

ALTER TABLE public.global_ads_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read ads deliveries"
  ON public.global_ads_deliveries FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role inserts ads deliveries"
  ON public.global_ads_deliveries FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "Service role updates ads deliveries"
  ON public.global_ads_deliveries FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Grants
GRANT SELECT ON public.global_ads TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.global_ads TO service_role;
GRANT SELECT ON public.global_ads_settings TO anon, authenticated, service_role;
GRANT UPDATE ON public.global_ads_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.global_ads_deliveries TO anon, authenticated, service_role;
