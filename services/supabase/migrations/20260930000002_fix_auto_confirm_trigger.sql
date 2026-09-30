-- Fix crítico: el trigger BEFORE INSERT `tr_auto_confirm_user_email` en
-- auth.users ejecutaba `UPDATE profiles SET email_verified = true` con
-- search_path `muzicmania, public`; en ese momento la tabla no existe (el
-- perfil se crea DESPUÉS, en el trigger AFTER INSERT handle_new_user), así
-- que CUALQUIER alta en auth.users fallaba con 42P01 y el registro quedaba
-- roto por completo (GoTrue devolvía 500 en signUp y en el admin createUser).
--
-- La confirmación del email la gestiona ahora el flujo C-XXX XXX
-- (/api/auth/register/complete marca email_confirm vía admin), por lo que el
-- trigger no aporta nada: se elimina.

drop trigger if exists tr_auto_confirm_user_email on auth.users;
drop function if exists public.auto_confirm_user_email();
