// advisor.js — envío/gestión de mensajes globales (GLOBAL_ADVISOR_SYSTEM, TODO #3).
//
// Envía anuncios a ciszunetwork.global_announcements que las webs muestran como
// toast, gestiona el kill switch global (global_announcement_settings) y espera
// confirmación de entrega por web (global_announcement_deliveries).
// Solo personal staff/admin (vía service role key local).
//
// Uso:
//   node scripts/advisor.js "Mensaje" --target global --kind info --sender ciszuko [--session <id>] [--wait]
//   node scripts/advisor.js --status                 # kill switch + anuncios activos
//   node scripts/advisor.js --toggle on|off          # activar/desactivar mensajes globales
//   node scripts/advisor.js --list                   # lista anuncios activos (últimos 7 días)
//   node scripts/advisor.js --clear <id> [ids...]    # borra anuncios (reset)
//   node scripts/advisor.js --clear-all              # borra TODOS los anuncios
//
// Opciones:
//   --target    global | ciszu | ciszukoantony | muzicmania | ciszubot | lista separada por comas
//   --kind      info | success | warning | error        (default info)
//   --sender    quien lo envía (default 'admin')
//   --source    origen (default 'dev-console')
//   --expires   timestamp ISO de expiración (opcional)
//   --wait      tras enviar, espera confirmación de entrega de cada web destino (max ~30s)
//   --session   id de sesión para el log de auditoría (lo genera el devcon)

const fs = require('fs');
const path = require('path');
const { detectProfanity } = require('./profanity');

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

const ALL_SITES = ['ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot'];

// ---------- Log de auditoría (local, gitignored) ----------
// Los mensajes/acciones quedan registrados con fecha/sesión para poder
// trackear quién envió qué y cuándo. Ruta: test/website/debug/local-logs/advisor-YYYYMMDD.log
const LOG_DIR = path.resolve(__dirname, '..', 'test', 'website', 'debug', 'local-logs');
function auditLog(entry) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:]/g, '-').slice(0, 10);
    const file = path.join(LOG_DIR, `advisor-${stamp}.log`);
    fs.appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n', 'utf8');
  } catch { /* el log nunca debe romper la acción */ }
}

const args = process.argv.slice(2);
const msgIndex = args.findIndex((a) => !a.startsWith('--'));
const message = msgIndex >= 0 ? args[msgIndex] : null;

function flag(name, def = null) {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return def;
}

function sessionId() {
  return flag('session') || `cli-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

async function api(path, options = {}, schema = 'ciszunetwork') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': schema,
      'Content-Profile': schema,
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeSites(target) {
  if (target === 'global') return ALL_SITES.slice();
  return target.split(',').map((s) => s.trim()).filter(Boolean);
}

// ---------- Filtro de profanidad ----------
// Detecta insultos/obscenidades (es/en) en el mensaje y en el autor. Si se
// detecta, se registra en el log y se sale con código 2 para que el devcon
// se cierre (seguridad/rastreo).
function failProfanity(what, value, found) {
  auditLog({ session: sessionId(), action: 'blocked-profanity', field: what, value, matched: found });
  console.error(`🚫 Contenido prohibido detectado en ${what === 'message' ? 'el mensaje' : 'el autor'}: "${found}"`);
  console.error('   La operación se ha cancelado y se ha registrado el intento (sesión + fecha).');
  const e = new Error('blocked-profanity');
  e.isProfanity = true;
  throw e;
}

function assertClean(text, what) {
  const found = detectProfanity(text);
  if (found) failProfanity(what, text, found);
}

// ---------- Resolución de perfil verificado del emisor ----------
// Si el sender coincide con un username de la BD de alguna web destino, se
// guarda display_name + @username + site para que el front muestre el badge
// verificado y enlace a su perfil. Si no existe, se usa la versión normal.
async function resolveSenderProfile(sender, sites) {
  const username = String(sender || '').trim().replace(/^@/, '');
  if (!username) return null;
  const norm = username.toLowerCase();
  for (const site of sites) {
    try {
      const rows = await api(
        `profiles?username=ilike.${encodeURIComponent(norm)}*&select=username,display_name`,
        { method: 'GET' },
        site
      );
      const found = Array.isArray(rows) ? rows.find((r) => {
        const u = String(r.username || '').toLowerCase().replace(/_+$/, '');
        return u === norm || u === norm.replace(/_+$/, '');
      }) : null;
      if (found) {
        return {
          sender_display_name: found.display_name || found.username || username,
          sender_username: found.username || username,
          sender_site: site,
        };
      }
    } catch { /* ese sitio no tiene perfiles o no coincide; seguir */ }
  }
  return null;
}

async function status() {
  const settings = await api('global_announcement_settings?id=eq.1');
  const enabled = Array.isArray(settings) && settings.length ? settings[0].enabled : true;
  const rows = await api('global_announcements');
  console.log(`\n🔘 Kill switch (mensajes globales): ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  console.log(`📢 Anuncios en BD (${rows.length}):`);
  for (const r of rows) {
    console.log(`  [${r.id}] ${r.kind.toUpperCase()} target=${r.target} sender=${r.sender} (${r.source})`);
    console.log(`        "${r.message}" creado ${r.created_at} exp=${r.expires_at || '-'}`);
  }
  return enabled;
}

