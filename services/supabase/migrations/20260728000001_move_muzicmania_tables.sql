-- Ciszu Network — Mover tablas de MuzicMania al schema muzicmania
-- Ejecutar SOLO si las tablas aún están en public.

-- ============================================================
-- 1. MOVER TABLAS DE MuzicMania A SU SCHEMA
-- ============================================================

-- Juego
ALTER TABLE IF EXISTS public.scores SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.likes SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.track_stats SET SCHEMA muzicmania;

-- Reviews
ALTER TABLE IF EXISTS public.reviews SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.review_likes SET SCHEMA muzicmania;

-- Métricas globales
ALTER TABLE IF EXISTS public.global_metrics SET SCHEMA muzicmania;
ALTER TABLE IF EXISTS public.server_health SET SCHEMA muzicmania;

-- Red social
ALTER TABLE IF EXISTS public.user_relations SET SCHEMA muzicmania;

-- ============================================================
-- 2. RECREAR FUNCIONES QUE REFERENCIABAN public.*
-- ============================================================

-- 2a. update_track_like_count()
CREATE OR REPLACE FUNCTION muzicmania.update_track_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'muzicmania'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO track_stats (track_id, like_count)
    VALUES (NEW.track_id, 1)
    ON CONFLICT (track_id)
    DO UPDATE SET like_count = track_stats.like_count + 1, updated_at = now();
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE track_stats
    SET like_count = like_count - 1, updated_at = now()
    WHERE track_id = OLD.track_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 2b. handle_review_like()
CREATE OR REPLACE FUNCTION muzicmania.handle_review_like()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'muzicmania'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE reviews SET likes_count = likes_count + 1 WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE reviews SET likes_count = likes_count - 1 WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 2c. handle_review_update()
CREATE OR REPLACE FUNCTION muzicmania.handle_review_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'muzicmania'
AS $$
BEGIN
  IF (OLD.comment <> NEW.comment OR OLD.rating <> NEW.rating) THEN
    NEW.is_edited := true;
    NEW.likes_count := 0;
    NEW.updated_at := now();
    DELETE FROM review_likes WHERE review_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- 2d. submit_game_score() — actualizar referencia de public.scores a muzicmania.scores
