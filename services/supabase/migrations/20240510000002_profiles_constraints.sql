-- Asegurar que el username sea único y no nulo en los perfiles
ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL,
  ADD CONSTRAINT profiles_username_unique UNIQUE (username),
  ADD CONSTRAINT profiles_username_length_check CHECK (char_length(username) >= 3 AND char_length(username) <= 20);

-- Asegurar que el display_name tenga un límite razonable pero se pueda repetir
ALTER TABLE public.profiles
  ALTER COLUMN display_name SET NOT NULL,
  ADD CONSTRAINT profiles_display_name_length_check CHECK (char_length(display_name) >= 3 AND char_length(display_name) <= 30);