async function setEnabled(enabled, by) {
  const now = new Date().toISOString();
  await api('global_announcement_settings?id=eq.1', {
    method: 'PATCH',
    body: JSON.stringify({ enabled, updated_at: now, updated_by: by || 'dev-console' }),
  });
  const settings = await api('global_announcement_settings?id=eq.1');
  const cur = Array.isArray(settings) && settings.length ? settings[0].enabled : null;
  console.log(`${enabled ? '🟢' : '🔴'} Mensajes globales ${cur ? 'ACTIVADOS' : 'DESACTIVADOS'}.`);
  auditLog({ session: sessionId(), action: enabled ? 'toggle-on' : 'toggle-off', by: by || 'dev-console' });
}

async function waitForDelivery(announcementId, sites, timeoutMs = 45000) {
  const started = Date.now();
  const done = new Set();
  const inList = `(${sites.map((s) => `"${s}"`).join(',')})`;
  console.log(`⏳ Esperando confirmación de entrega (máx ${Math.round(timeoutMs / 1000)}s):`);
  while (Date.now() - started < timeoutMs) {
    const rows = await api(
      `global_announcement_deliveries?announcement_id=eq.${announcementId}&site=in.${inList}&select=site,delivered_at`
    );
    const bySite = new Map((Array.isArray(rows) ? rows : []).map((r) => [r.site, r.delivered_at]));
    for (const site of sites) {
      if (!done.has(site)) {
        const at = bySite.get(site);
        if (at) {
          done.add(site);
          console.log(`  ✅ ${site.padEnd(14)} entregado ${at}`);
        } else {
          console.log(`  ⏳ ${site.padEnd(14)} pendiente...`);
        }
      }
    }
    if (done.size === sites.length) return true;
    await sleep(2500);
  }
  for (const site of sites) {
    if (!done.has(site)) console.log(`  ⚠️  ${site.padEnd(14)} sin confirmación (timeout)`);
  }
  return false;
}

