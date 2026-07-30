const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

const wrappers = [
  // Wrapper for submit_game_score
  `CREATE OR REPLACE FUNCTION public.submit_game_score(
    p_score INTEGER,
    p_game_mode TEXT DEFAULT 'classic',
    p_player_name TEXT DEFAULT NULL
  )
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  RETURN muzicmania.submit_game_score(p_score, p_game_mode, p_player_name);
END;
$$;`,

  // Wrapper for handle_review_like
  `CREATE OR REPLACE FUNCTION public.handle_review_like(p_review_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  RETURN muzicmania.handle_review_like(p_review_id);
END;
$$;`,

  // generate_ticket_id - check if exists, recreate if needed
  `CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS text
LANGUAGE sql
SET search_path = 'public'
AS $$
  SELECT trim(to_char(nextval('public.ticket_seq'), 'FM00000000'))
$$;`,
];

async function run(sql, label) {
  console.log(`Creating ${label}...`);
  try {
    const r = await fetch(API + '/projects/' + REF + '/database/query', {
      method: 'POST', headers,
      body: JSON.stringify({ query: sql })
    });
    const d = await r.json();
    const ok = r.status === 201;
    console.log(`  ${ok ? '✓' : '✗'} ${r.status}: ${JSON.stringify(d).substring(0, 200)}`);
    return ok;
  } catch(e) {
    console.log(`  ✗ ERROR: ${e.message}`);
    return false;
  }
}

async function main() {
  for (const w of wrappers) {
    const label = w.match(/CREATE OR REPLACE FUNCTION public\.(\w+)/)?.[1] || w.match(/muzicmania\.(\w+)/)?.[1] || 'unknown';
    await run(w, label);
  }
}
main();