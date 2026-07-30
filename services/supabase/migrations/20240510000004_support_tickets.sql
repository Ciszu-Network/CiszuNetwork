-- Tabla de Tickets de Soporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para generar IDs de tickets únicos (ej: TKT-123456)
CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
BEGIN
  LOOP
    new_id := 'TKT-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    PERFORM 1 FROM public.support_tickets WHERE id = new_id;
    IF NOT FOUND THEN
      EXIT;
    END IF;
  END LOOP;
  
  NEW.id := new_id;
  RETURN NEW;
END;
$$;

-- Trigger para auto-generar ID antes de insertar
DROP TRIGGER IF EXISTS tr_generate_ticket_id ON public.support_tickets;
CREATE TRIGGER tr_generate_ticket_id
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ticket_id();

-- RLS para seguridad
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
