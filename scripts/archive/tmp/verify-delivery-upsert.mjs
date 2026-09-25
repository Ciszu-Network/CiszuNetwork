/**
 * Verifica el flujo real de confirmación de entrega que hace el front:
 * un upsert (POST + Prefer: resolution=merge-duplicates) con la clave anónima.
 *
 * Cada caso se ejecuta dentro de `begin; ... rollback;`, así que NO deja
 * cambios en la base de datos: se siembra una fila padre temporal, se hace
 * el upsert dos veces con el rol `anon` (1ª INSERT, 2ª ON CONFLICT DO
 * UPDATE, que es el camino que usa PostgREST) y se comprueba que un site
 * inventado sigue rechazado.
 *
 * Uso: node tmp/verify-delivery-upsert.mjs
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

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return { status: res.status, text: await res.text() };
}

const cases = [
  {
    table: 'global_ads_deliveries',
    fk: 'ad_id',
    parent: 'global_ads',
    seed: `insert into ciszunetwork.global_ads (title, target) values ('__verify_tmp__', 'global')`,
    pick: `select id from ciszunetwork.global_ads where title = '__verify_tmp__' order by id desc limit 1`,
  },
  {
    table: 'global_changelog_deliveries',
    fk: 'entry_id',
    parent: 'global_changelogs',
    seed: `insert into ciszunetwork.global_changelogs (slug, version, title, published)
           values ('__verify_tmp__', '0.0.0', '__verify_tmp__', true)`,
    pick: `select id from ciszunetwork.global_changelogs where slug = '__verify_tmp__' limit 1`,
  },
  {
    table: 'global_disclaimer_deliveries',
    fk: 'disclaimer_id',
    parent: 'global_disclaimers',
    seed: `insert into ciszunetwork.global_disclaimers (message) values ('__verify_tmp__')`,
    pick: `select id from ciszunetwork.global_disclaimers where message = '__verify_tmp__' order by id desc limit 1`,
  },
];

const upsert = (c, label) => `
insert into ciszunetwork.${c.table} (${c.fk}, site)
select id, 'ciszu' from (${c.pick}) p
on conflict (${c.fk}, site) do update set delivered_at = now()
returning '${label}' as step;`;

for (const c of cases) {
  const good = await sql(`
begin;
${c.seed};
set local role anon;
${upsert(c, 'insert ok')}
${upsert(c, 'conflict-update ok')}
rollback;
`);

  const bogus = await sql(`
begin;
${c.seed};
set local role anon;
insert into ciszunetwork.${c.table} (${c.fk}, site)
select id, 'site-inventado' from (${c.pick}) p;
rollback;
`);

  console.log(`\n=== ${c.table} ===`);
  console.log(`upsert anon (HTTP ${good.status}): ${good.text.trim().slice(0, 400)}`);
  console.log(`site inválido (HTTP ${bogus.status}): ${bogus.text.trim().slice(0, 300).replace(/\n/g, ' ')}`);
}
