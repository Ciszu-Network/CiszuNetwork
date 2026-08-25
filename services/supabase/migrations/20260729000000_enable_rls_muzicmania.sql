-- Enable RLS on muzicmania tables that were migrated from public
-- Supabase Advisor reports these as having RLS disabled

ALTER TABLE muzicmania.global_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzicmania.server_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzicmania.user_relations ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "authenticated_read_global_metrics"
  ON muzicmania.global_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_read_server_health"
  ON muzicmania.server_health
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_read_user_relations"
  ON muzicmania.user_relations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service_role full access (for admin operations)
CREATE POLICY "service_role_all_global_metrics"
  ON muzicmania.global_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_server_health"
  ON muzicmania.server_health
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_user_relations"
  ON muzicmania.user_relations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);