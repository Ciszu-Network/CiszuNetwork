-- ============================================================
-- 20260824000024_global_announcements_sender_profile.sql
-- Añade al anuncio los datos del perfil verificado del emisor
-- (si el sender coincide con un profile de alguna web destino).
-- El front muestra display_name + @username con badge verificado
-- y enlace a la página de perfil.
-- Idempotente.
-- ============================================================

ALTER TABLE ciszunetwork.global_announcements
  ADD COLUMN IF NOT EXISTS sender_display_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_username TEXT,
  ADD COLUMN IF NOT EXISTS sender_site TEXT;