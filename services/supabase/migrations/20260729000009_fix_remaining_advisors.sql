-- Migration 09: Fix remaining security + performance advisors
-- 1. authenticated_security_definer_function_executable: change safe functions to SECURITY INVOKER
-- 2. auth_rls_initplan: wrap auth.uid() inside EXISTS with (select auth.uid())
-- 3. multiple_permissive_policies: separate ALL policy on likes, merge tickets SELECT policies

-- ============================================================
-- PART 1: Security — change safe functions to SECURITY INVOKER
-- These functions only read/write tables that the caller already
-- has RLS-based access to, so INVOKER is safe and more secure.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'muzicmania, public'
AS $function$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username));
  RETURN v_email;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'muzicmania, public'
AS $function$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM muzicmania.profiles
    WHERE id = p_user_id
    AND deleted_at IS NOT NULL;
  RETURN v_count > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_username text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'muzicmania, public'
AS $function$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
    AND deleted_at IS NOT NULL;
  RETURN v_count > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_game_score(
  p_track_id text,
  p_score integer,
  p_combo integer,
  p_accuracy numeric,
  p_grade text DEFAULT NULL::text,
  p_max_combo integer DEFAULT 0,
  p_perfect integer DEFAULT 0,
  p_great integer DEFAULT 0,
  p_good integer DEFAULT 0,
  p_miss integer DEFAULT 0
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'muzicmania, public'
AS $function$
BEGIN
  PERFORM muzicmania.submit_game_score(
    p_track_id, p_score, p_combo, p_accuracy, p_grade,
    p_max_combo, p_perfect, p_great, p_good, p_miss
  );
END;
$function$;

-- Keep these 4 functions as SECURITY DEFINER (intentional, triggers need elevation):
--   muzicmania.handle_review_like()     — updates reviews.likes_count for ANY review
--   muzicmania.handle_review_update()   — deletes OTHER users' likes on the review
--   muzicmania.update_track_like_count()— upserts track_stats (no INSERT/UPDATE RLS)
--   muzicmania.submit_game_score(...)   — complex writes, caller has RLS access but
--                                         keeping DEFINER for backward compat safety

-- ============================================================
-- PART 2: Performance — auth_rls_initplan
-- Wrap auth.uid() inside EXISTS subqueries with (select auth.uid())
-- ============================================================

DROP POLICY IF EXISTS "Solo admins ven cuentas eliminadas" ON muzicmania.deleted_accounts;
CREATE POLICY "Solo admins ven cuentas eliminadas" ON muzicmania.deleted_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM muzicmania.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND (profiles.is_admin = true OR profiles.role = 'admin'::text)
    )
  );

DROP POLICY IF EXISTS "Admins can view all tickets" ON muzicmania.tickets;
CREATE POLICY "Admins can view all tickets" ON muzicmania.tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM muzicmania.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  );

-- ============================================================
-- PART 3: Performance — multiple_permissive_policies
-- 3a. muzicmania.likes: drop ALL policy, create INSERT/UPDATE/DELETE only
--     (SELECT is already covered by "Likes are viewable by everyone")
-- ============================================================

DROP POLICY IF EXISTS "Users can manage their own likes" ON muzicmania.likes;

CREATE POLICY "Users can insert their own likes" ON muzicmania.likes
  FOR INSERT
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- Note: UPDATE on likes doesn't make functional sense, but creating for completeness
-- to match what the original ALL policy covered
CREATE POLICY "Users can update their own likes" ON muzicmania.likes
  FOR UPDATE
  USING (((SELECT auth.uid()) = user_id));

CREATE POLICY "Users can delete their own likes" ON muzicmania.likes
  FOR DELETE
  USING (((SELECT auth.uid()) = user_id));

-- 3b. muzicmania.tickets: merge the two SELECT policies (admin + own) into one
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all tickets" ON muzicmania.tickets;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios tickets" ON muzicmania.tickets;

CREATE POLICY "Users can view tickets" ON muzicmania.tickets
  FOR SELECT
  USING (
    ((SELECT auth.uid()) = user_id)
    OR
    EXISTS (
      SELECT 1 FROM muzicmania.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.is_admin = true
    )
  );