CREATE OR REPLACE FUNCTION muzicmania.submit_game_score(
  p_track_id TEXT,
  p_score INTEGER,
  p_combo INTEGER,
  p_accuracy NUMERIC,
  p_grade TEXT DEFAULT NULL,
  p_max_combo INTEGER DEFAULT 0,
  p_perfect INTEGER DEFAULT 0,
  p_great INTEGER DEFAULT 0,
  p_good INTEGER DEFAULT 0,
  p_miss INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_user_id UUID;
  v_exp_gained INTEGER;
  v_current_exp INTEGER;
  v_current_level INTEGER;
  v_current_high_score INTEGER;
  v_new_level INTEGER;
  v_avg_accuracy NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_score < 0 OR p_score > 9999999 OR p_accuracy < 0 OR p_accuracy > 100 THEN
    RAISE EXCEPTION 'Invalid score parameters detected.';
  END IF;

  v_exp_gained := GREATEST(10, (p_score / 1000) * (p_accuracy / 100));

  INSERT INTO scores (
    user_id, track_id, score, combo, accuracy, grade,
    max_combo, perfect, great, good, miss
  ) VALUES (
    v_user_id, p_track_id, p_score, p_combo, p_accuracy, p_grade,
    p_max_combo, p_perfect, p_great, p_good, p_miss
  );

  SELECT COALESCE(exp, xp, 0), COALESCE(level, 1), COALESCE(high_score, 0)
  INTO v_current_exp, v_current_level, v_current_high_score
  FROM public.profiles WHERE id = v_user_id;

  IF p_score > COALESCE(v_current_high_score, 0) THEN
    v_current_high_score := p_score;
  END IF;

  v_current_exp := v_current_exp + v_exp_gained;
  v_new_level := GREATEST(v_current_level, FLOOR(v_current_exp / 1000) + 1);

  SELECT ROUND(AVG(accuracy), 2) INTO v_avg_accuracy
  FROM scores WHERE user_id = v_user_id;

  UPDATE public.profiles SET
    exp = v_current_exp,
    xp = v_current_exp,
    level = v_new_level,
    high_score = v_current_high_score,
    games_played = COALESCE(games_played, 0) + 1,
    accuracy = COALESCE(v_avg_accuracy, p_accuracy)
  WHERE id = v_user_id;
END;
$$;

-- ============================================================
-- 3. COLGAR LOS TRIGGERS EN LAS TABLAS MOVIDAS
-- ============================================================

-- 3a. likes → update_track_like_count (INSERT + DELETE)
DROP TRIGGER IF EXISTS on_like_change ON muzicmania.likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON muzicmania.likes
  FOR EACH ROW EXECUTE FUNCTION muzicmania.update_track_like_count();

-- 3b. review_likes → handle_review_like (INSERT + DELETE)
DROP TRIGGER IF EXISTS on_review_like ON muzicmania.review_likes;
CREATE TRIGGER on_review_like
  AFTER INSERT OR DELETE ON muzicmania.review_likes
  FOR EACH ROW EXECUTE FUNCTION muzicmania.handle_review_like();

-- 3c. reviews → handle_review_update (UPDATE)
DROP TRIGGER IF EXISTS on_review_update ON muzicmania.reviews;
CREATE TRIGGER on_review_update
  BEFORE UPDATE ON muzicmania.reviews
  FOR EACH ROW EXECUTE FUNCTION muzicmania.handle_review_update();

-- ============================================================
-- 4. ELIMINAR FUNCIONES ANTIGUAS EN public
-- ============================================================

DROP FUNCTION IF EXISTS public.update_track_like_count();
DROP FUNCTION IF EXISTS public.handle_review_like();
DROP FUNCTION IF EXISTS public.handle_review_update();
-- NOTA: public.submit_game_score se elimina más abajo y se reemplaza por un wrapper

-- ============================================================
-- 5. WRAPPER EN public PARA QUE EL RPC SIGA FUNCIONANDO
-- ============================================================

-- El cliente llama a supabase.rpc('submit_game_score', {...})
-- y lo busca en public por defecto. Este wrapper delega a muzicmania.
DROP FUNCTION IF EXISTS public.submit_game_score;

CREATE OR REPLACE FUNCTION public.submit_game_score(
  p_track_id TEXT,
  p_score INTEGER,
  p_combo INTEGER,
  p_accuracy NUMERIC,
  p_grade TEXT DEFAULT NULL,
  p_max_combo INTEGER DEFAULT 0,
  p_perfect INTEGER DEFAULT 0,
  p_great INTEGER DEFAULT 0,
  p_good INTEGER DEFAULT 0,
  p_miss INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  PERFORM muzicmania.submit_game_score(
    p_track_id, p_score, p_combo, p_accuracy, p_grade,
    p_max_combo, p_perfect, p_great, p_good, p_miss
  );
END;
$$;-- ============================================================
-- 6. EXPONER muzicmania A LA API DE PostgREST
-- ============================================================

-- NOTA: Para exponer schemas extra al REST API, ir a:
--   Supabase Dashboard → Project Settings → API → Extra Schemas
--   Agregar manualmente: muzicmania, ciszubot, ciszunetwork
-- También se puede configurar desde pgtle si está disponible:
-- SELECT pgtle.set_config('extra_schemas', 'muzicmania,ciszubot,ciszunetwork');
-- Para SQL directo, alterar el rol 'postgres' y reiniciar:
-- ALTER ROLE postgres IN DATABASE postgres SET pgrst.openapi_mode TO 'single';
-- ALTER ROLE postgres IN DATABASE postgres SET pgrst.openapi_server TO '/';

-- Por ahora, se configurará manualmente en el Dashboard.

-- ============================================================
-- 7. OTORGAR PERMISOS
-- ============================================================

GRANT USAGE ON SCHEMA muzicmania TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA muzicmania TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA muzicmania TO anon, authenticated, service_role;