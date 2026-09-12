-- ============================================================
-- 20260912000001_fix_site_ids_global.sql
-- Migra site ids legacy "ciszunetwork" -> "ciszu" en tablas globales
-- para recuperar disclaimers/ads/announcements que se dejaron de
-- mostrar tras la unificación del siteId de Ciszu Network.
-- ============================================================

-- global_disclaimers: target / sender / source
UPDATE ciszunetwork.global_disclaimers
   SET target = regexp_replace(target, '(^|,)\s*ciszunetwork\s*(,|$)', '\1ciszu\2', 'g'),
       sender = CASE WHEN sender = 'ciszunetwork' THEN 'ciszu' ELSE sender END,
       source = CASE WHEN source = 'ciszunetwork' THEN 'ciszu' ELSE source END
 WHERE target ILIKE '%ciszunetwork%'
    OR sender = 'ciszunetwork'
    OR source = 'ciszunetwork';

-- global_ads: target / sender / source_web
UPDATE ciszunetwork.global_ads
   SET target = regexp_replace(target, '(^|,)\s*ciszunetwork\s*(,|$)', '\1ciszu\2', 'g'),
       sender = CASE WHEN sender = 'ciszunetwork' THEN 'ciszu' ELSE sender END,
       source_web = CASE WHEN source_web = 'ciszunetwork' THEN 'ciszu' ELSE source_web END
 WHERE target ILIKE '%ciszunetwork%'
    OR sender = 'ciszunetwork'
    OR source_web = 'ciszunetwork';

-- global_announcements: target / sender / source
UPDATE ciszunetwork.global_announcements
   SET target = regexp_replace(target, '(^|,)\s*ciszunetwork\s*(,|$)', '\1ciszu\2', 'g'),
       sender = CASE WHEN sender = 'ciszunetwork' THEN 'ciszu' ELSE sender END,
       source = CASE WHEN source = 'ciszunetwork' THEN 'ciszu' ELSE source END
 WHERE target ILIKE '%ciszunetwork%'
    OR sender = 'ciszunetwork'
    OR source = 'ciszunetwork';
