-- Añadir columnas de configuración a los perfiles para sincronización en la nube
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS settings_lang TEXT DEFAULT 'EN-US',
  ADD COLUMN IF NOT EXISTS settings_theme TEXT DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS settings_controls JSONB DEFAULT '{}'::JSONB;

-- Asegurar que las columnas tengan valores válidos (opcional, pero recomendado)
COMMENT ON COLUMN public.profiles.settings_controls IS 'Mapeo de teclas y sensibilidad de controles del usuario';
