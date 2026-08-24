// advisor.js — envío de mensajes globales (GLOBAL_ADVISOR_SYSTEM, TODO #3).
//
// Envía un anuncio a la tabla ciszunetwork.global_announcements que las webs
// muestran como toast. Solo personal staff/admin (vía service role key local).
//
// Uso:
//   node scripts/advisor.js "Mensaje" --target global --kind info --sender ciszuko
//   node scripts/advisor.js "Aviso para muzic" --target muzicmania --kind warning
//   node scripts/advisor.js "Offline 3h" --target ciszu,ciszubot --kind error --expires "2026-08-25T12:00:00Z"
//   node scripts/advisor.js --list                 # lista anuncios activos (últimos 7 días)
//   node scripts/advisor.js --clear <id> [ids...]  # borra anuncios (reset)
//   node scripts/advisor.js --clear-all            # borra TODOS los anuncios
//
// Opciones:
//   --target    global | ciszu | ciszukoantony | muzicmania | ciszubot | lista separada por comas
//   --kind      info | success | warning | error        (default info)
//   --sender    quien lo envía (default 'admin')
//   --source    origen (default 'dev-console')
//   --expires   timestamp ISO de expiración (opcional)

const fs = require('fs');
const path = require('path');

// Cargar envs del vault local o de los .env.local de las webs
const ENV_SOURCES = [
  path.resolve(__dirname, '..', 'services', 'supabase', '.env'),
  path.resolve(__dirname, '..', 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, '..', 'projects', 'ciszubot', 'website', '.env.local'),
  path.resolve(__dirname, '..', 'projects', 'muzicmania', 'website', '.env.local'),
];
for (const envPath of ENV_SOURCES) {
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
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
// Service role key: permite insertar/borrar como admin sin pasar por RLS de auth.
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no encontrado en services/supabase/.env');
  process.exit(1);
}

const args = process.argv.slice(2);
const msgIndex = args.findIndex((a) => !a.startsWith('--'));
const message = msgIndex >= 0 ? args[msgIndex] : null;

function flag(name, def = null) {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return def;
}

async function api(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'ciszunetwork',
      'Content-Profile': 'ciszunetwork',
      Prefer: 'return=representation',
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}

async function run() {
  if (args.includes('--list')) {
    const rows = await api(
      'global_announcements',
      { method: 'GET' }
    );
    console.log(`\n📢 Anuncios en BD (${rows.length}):`);
    for (const r of rows) {
      console.log(`  [${r.id}] ${r.kind.toUpperCase()} target=${r.target} sender=${r.sender} (${r.source})`);
      console.log(`        "${r.message}" creado ${r.created_at} exp=${r.expires_at || '-'}`);
    }
    return;
  }

  if (args.includes('--clear-all')) {
    const rows = await api('global_announcements?id=neq.0', { method: 'DELETE' });
    console.log(`🗑️  Anuncios borrados: ${Array.isArray(rows) ? rows.length : 'ok'}`);
    return;
  }

  const clearIdx = args.indexOf('--clear');
  if (clearIdx >= 0) {
    const ids = args.slice(clearIdx + 1).filter((a) => /^\d+$/.test(a));
    for (const id of ids) {
      await api(`global_announcements?id=eq.${id}`, { method: 'DELETE' });
      console.log(`🗑️  Borrado anuncio ${id}`);
    }
    return;
  }

  if (!message) {
    console.log('Uso: node scripts/advisor.js "Mensaje" [--target global|web] [--kind info|success|warning|error] [--sender nombre] [--expires ISO]');
    console.log('     node scripts/advisor.js --list | --clear <id...> | --clear-all');
    process.exit(1);
  }

  const target = flag('target', 'global');
  const kind = flag('kind', 'info');
  const sender = flag('sender', 'admin');
  const source = flag('source', 'dev-console');
  const expires = flag('expires');

  if (!['info', 'success', 'warning', 'error'].includes(kind)) {
    console.error(`❌ kind inválido: ${kind}. Opciones: info|success|warning|error`);
    process.exit(1);
  }

  const payload = {
    sender,
    source,
    message,
    kind,
    target,
    expires_at: expires || null,
  };

  const rows = await api('global_announcements', { method: 'POST', body: JSON.stringify(payload) });
  const created = Array.isArray(rows) ? rows[0] : rows;
  console.log(`✅ Anuncio enviado: [${created?.id}] ${kind.toUpperCase()} → ${target}`);
  console.log(`   "${message}" de ${sender} (${source})${expires ? `, expira ${expires}` : ''}`);
}

run().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});