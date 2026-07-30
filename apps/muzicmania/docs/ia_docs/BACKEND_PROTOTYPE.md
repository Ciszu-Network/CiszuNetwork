-- MÓDULO A: IDENTIDAD Y RED SOCIAL
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, -- Nombre de usuario único (@handle)
  user_display TEXT,             -- Nombre estético (p ej: Antony!)
  avatar_url TEXT,               -- URL de almacenamiento de foto de perfil
  banner_url TEXT,               -- URL de imagen de fondo del perfil
  bio TEXT LIMIT 500,            -- Descripción personal
  gender TEXT,                   -- Opcional
  age INTEGER,                   -- Opcional
  country TEXT,                  -- Opcional
  phone TEXT,                    -- Opcional (Validación de formato)
  is_verified BOOLEAN DEFAULT false, -- Check de cuenta oficial/dev
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MÓDULO B: PREFERENCIAS Y CONFIGURACIÓN
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark',        -- 'light' | 'dark'
  language TEXT DEFAULT 'es',       -- 'es' | 'en'
  email_notifications BOOLEAN DEFAULT true,
  debug_mode BOOLEAN DEFAULT false, -- Solo activable por staff
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MÓDULO C: ANALÍTICAS Y PROGRESO (GAMEPLAY)
CREATE TABLE public.game_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_score BIGINT DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  avg_accuracy DECIMAL(5,2) DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  achievements_json JSONB DEFAULT '[]', -- IDs de logros desbloqueados
  last_played TIMESTAMPTZ
);

-- MÓDULO D: INTERACCIONES SOCIALES (LIKES Y REVIEWS)
CREATE TABLE public.social_interactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id TEXT NOT NULL,      -- ID del changelog, ID de una review o ID de canción
  type TEXT NOT NULL,           -- 'like_changelog', 'like_review', 'star_review'
  rating INTEGER,               -- 1-5 estrellas (solo para reviews)
  comment TEXT,                 -- Texto de la review
  created_at TIMESTAMPTZ DEFAULT NOW()
);
