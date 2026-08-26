-- ============================================================
-- 20260824000025_global_announcement_deliveries_rls_harden.sql
-- Corrige los warnings del linter (rls_policy_always_true) en
-- ciszunetwork.global_announcement_deliveries:
--   - "Anyone can insert deliveries"  tenia WITH CHECK (TRUE)
--   - "Anyone can update deliveries"  tenia USING/WITH CHECK (TRUE)
-- Se restringen a: site válido del ecosistema Y anuncio existente
-- y no expirado. Sigue permitiendo a anon/authenticated confirmar
-- la entrega de su sitio (necesario para el --wait y el upsert),
-- pero ya no es una política abierta al 100%.
-- Idempotente.
-- ============================================================

-- Sitios válidos del ecosistema (coinciden con la prop `site` del GlobalAdvisor).
-- Anuncio existente y NO expirado (el front solo debe confirmar lo que se va a mostrar).
DROP POLICY IF EXISTS "Anyone can insert deliveries" ON ciszunetwork.global_announcement_deliveries;
CREATE POLICY "Anyone can insert deliveries"
  ON ciszunetwork.global_announcement_deliveries FOR INSERT
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_announcements a
      WHERE a.id = announcement_id
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    )
  );

DROP POLICY IF EXISTS "Anyone can update deliveries" ON ciszunetwork.global_announcement_deliveries;
CREATE POLICY "Anyone can update deliveries"
  ON ciszunetwork.global_announcement_deliveries FOR UPDATE
  USING (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_announcements a
      WHERE a.id = announcement_id
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    )
  )
  WITH CHECK (
    site IN ('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    AND EXISTS (
      SELECT 1 FROM ciszunetwork.global_announcements a
      WHERE a.id = announcement_id
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
    )
  );