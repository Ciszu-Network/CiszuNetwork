-- Añadir soporte para Soft Delete y Actividad
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS liked_songs JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS total_likes_received INTEGER DEFAULT 0;

-- Función para verificar si una cuenta está en periodo de gracia (30 días)
CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id 
    AND deleted_at IS NOT NULL 
    AND deleted_at > (NOW() - INTERVAL '30 days')
  );
END;
$$;
