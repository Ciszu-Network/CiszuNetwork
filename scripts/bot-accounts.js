/**
 * Cuentas bot del ecosistema (@ciszubot, @muzicmania, @ciszunetwork).
 *
 * - Sin contraseña utilizable: se crea con una contraseña aleatoria que nadie
 *   conoce (nadie puede iniciar sesión con ellas).
 * - Email interno (bot+<username>@ciszunetwork.com) solo como identificador;
 *   puede cambiarse después en el panel si hiciera falta.
 * - Rol 'bot' en su website: permisos de staff en los paneles (no son staff
 *   ni llevan tag de staff, pero sí permisos).
 *
 * Uso: node scripts/bot-accounts.js
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SERVICE || !TOKEN) {
  console.error('Faltan SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const BOTS = [
  { site: 'ciszubot', username: 'ciszubot', name: 'CiszuBot' },
  { site: 'muzicmania', username: 'muzicmania', name: 'MuzicMania' },
  { site: 'ciszunetwork', username: 'ciszunetwork', name: 'Ciszu Network' },
];

const headers = {
  apikey: SERVICE,
  Authorization: 'Bearer ' + SERVICE,
  'Content-Type': 'application/json',
};

async function sql(query) {
  const res = await fetch(API + '/projects/' + REF + '/database/query', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok && res.status !== 201) throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 300));
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

(async () => {
  for (const bot of BOTS) {
    const email = `bot+${bot.username}@ciszunetwork.com`;

    const existing = await sql(
      `select id, email from auth.users where email = '${email}' or lower(coalesce(raw_user_meta_data->>'username','')) = '${bot.username}' limit 1;`,
    );
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`SKIP ${bot.username}: ya existe (${existing[0].email})`);
    } else {
      const res = await fetch(URL + '/auth/v1/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          password: crypto.randomBytes(32).toString('hex'),
          email_confirm: true,
          user_metadata: { username: bot.username, display_name: bot.name },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`ERR ${bot.username}: HTTP ${res.status} ${text.slice(0, 200)}`);
        continue;
      }
      console.log(`OK ${bot.username}: cuenta creada (${email})`);
    }

    await sql(`
      insert into public.user_roles (user_id, website, role, granted_by)
      select u.id, '${bot.site}', 'bot', 'bot-system'
      from auth.users u
      where lower(coalesce(u.raw_user_meta_data->>'username','')) = '${bot.username}'
      on conflict (user_id, website) do update
        set role = excluded.role, granted_by = excluded.granted_by, created_at = now();
    `);
    console.log(`   rol 'bot' asignado en ${bot.site}`);
  }

  const roles = await sql(
    `select ur.website, ur.role, u.raw_user_meta_data->>'username' as username from public.user_roles ur join auth.users u on u.id = ur.user_id order by ur.website;`,
  );
  console.log('--- roles actuales ---');
  for (const r of Array.isArray(roles) ? roles : []) {
    console.log(`${r.website.padEnd(14)} ${r.role.padEnd(8)} @${r.username}`);
  }
})();
