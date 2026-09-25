/**
 * Verificación de solo lectura de los advisors de seguridad.
 *
 * Reproduce las condiciones de los lints de Supabase (0024, 0028 y 0029)
 * contra la base de datos remota y muestra el resultado en JSON:
 *   - políticas de las tablas de entrega (¿queda algún USING/WITH CHECK true?)
 *   - política de borrado de reseñas de los 4 schemas
 *   - funciones SECURITY DEFINER ejecutables por anon/authenticated
 *   - funciones del schema `private`
 *   - copias antiguas de user_is_admin que hubieran quedado
 *
 * Uso: node tmp/verify-advisors.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve('services', 'supabase', '.env');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const eq = t.indexOf('=');
  const key = t.slice(0, eq).trim();
  const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  if (!process.env[key]) process.env[key] = val;
}

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = 'obwzzmbvkrcscqwptlqo';
if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN not found');
  process.exit(1);
}

const query = `
select jsonb_pretty(jsonb_build_object(
  'exposed_schemas', (select coalesce(current_setting('pgrst.db_schemas', true), '(no seteado)')),
  'delivery_policies', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', schemaname, 'table', tablename, 'policy', policyname,
      'cmd', cmd, 'roles', roles, 'qual', qual, 'with_check', with_check
    ) order by tablename, policyname), '[]'::jsonb)
    from pg_policies
    where schemaname = 'ciszunetwork' and tablename like 'global%deliveries'
  ),
  'reviews_delete_policies', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', schemaname, 'policy', policyname, 'qual', qual
    ) order by schemaname), '[]'::jsonb)
    from pg_policies
    where tablename = 'reviews' and cmd = 'DELETE'
  ),
  'definer_executable_by_anon_or_auth', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', n.nspname, 'fn', p.proname,
      'args', pg_get_function_identity_arguments(p.oid),
      'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
      'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE')
    ) order by n.nspname, p.proname), '[]'::jsonb)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.prosecdef
      and n.nspname in ('public', 'ciszubot', 'ciszunetwork', 'ciszukoantony', 'muzicmania')
      and (has_function_privilege('anon', p.oid, 'EXECUTE')
        or has_function_privilege('authenticated', p.oid, 'EXECUTE'))
  ),
  'private_schema_functions', (
    select coalesce(jsonb_agg(p.proname order by p.proname), '[]'::jsonb)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
  ),
  'definer_executable_any_non_internal_schema', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', n.nspname, 'fn', p.proname,
      'args', pg_get_function_identity_arguments(p.oid)
    ) order by n.nspname, p.proname), '[]'::jsonb)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.prosecdef
      and (has_function_privilege('anon', p.oid, 'EXECUTE')
        or has_function_privilege('authenticated', p.oid, 'EXECUTE'))
      and n.nspname not in (
        '_timescaledb_cache', '_timescaledb_catalog', '_timescaledb_config',
        '_timescaledb_internal', 'auth', 'cron', 'extensions', 'graphql',
        'graphql_public', 'information_schema', 'net', 'pgmq', 'pgroonga',
        'pgsodium', 'pgsodium_masks', 'pgtle', 'pgbouncer', 'pg_catalog',
        'realtime', 'repack', 'storage', 'supabase_functions',
        'supabase_migrations', 'tiger', 'topology', 'vault'
      )
  ),
  'user_is_admin_left_in_exposed_schemas', (
    select coalesce(jsonb_agg(n.nspname), '[]'::jsonb)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'user_is_admin'
      and n.nspname in ('ciszubot', 'ciszunetwork', 'ciszukoantony', 'muzicmania')
  )
));
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${text.slice(0, 800)}`);
  process.exit(1);
}
try {
  const rows = JSON.parse(text);
  console.log(rows[0]?.['jsonb_pretty'] ?? JSON.stringify(rows, null, 2));
} catch {
  console.log(text.slice(0, 4000));
}

// Lista oficial de advisors (Management API).
const advisorsRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/advisors/security`, {
  headers: { Authorization: 'Bearer ' + TOKEN },
});
const advisorsBody = await advisorsRes.text();
console.log(`\n=== advisors/security (HTTP ${advisorsRes.status}) ===`);
if (!advisorsRes.ok) {
  console.log(advisorsBody.slice(0, 400));
} else {
  try {
    const parsed = JSON.parse(advisorsBody);
    const list = Array.isArray(parsed) ? parsed : (parsed.lints ?? []);
    for (const l of list) {
      console.log(`${l.level} ${l.name} | ${l.cache_key ?? ''}`);
    }
    console.log(`total: ${list.length}`);
  } catch {
    console.log(advisorsBody.slice(0, 1500));
  }
}
