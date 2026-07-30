-- 🛡️ MuzicMania Security Migration: Secure Score Submission
-- Replaces insecure client-side inserts/updates with a secure server-side RPC function

-- 1. Create a secure RPC function to handle game results
CREATE OR REPLACE FUNCTION submit_game_score(
    p_track_id TEXT,
    p_score INTEGER,
    p_combo INTEGER,
    p_accuracy NUMERIC,
    p_grade TEXT,
    p_max_combo INTEGER,
    p_perfect INTEGER,
    p_great INTEGER,
    p_good INTEGER,
    p_miss INTEGER,
    p_duration_seconds INTEGER DEFAULT 120
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_exp_gained INTEGER;
    v_current_exp INTEGER;
    v_current_level INTEGER;
    v_current_high_score INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Get the authenticated user ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Basic validation to prevent impossible scores
    IF p_score < 0 OR p_score > 9999999 OR p_accuracy < 0 OR p_accuracy > 100 THEN
        RAISE EXCEPTION 'Invalid score parameters detected.';
    END IF;

    -- Calculate EXP based on score and accuracy (Server-side calculation)
    v_exp_gained := GREATEST(10, (p_score / 1000) * (p_accuracy / 100));

    -- Insert the score record securely
    INSERT INTO scores (
        user_id, track_id, score, combo, accuracy, grade, 
        max_combo, perfect, great, good, miss
    ) VALUES (
        v_user_id, p_track_id, p_score, p_combo, p_accuracy, p_grade, 
        p_max_combo, p_perfect, p_great, p_good, p_miss
    );

    -- Fetch current profile stats
    SELECT exp, level, high_score INTO v_current_exp, v_current_level, v_current_high_score
    FROM profiles WHERE id = v_user_id;

    -- Update high score if new score is higher
    IF p_score > COALESCE(v_current_high_score, 0) THEN
        v_current_high_score := p_score;
    END IF;

    -- Calculate new level (1 level per 1000 EXP for example)
    v_current_exp := COALESCE(v_current_exp, 0) + v_exp_gained;
    v_new_level := GREATEST(v_current_level, FLOOR(v_current_exp / 1000) + 1);

    -- Update profile securely
    UPDATE profiles SET 
        exp = v_current_exp,
        level = v_new_level,
        high_score = v_current_high_score,
        games_played = COALESCE(games_played, 0) + 1
    WHERE id = v_user_id;

END;
$$;

-- 2. Secure the scores table by revoking INSERT privileges from the anonymous/authenticated role
-- Only the RPC (which runs as SECURITY DEFINER) will be able to insert.
-- Note: This is an extra layer of security. RLS still applies, but we want to force users through the RPC.

-- Ensure RLS is enabled
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT all scores (for leaderboards)
DROP POLICY IF EXISTS "Scores are readable by everyone" ON scores;
CREATE POLICY "Scores are readable by everyone" ON scores FOR SELECT USING (true);

-- Users can only UPDATE or DELETE their OWN scores (if we even allow that)
-- But they CANNOT directly INSERT anymore without the RPC.
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
-- We intentionally do not create an INSERT policy because they should use the RPC.
