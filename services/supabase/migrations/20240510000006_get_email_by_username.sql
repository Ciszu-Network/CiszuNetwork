-- Función para obtener el email de un usuario a partir de su username
-- Esta función debe ejecutarse con SECURITY DEFINER para poder leer auth.users
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE p.username = p_username;
  
  RETURN v_email;
END;
$$;
