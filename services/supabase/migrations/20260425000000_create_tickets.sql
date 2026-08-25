-- MuzicMania Tickets Table Schema

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  region TEXT,
  contact_type TEXT,
  phone TEXT,
  device TEXT,
  category TEXT,
  sub_category TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, open, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, critical
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Los usuarios pueden ver sus propios tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios tickets" ON public.tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios tickets" ON public.tickets
  FOR DELETE USING (auth.uid() = user_id);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
