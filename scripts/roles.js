/**
 * Roles/tags de usuario por website (global, un rol por usuario y web).
 *
 * Uso:
 *   node scripts/roles.js list [website]
 *   node scripts/roles.js grant <website> <username> <role> [actor]
 *   node scripts/roles.js revoke <website> <username>
 *
 * Roles: owner | admin | mod | bot | vip | betatesting | support
 * Websites: ciszunetwork | ciszubot | ciszukoantony | muzicmania
 *
 * Usa la Management API (SUPABASE_ACCESS_TOKEN del vault). Solo service-role
 * escribe en `public.user_roles` (RLS: lectura pública para tags de perfil).
 */
const path = require('path');
const fs = require('fs');

const envCandidates = [
  path.resolve(__dirname, '..', 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, 'services', 'supabase', '.env.local'),
  path.join(process.cwd(), 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, '..', 'services', 'supabase', '.env'),
  path.resolve(__dirname, 'services', 'supabase', '.env'),
  path.join(process.cwd(), 'services', 'supabase', '.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eq = trimmed.indexOf('=');
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
    break;
  }
}

const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN not found');
  process.exit(1);
}

const WEBSITES = ['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania'];
const ROLES = ['owner', 'admin', 'mod', 'bot', 'vip', 'betatesting', 'support'];

const q = (value) => String(value).replace(/'/g, "''");

async function runSql(query) {
  const res = await fetch(API + '/projects/' + REF + '/database/query', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok && res.status !== 201) {
    throw new Error('HTTP ' + res.status + ': ' + text.substring(0, 500));
  }
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

function usage() {
  console.log('Uso:');
  console.log('  node scripts/roles.js list [website]');
  console.log('  node scripts/roles.js grant <website> <username> <role> [actor]');
  console.log('  node scripts/roles.js revoke <website> <username>');
  console.log('Roles: ' + ROLES.join(' | '));
  console.log('Websites: ' + WEBSITES.join(' | '));
}

(async () => {
  const [cmd, site, username, role, actor = 'devcon'] = process.argv.slice(2);

  if (!cmd || cmd === 'help') {
    usage();
    process.exit(0);
  }

  try {
    if (cmd === 'list') {
      const where = site ? `where ur.website = '${q(site)}'` : '';
      const rows = await runSql(`
        select ur.website, ur.role, coalesce(u.raw_user_meta_data->>'username', u.email) as usuario,
               ur.granted_by, ur.created_at::date as desde
        from public.user_roles ur
        join auth.users u on u.id = ur.user_id
        ${where}
        order by ur.website, ur.role, usuario;
      `);
      if (!Array.isArray(rows) || rows.length === 0) {
        console.log('(sin roles asignados' + (site ? ` en ${site}` : '') + ')');
        return;
      }
      for (const r of rows) {
        console.log(`${r.website.padEnd(14)} ${String(r.role).padEnd(11)} @${r.usuario}  (por ${r.granted_by}, ${r.desde})`);
      }
      return;
    }

    if (cmd === 'grant' || cmd === 'revoke') {
      if (!site || !WEBSITES.includes(site)) {
        console.error('Website inválido. Usa: ' + WEBSITES.join(' | '));
        process.exit(1);
      }
      if (!username || !/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
        console.error('Username inválido (3-32: letras, números, _ . -).');
        process.exit(1);
      }

      if (cmd === 'grant') {
        if (!role || !ROLES.includes(role)) {
          console.error('Rol inválido. Usa: ' + ROLES.join(' | '));
          process.exit(1);
        }
        const rows = await runSql(`
          insert into public.user_roles (user_id, website, role, granted_by)
          select u.id, '${q(site)}', '${q(role)}', '${q(actor)}'
          from auth.users u
          where lower(coalesce(u.raw_user_meta_data->>'username', '')) = lower('${q(username)}')
          on conflict (user_id, website) do update
            set role = excluded.role, granted_by = excluded.granted_by, created_at = now()
          returning user_id, website, role;
        `);
        if (!Array.isArray(rows) || rows.length === 0) {
          console.error(`Usuario @${username} no encontrado (username exacto en auth.users).`);
          process.exit(1);
        }
        console.log(`OK: @${username} ahora es '${role}' en ${site} (por ${actor}).`);
        return;
      }

      const rows = await runSql(`
        delete from public.user_roles ur
        using auth.users u
        where ur.user_id = u.id
          and ur.website = '${q(site)}'
          and lower(coalesce(u.raw_user_meta_data->>'username', '')) = lower('${q(username)}')
        returning ur.user_id;
      `);
      if (!Array.isArray(rows) || rows.length === 0) {
        console.error(`@${username} no tenía rol en ${site}.`);
        process.exit(1);
      }
      console.log(`OK: rol de @${username} en ${site} eliminado.`);
      return;
    }

    usage();
    process.exit(1);
  } catch (err) {
    console.error('ERR: ' + err.message);
    process.exit(1);
  }
})();
