-- Fix Supabase Database Lint Warnings
-- 2026-07-29
--
-- Targets:
--   function_search_path_mutable       → 2 functions
--   rls_policy_always_true             → 3 policies
--   anon_security_definer / auth_sd    → ~15 functions

-- ── 1. function_search_path_mutable ──────────────────────────

-- generate_ticket_id (trigger, plain plpgsql, search_path not set)
CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
BEGIN
  LOOP
    new_id := 'TKT-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    PERFORM 1 FROM public.support_tickets WHERE id = new_id;
    IF NOT FOUND THEN EXIT; END IF;
  END LOOP;
  NEW.id := new_id;
  RETURN NEW;
END;
$$;

-- public.submit_game_score wrapper (SECURITY DEFINER but missing search_path)
CREATE OR REPLACE FUNCTION public.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT DEFAULT NULL,
  p_max_combo INTEGER DEFAULT 0, p_perfect INTEGER DEFAULT 0,
  p_great INTEGER DEFAULT 0, p_good INTEGER DEFAULT 0,
  p_miss INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'muzicmania, public'
AS $$
BEGIN
  PERFORM muzicmania.submit_game_score(
    p_track_id, p_score, p_combo, p_accuracy, p_grade,
    p_max_combo, p_perfect, p_great, p_good, p_miss
  );
END;
$$;

-- ── 2. SECURITY DEFINER —— revoke public EXECUTE on trigger functions
--     (triggers still fire via internal mechanism; direct RPC blocked)

REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_like()              FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION muzicmania.handle_review_update()            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION muzicmania.update_track_like_count()         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user_email()             FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_account_deletion()             FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.normalize_username()                  FROM PUBLIC;

-- get_email_by_username: leak prevention — anon shouldn't enumerate emails
REVOKE EXECUTE ON FUNCTION public.get_email_by_username(p_username TEXT) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_email_by_username(p_username TEXT) TO authenticated;

-- ── 3. RLS policies ──────────────────────────────────────────

-- command_logs: restrict to service_role only
DROP POLICY IF EXISTS "Service role can manage command logs" ON ciszubot.command_logs;
CREATE POLICY "Service role can manage command logs"
  ON ciszubot.command_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- guild_config: restrict to service_role only
DROP POLICY IF EXISTS "Service role can manage guild config" ON ciszubot.guild_config;
CREATE POLICY "Service role can manage guild config"
  ON ciszubot.guild_config FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- messages INSERT: validate content instead of unrestricted WITH CHECK(true)
DROP POLICY IF EXISTS "Anyone can insert messages" ON ciszunetwork.messages;
CREATE POLICY "Anyone can insert messages"
  ON ciszunetwork.messages FOR INSERT
  WITH CHECK (
    length(COALESCE(message, '')) > 0
    AND length(COALESCE(message, '')) <= 5000
  );