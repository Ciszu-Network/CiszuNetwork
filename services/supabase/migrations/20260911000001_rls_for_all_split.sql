-- ============================================================
-- 20260911000001_rls_for_all_split.sql
-- Reemplaza politicas FOR ALL restantes por politicas separadas
-- por comando (SELECT / INSERT / UPDATE / DELETE).
-- Cumple con SECURITY_PROTOCOLS: sin FOR ALL salvo triggers.
-- ============================================================

-- ============================================================
-- ciszubot.command_logs
-- ============================================================
DROP POLICY IF EXISTS "Service role can manage command logs" ON ciszubot.command_logs;

CREATE POLICY "Service role can select command logs"
  ON ciszubot.command_logs FOR SELECT
  USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can insert command logs"
  ON ciszubot.command_logs FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can update command logs"
  ON ciszubot.command_logs FOR UPDATE
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can delete command logs"
  ON ciszubot.command_logs FOR DELETE
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================
-- ciszubot.guild_config
-- ============================================================
DROP POLICY IF EXISTS "Service role can manage guild config" ON ciszubot.guild_config;

CREATE POLICY "Service role can select guild config"
  ON ciszubot.guild_config FOR SELECT
  USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can insert guild config"
  ON ciszubot.guild_config FOR INSERT
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can update guild config"
  ON ciszubot.guild_config FOR UPDATE
  USING ((SELECT auth.role()) = 'service_role')
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can delete guild config"
  ON ciszubot.guild_config FOR DELETE
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================
-- muzicmania.global_metrics (service_role full access)
-- ============================================================
DROP POLICY IF EXISTS "service_role_all_global_metrics" ON muzicmania.global_metrics;

CREATE POLICY "service_role_select_global_metrics"
  ON muzicmania.global_metrics FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "service_role_insert_global_metrics"
  ON muzicmania.global_metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role_update_global_metrics"
  ON muzicmania.global_metrics FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_delete_global_metrics"
  ON muzicmania.global_metrics FOR DELETE
  TO service_role
  USING (true);

-- ============================================================
-- muzicmania.server_health (service_role full access)
-- ============================================================
DROP POLICY IF EXISTS "service_role_all_server_health" ON muzicmania.server_health;

CREATE POLICY "service_role_select_server_health"
  ON muzicmania.server_health FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "service_role_insert_server_health"
  ON muzicmania.server_health FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role_update_server_health"
  ON muzicmania.server_health FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_delete_server_health"
  ON muzicmania.server_health FOR DELETE
  TO service_role
  USING (true);

-- ============================================================
-- muzicmania.user_relations (service_role full access)
-- ============================================================
DROP POLICY IF EXISTS "service_role_all_user_relations" ON muzicmania.user_relations;

CREATE POLICY "service_role_select_user_relations"
  ON muzicmania.user_relations FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "service_role_insert_user_relations"
  ON muzicmania.user_relations FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role_update_user_relations"
  ON muzicmania.user_relations FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_delete_user_relations"
  ON muzicmania.user_relations FOR DELETE
  TO service_role
  USING (true);

-- ============================================================
-- ciszunetwork.staff_members
-- ============================================================
DROP POLICY IF EXISTS "Only admins manage staff" ON ciszunetwork.staff_members;

CREATE POLICY "Admins can select staff members"
  ON ciszunetwork.staff_members FOR SELECT
  USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can insert staff members"
  ON ciszunetwork.staff_members FOR INSERT
  WITH CHECK ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can update staff members"
  ON ciszunetwork.staff_members FOR UPDATE
  USING ((SELECT auth.jwt()) ->> 'role' = 'admin')
  WITH CHECK ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can delete staff members"
  ON ciszunetwork.staff_members FOR DELETE
  USING ((SELECT auth.jwt()) ->> 'role' = 'admin');
