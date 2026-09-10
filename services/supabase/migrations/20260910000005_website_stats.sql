-- Website Stats Tables (per-website metrics)
-- Each website has its own stats table. Frontend reads only.

CREATE TABLE IF NOT EXISTS public.ciszunetwork_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  tickets_open INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ciszukoantony_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  tickets_open INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ciszubot_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  tickets_open INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.muzicmania_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  tickets_open INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: public read-only for stats
ALTER TABLE public.ciszunetwork_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciszukoantony_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciszubot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muzicmania_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on ciszunetwork_stats"
  ON public.ciszunetwork_stats FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on ciszukoantony_stats"
  ON public.ciszukoantony_stats FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on ciszubot_stats"
  ON public.ciszubot_stats FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on muzicmania_stats"
  ON public.muzicmania_stats FOR SELECT
  USING (true);

-- Seed one row per table if empty
INSERT INTO public.ciszunetwork_stats (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.ciszukoantony_stats (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.ciszubot_stats (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.muzicmania_stats (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
