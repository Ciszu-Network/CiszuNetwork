-- Migration 08: Fix performance advisors
-- 1. Fix auth_rls_initplan: wrap auth.*() in (select ...)
-- 2. Fix multiple_permissive_policies: drop duplicate policies + merge overlapping ones

-- ============================================================
-- PART 1: Drop duplicate policies (multiple_permissive_policies)
-- ============================================================

-- muzicmania.profiles: 2 identical SELECT policies (both USING true)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON muzicmania.profiles;

-- muzicmania.profiles: 2 identical UPDATE policies (both USING auth.uid() = id)
DROP POLICY IF EXISTS "Users can update their own profile" ON muzicmania.profiles;

-- muzicmania.scores: 2 identical SELECT policies (both USING true)
DROP POLICY IF EXISTS "Scores are readable by everyone" ON muzicmania.scores;

-- muzicmania.tickets: 3 identical SELECT policies (one for admins, two duplicates for own tickets)
-- Keep "Admins can view all tickets" and "Los usuarios pueden ver sus propios tickets"
DROP POLICY IF EXISTS "Users can view their own tickets" ON muzicmania.tickets;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios tickets" ON muzicmania.tickets;

-- muzicmania.tickets: 2 INSERT policies with different checks
-- "Los usuarios pueden crear sus propios tickets" (CHECK auth.uid() = user_id)
-- "Usuarios pueden crear tickets" (CHECK auth.role() = 'authenticated')
-- Drop both and merge into one with OR
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propios tickets" ON muzicmania.tickets;
DROP POLICY IF EXISTS "Usuarios pueden crear tickets" ON muzicmania.tickets;

CREATE POLICY "Authenticated users can create tickets" ON muzicmania.tickets
  FOR INSERT
  WITH CHECK (((SELECT auth.uid()) = user_id) OR ((SELECT auth.role()) = 'authenticated'::text));

-- ============================================================
-- PART 2: Fix auth_rls_initplan — wrap auth.*() in (select ...)
-- ============================================================

-- ciszubot.command_logs: auth.role() -> (select auth.role())
DROP POLICY IF EXISTS "Service role can manage command logs" ON ciszubot.command_logs;
CREATE POLICY "Service role can manage command logs" ON ciszubot.command_logs
  FOR ALL
  USING (((SELECT auth.role()) = 'service_role'::text))
  WITH CHECK (((SELECT auth.role()) = 'service_role'::text));

-- ciszubot.guild_config: auth.role() -> (select auth.role())
DROP POLICY IF EXISTS "Service role can manage guild config" ON ciszubot.guild_config;
CREATE POLICY "Service role can manage guild config" ON ciszubot.guild_config
  FOR ALL
  USING (((SELECT auth.role()) = 'service_role'::text))
  WITH CHECK (((SELECT auth.role()) = 'service_role'::text));

-- ciszunetwork.messages: auth.jwt() -> (select auth.jwt())
DROP POLICY IF EXISTS "Only admins can read messages" ON ciszunetwork.messages;
CREATE POLICY "Only admins can read messages" ON ciszunetwork.messages
  FOR SELECT
  USING ((((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text));

-- muzicmania.likes: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can manage their own likes" ON muzicmania.likes;
CREATE POLICY "Users can manage their own likes" ON muzicmania.likes
  FOR ALL
  USING (((SELECT auth.uid()) = user_id));

-- muzicmania.profiles UPDATE: auth.uid() -> (select auth.uid())
-- (Rebuilding the one we kept from the duplicate drop above)
DROP POLICY IF EXISTS "Los usuarios pueden editar su propio perfil." ON muzicmania.profiles;
CREATE POLICY "Los usuarios pueden editar su propio perfil." ON muzicmania.profiles
  FOR UPDATE
  USING (((SELECT auth.uid()) = id));

-- muzicmania.profiles INSERT: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can insert their own profile" ON muzicmania.profiles;
CREATE POLICY "Users can insert their own profile" ON muzicmania.profiles
  FOR INSERT
  WITH CHECK (((SELECT auth.uid()) = id));

-- muzicmania.review_likes INSERT: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Authenticated users can like reviews" ON muzicmania.review_likes;
CREATE POLICY "Authenticated users can like reviews" ON muzicmania.review_likes
  FOR INSERT
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- muzicmania.review_likes DELETE: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can unlike reviews" ON muzicmania.review_likes;
CREATE POLICY "Users can unlike reviews" ON muzicmania.review_likes
  FOR DELETE
  USING (((SELECT auth.uid()) = user_id));

-- muzicmania.reviews INSERT: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can create their own review" ON muzicmania.reviews;
CREATE POLICY "Users can create their own review" ON muzicmania.reviews
  FOR INSERT
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- muzicmania.reviews UPDATE: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can update their own review" ON muzicmania.reviews;
CREATE POLICY "Users can update their own review" ON muzicmania.reviews
  FOR UPDATE
  USING (((SELECT auth.uid()) = user_id));

-- muzicmania.scores INSERT: auth.role() -> (select auth.role())
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden subir puntuaciones." ON muzicmania.scores;
CREATE POLICY "Solo usuarios autenticados pueden subir puntuaciones." ON muzicmania.scores
  FOR INSERT
  WITH CHECK (((SELECT auth.role()) = 'authenticated'::text));

-- muzicmania.support_tickets INSERT: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can create their own tickets" ON muzicmania.support_tickets;
CREATE POLICY "Users can create their own tickets" ON muzicmania.support_tickets
  FOR INSERT
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- muzicmania.support_tickets SELECT: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Users can view their own tickets" ON muzicmania.support_tickets;
CREATE POLICY "Users can view their own tickets" ON muzicmania.support_tickets
  FOR SELECT
  USING (((SELECT auth.uid()) = user_id));

-- muzicmania.tickets UPDATE: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios tickets" ON muzicmania.tickets;
CREATE POLICY "Los usuarios pueden actualizar sus propios tickets" ON muzicmania.tickets
  FOR UPDATE
  USING (((SELECT auth.uid()) = user_id));

-- muzicmania.tickets DELETE: auth.uid() -> (select auth.uid())
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios tickets" ON muzicmania.tickets;
CREATE POLICY "Los usuarios pueden eliminar sus propios tickets" ON muzicmania.tickets
  FOR DELETE
  USING (((SELECT auth.uid()) = user_id));

-- muzicmania.tickets SELECT (user's own): auth.uid() -> (select auth.uid())
-- Rebuilding the one we kept from the duplicate drop
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios tickets" ON muzicmania.tickets;
CREATE POLICY "Los usuarios pueden ver sus propios tickets" ON muzicmania.tickets
  FOR SELECT
  USING (((SELECT auth.uid()) = user_id));