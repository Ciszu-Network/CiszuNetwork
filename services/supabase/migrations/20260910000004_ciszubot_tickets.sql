-- CiszuBot Tickets Table Schema

CREATE TABLE IF NOT EXISTS public.ciszubot_tickets (
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
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ciszubot_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON public.ciszubot_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" ON public.ciszubot_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.ciszubot_tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets" ON public.ciszubot_tickets
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ciszubot_tickets_user_id ON public.ciszubot_tickets(user_id);
