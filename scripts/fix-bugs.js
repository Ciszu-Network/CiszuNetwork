const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

const BUGFIXES = [
  // Fix 1: handle_new_user - change "public.profiles" → "profiles" (search_path resolves to muzicmania)
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public, extensions'
AS $func$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  v_username := LOWER(REPLACE(TRIM(COALESCE(
    NULLIF(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  )), ' ', ''));
  IF v_username IS NULL OR char_length(v_username) < 3 THEN
    v_username := 'user_' || substring(new.id::text from 1 for 8);
  END IF;
  v_display_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'display_name', ''),
    v_username
  );
  INSERT INTO profiles (
    id, username, display_name, avatar_url, email,
    country, birth_date, first_name, last_name, phone, role,
    level, xp, exp, games_played, accuracy, high_score, birth_privacy,
    email_verified
  ) VALUES (
    new.id, v_username, v_display_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'country',
    NULLIF(new.raw_user_meta_data->>'birth_date', '')::date,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'user', 1, 0, 0, 0, 0, 0, 'private', false
  )
  ON CONFLICT (id) DO UPDATE SET
    username     = COALESCE(NULLIF(EXCLUDED.username, ''), profiles.username),
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
    email        = EXCLUDED.email,
    first_name   = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name    = COALESCE(EXCLUDED.last_name, profiles.last_name),
    birth_date   = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
    country      = COALESCE(EXCLUDED.country, profiles.country),
    phone        = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN new;
END;
$func$;`,

  // Fix 2: muzicmania.submit_game_score - change "public.profiles" → "profiles"
  `CREATE OR REPLACE FUNCTION muzicmania.submit_game_score(
  p_track_id TEXT, p_score INTEGER, p_combo INTEGER,
  p_accuracy NUMERIC, p_grade TEXT DEFAULT NULL,
  p_max_combo INTEGER DEFAULT 0, p_perfect INTEGER DEFAULT 0,
  p_great INTEGER DEFAULT 0, p_good INTEGER DEFAULT 0,
  p_miss INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $func$
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
  FROM profiles WHERE id = v_user_id;
  IF p_score > COALESCE(v_current_high_score, 0) THEN
    v_current_high_score := p_score;
  END IF;
  v_current_exp := v_current_exp + v_exp_gained;
  v_new_level := GREATEST(v_current_level, FLOOR(v_current_exp / 1000) + 1);
  SELECT ROUND(AVG(accuracy), 2) INTO v_avg_accuracy
  FROM scores WHERE user_id = v_user_id;
  UPDATE profiles SET
    exp = v_current_exp, xp = v_current_exp,
    level = v_new_level, high_score = v_current_high_score,
    games_played = COALESCE(games_played, 0) + 1,
    accuracy = COALESCE(v_avg_accuracy, p_accuracy)
  WHERE id = v_user_id;
END;
$func$;`,
];

async function run(sql, label) {
  console.log(`Fixing ${label}...`);
  try {
    const r = await fetch(API + '/projects/' + REF + '/database/query', {
      method: 'POST', headers,
      body: JSON.stringify({ query: sql })
    });
    const d = await r.json();
    console.log(`  ${r.status === 201 ? '✓' : '✗'} ${r.status}: ${JSON.stringify(d).substring(0, 200)}`);
  } catch(e) { console.log(`  ✗ ERROR: ${e.message}`); }
}

async function main() {
  for (const sql of BUGFIXES) {
    const label = sql.match(/FUNCTION[ (]+(\w+\.\w+)/)?.[1] || 'unknown';
    await run(sql, label);
  }
}
main();