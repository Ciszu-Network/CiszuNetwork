-- Fix: check_username_available — referencia explícita a muzicmania.profiles
-- y cambio a SECURITY INVOKER (solo lectura, sin necesidad de elevación)

CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$;

-- También exponer schemas en PostgREST vía SQL
-- (esto es necesario hasta que el dashboard se actualice)
ALTER ROLE postgres SET search_path TO 'public', 'muzicmania', 'ciszubot', 'ciszunetwork', 'extensions';

-- Nota: Para exponer schemas en PostgREST permanentemente,
-- ir a Dashboard → Settings → API → Exposed schemas
-- y agregar: muzicmania, ciszubot, ciszunetwork