async function run() {
  if (args.includes('--status')) {
    await status();
    return;
  }

  const toggleIdx = args.indexOf('--toggle');
  if (toggleIdx >= 0) {
    const val = (args[toggleIdx + 1] || '').toLowerCase();
    if (val !== 'on' && val !== 'off') {
      console.error('❌ --toggle requiere "on" o "off"');
      process.exit(1);
    }
    const by = flag('sender', 'admin');
    assertClean(by, 'sender');
    await setEnabled(val === 'on', by);
    return;
  }

  if (args.includes('--list')) {
    const rows = await api('global_announcements');
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
    auditLog({ session: sessionId(), action: 'clear-all', count: Array.isArray(rows) ? rows.length : 0 });
    return;
  }

  const clearIdx = args.indexOf('--clear');
  if (clearIdx >= 0) {
    const ids = args.slice(clearIdx + 1).filter((a) => /^\d+$/.test(a));
    const by = flag('sender', 'admin');
    assertClean(by, 'sender');
    for (const id of ids) {
      await api(`global_announcements?id=eq.${id}`, { method: 'DELETE' });
      console.log(`🗑️  Borrado anuncio ${id}`);
    }
    auditLog({ session: sessionId(), action: 'clear', ids, by });
    return;
  }

  if (!message) {
    console.log('Uso: node scripts/advisor.js "Mensaje" [--target global|web] [--kind info|success|warning|error] [--sender nombre] [--expires ISO] [--wait] [--session id]');
    console.log('     node scripts/advisor.js --status | --list | --toggle on|off | --clear <id...> | --clear-all');
    process.exit(1);
  }

  // Antes de enviar, comprobar el kill switch (a menos que el emisor lo conozca).
  const target = flag('target', 'global');
  const kind = flag('kind', 'info');
  const sender = flag('sender', 'admin');
  const source = flag('source', 'dev-console');
  const expires = flag('expires');
  const wait = args.includes('--wait');

  if (!['info', 'success', 'warning', 'error'].includes(kind)) {
    console.error(`❌ kind inválido: ${kind}. Opciones: info|success|warning|error`);
    auditLog({ session: sessionId(), action: 'error', error: `kind inválido: ${kind}`, sender, target });
    process.exit(1);
  }

  // Límites de longitud del mensaje (2..620 caracteres).
  const len = Array.from(message).length;
  if (len < 2 || len > 620) {
    console.error(`❌ El mensaje debe tener entre 2 y 620 caracteres (actual: ${len}).`);
    auditLog({ session: sessionId(), action: 'error', error: `longitud de mensaje ${len}`, sender, target });
    process.exit(1);
  }

  // Filtro de profanidad en mensaje Y autor (es/en). Si se detecta -> exit(2)
  // para que el devcon se cierre y quede el intento registrado en el log.
  assertClean(message, 'message');
  assertClean(sender, 'sender');

  const settings = await api('global_announcement_settings?id=eq.1');
  const enabled = Array.isArray(settings) && settings.length ? settings[0].enabled : true;
  if (!enabled) {
    console.error('🚫 Mensajes globales DESACTIVADOS (kill switch). Usa --toggle on para reactivar.');
    auditLog({ session: sessionId(), action: 'blocked-killswitch', message, sender, target, kind });
    const e = new Error('blocked-killswitch');
    e.isKillSwitch = true;
    throw e;
  }

  // Resolver perfil verificado del emisor (staff/cuenta real en alguna web destino)
  const sites = normalizeSites(target);
  const profile = await resolveSenderProfile(sender, sites);
  const payload = {
    sender,
    source,
    message,
    kind,
    target,
    expires_at: expires || null,
    sender_display_name: profile?.sender_display_name ?? null,
    sender_username: profile?.sender_username ?? null,
    sender_site: profile?.sender_site ?? null,
  };
  if (profile) {
    console.log(`👤 Emisor verificado: ${profile.sender_display_name} @${profile.sender_username} (${profile.sender_site})`);
  }

  const rows = await api('global_announcements', { method: 'POST', body: JSON.stringify(payload) });
  const created = Array.isArray(rows) ? rows[0] : rows;
  const id = created?.id;
  console.log(`✅ Anuncio enviado: [${id}] ${kind.toUpperCase()} → ${target}`);
  console.log(`   "${message}" de ${sender} (${source})${expires ? `, expira ${expires}` : ''}`);
  auditLog({
    session: sessionId(), action: 'send', id, sender, source, target, kind, message,
    sender_profile: profile,
  });

  if (wait && id != null) {
    await waitForDelivery(id, sites);
  }
}

run().catch((e) => {
  if (e.isProfanity) {
    // Devcon: exit code 2 = cerrar la consola por seguridad.
    process.exitCode = 2;
    return;
  }
  if (e.isKillSwitch) {
    process.exitCode = 1;
    return;
  }
  console.error('❌ Error:', e.message);
  auditLog({ session: sessionId(), action: 'error', error: e.message, argv: args.slice(0, 8) });
  process.exitCode = 1;
});