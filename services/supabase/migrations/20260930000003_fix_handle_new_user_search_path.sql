-- Fix crítico #2: las funciones handle_new_user de ciszubot / ciszunetwork /
-- ciszukoantony quedaron con `SET search_path TO ''` (endurecimiento de
-- advisors del 25 sep) pero sus cuerpos usan referencias SIN cualificar
-- (`INSERT INTO profiles ...`), así que cualquier alta en auth.users falla
-- con 42P01 "relation profiles does not exist" → registro roto por completo.
--
-- Se fija un search_path EXPLÍCITO por esquema (patrón recomendado por los
-- Security Advisors: nada de "mutable", pero con los esquemas que la función
-- necesita). public.handle_new_user ya tenía 'muzicmania, public, extensions'.

alter function ciszubot.handle_new_user() set search_path to 'ciszubot, public, extensions';
alter function ciszunetwork.handle_new_user() set search_path to 'ciszunetwork, public, extensions';
alter function ciszukoantony.handle_new_user() set search_path to 'ciszukoantony, public, extensions';
