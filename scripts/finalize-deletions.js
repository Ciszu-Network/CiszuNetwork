/**
 * Finaliza las eliminaciones vencidas (15 días sin recuperar).
 *
 * - Elimina credenciales y validación: contraseña aleatoria (bcrypt) y email
 *   sin confirmar → imposible iniciar sesión con la contraseña antigua.
 * - Marca `account_deletions.status = 'expired'`.
 * - El UUID, el correo, el contenido y el respaldo PERMANECEN: el correo sigue
 *   vinculado al UUID para siempre (re-registro con disclaimer / sanciones).
 *
 * Uso: node scripts/finalize-deletions.js
 * Pensado para el workflow .github/workflows/finalize-deletions.yml (cron diario).
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

// SQL atómico: invalida credenciales/validación de las eliminaciones vencidas
// y las marca como expiradas. Las CTEs con UPDATE se ejecutan siempre.
const SQL = `
with expired as (
  select user_id
  from public.account_deletions
  where status = 'pending' and expires_at < now()
), scram as (
  update auth.users u
  set encrypted_password = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      email_confirmed_at = null,
      updated_at = now()
  from expired e
  where u.id = e.user_id
  returning u.id
)
update public.account_deletions d
set status = 'expired'
from expired e
where d.user_id = e.user_id
returning d.user_id;
`;

console.log('Finalizando eliminaciones vencidas...');

fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: SQL }),
})
  .then(async (r) => {
    const text = await r.text();
    if (r.ok || r.status === 201) {
      let rows = [];
      try {
        rows = JSON.parse(text);
      } catch {
        /* sin filas */
      }
      console.log('OK: finalizadas ' + (Array.isArray(rows) ? rows.length : 0) + ' cuentas');
    } else {
      console.log('HTTP ' + r.status + ': ' + text.substring(0, 800));
      process.exitCode = 1;
    }
  })
  .catch((e) => {
    console.error('ERR: ' + e.message);
    process.exitCode = 1;
  });
