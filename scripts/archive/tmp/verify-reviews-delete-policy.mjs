/**
 * Verifica, dentro de `begin; ... rollback;` (sin cambios permanentes), que
 * tras mover `user_is_admin` al schema `private` siguen funcionando:
 *   1. La llamada a la función privada desde el rol `authenticated`
 *      (USAGE + EXECUTE → sin "permission denied for function").
 *   2. La política de borrado: un usuario cualquiera NO puede borrar la
 *      reseña de otro (0 filas, sin error: la función se evalúa bien).
 *   3. El flujo normal del autor: INSERT de like + UPDATE + DELETE de su
 *      propia reseña (y con ello los triggers con EXECUTE revocado).
 *   4. En MuzicMania, que la función devuelve true con role='admin' y con
 *      is_admin=true.
 *
 * Uso: node tmp/verify-reviews-delete-policy.mjs
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
  return { status: res.status, text: (await res.text()).trim() };
}

const users = await sql(`select id::text as id from auth.users order by created_at limit 1;`);
const [user] = JSON.parse(users.text);
const uid = user.id;
const stranger = '11111111-1111-1111-1111-111111111111';

const asRole = (sub) =>
  `set local role authenticated;\nset local request.jwt.claims = '{"sub":"${sub}","role":"authenticated"}';`;

async function privateFnCheck(schema) {
  const res = await sql(`
begin;
${asRole(stranger)}
select private.${schema}_user_is_admin('${uid}') as es_admin;
rollback;
`);
  console.log(
    `private.${schema}_user_is_admin llamada como authenticated (HTTP ${res.status}): ${res.text.slice(0, 200).replace(/\n/g, ' ')}`,
  );
}

for (const s of ['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania']) {
  console.log(`\n=== ${s} (uid de prueba: ${uid}) ===`);

  await privateFnCheck(s);

  // 2: usuario ajeno intenta borrar la reseña → 0 filas, sin error de permisos.
  const strangerDelete = await sql(`
begin;
insert into ${s}.reviews (user_id, rating, comment)
values ('${uid}', 5, '__verify_tmp__')
on conflict (user_id) do update set comment = '__verify_tmp__';
${asRole(stranger)}
delete from ${s}.reviews where user_id = '${uid}' returning 'deleted' as step;
rollback;
`);
  console.log(
    `usuario ajeno borra reseña (HTTP ${strangerDelete.status}): ${strangerDelete.text.slice(0, 250).replace(/\n/g, ' ')}`,
  );

  // 3a: el autor hace like y borra su reseña → dispara handle_review_like.
  const likeFlow = await sql(`
begin;
insert into ${s}.reviews (user_id, rating, comment)
values ('${uid}', 5, '__verify_tmp__')
on conflict (user_id) do update set comment = '__verify_tmp__';
${asRole(uid)}
insert into ${s}.review_likes (user_id, review_id)
select '${uid}', r.id from ${s}.reviews r where r.user_id = '${uid}'
on conflict do nothing;
delete from ${s}.reviews where user_id = '${uid}' returning 'like+delete ok' as step;
rollback;
`);
  console.log(
    `autor hace like y borra (HTTP ${likeFlow.status}): ${likeFlow.text.slice(0, 250).replace(/\n/g, ' ')}`,
  );

  // 3b: el autor edita su reseña sin likes → dispara handle_review_update.
  const editFlow = await sql(`
begin;
insert into ${s}.reviews (user_id, rating, comment)
values ('${uid}', 5, '__verify_tmp__')
on conflict (user_id) do update set comment = '__verify_tmp__';
${asRole(uid)}
update ${s}.reviews set comment = '__verify_tmp_editado__' where user_id = '${uid}';
delete from ${s}.reviews where user_id = '${uid}' returning 'edit+delete ok' as step;
rollback;
`);
  console.log(
    `autor edita (sin likes) y borra (HTTP ${editFlow.status}): ${editFlow.text.slice(0, 250).replace(/\n/g, ' ')}`,
  );
}

// 4: MuzicMania tiene una fila en profiles → comprobamos las dos marcas de admin.
for (const [label, update] of [
  ['role = admin', `update muzicmania.profiles set role = 'admin' where id = '${uid}'`],
  ['is_admin = true', `update muzicmania.profiles set is_admin = true where id = '${uid}'`],
]) {
  const res = await sql(`
begin;
${update};
${asRole(uid)}
select private.muzicmania_user_is_admin('${uid}') as es_admin;
rollback;
`);
  console.log(`\nmuzicmania con ${label} (HTTP ${res.status}): ${res.text.slice(0, 200).replace(/\n/g, ' ')}`);
}
