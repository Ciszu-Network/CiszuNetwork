-- Fix crítico #3 (raíz): el `SET search_path TO 'a, b, c'` con la lista entre
-- comillas quedó guardado como UN SOLO identificador ("a, b, c"), así que las
-- funciones con referencias sin cualificar no resolvían sus tablas:
--   - handle_new_user (×4) → registro completamente roto (42P01 en auth.users)
--   - scoring de muzicmania, helpers de username/cuenta…
-- Se fija el search_path con la LISTA SIN COMILLAS (identificadores separados
-- por comas), que PostgreSQL interpreta correctamente. Las funciones con
-- `search_path=""` (vacío intencional) NO se tocan.

alter function ciszubot.handle_new_user() set search_path = ciszubot, public, extensions;
alter function ciszukoantony.handle_new_user() set search_path = ciszukoantony, public, extensions;
alter function ciszunetwork.handle_new_user() set search_path = ciszunetwork, public, extensions;
alter function public.handle_new_user() set search_path = muzicmania, public, extensions;

alter function muzicmania.submit_game_score(text, integer, integer, numeric, text, integer, integer, integer, integer, integer) set search_path = muzicmania, public;
alter function public.submit_game_score(text, integer, integer, numeric, text, integer, integer, integer, integer, integer) set search_path = muzicmania, public;

alter function public.check_username_available(text) set search_path = muzicmania, public;
alter function public.get_email_by_username(text) set search_path = muzicmania, public;
alter function public.handle_account_deletion() set search_path = muzicmania, public;
alter function public.is_account_recoverable(uuid) set search_path = muzicmania, public;
alter function public.is_account_recoverable(text) set search_path = muzicmania, public;
alter function public.normalize_username() set search_path = muzicmania, public;
