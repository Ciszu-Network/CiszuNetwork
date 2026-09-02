// uptime-watch.js — watcher de UptimeRobot → ntfy (gratis, sin infraestructura).
// Consulta la API v3 de UptimeRobot y publica en ntfy SOLO los cambios de estado
// de los monitores (DOWN: urgente; UP: informativo; PAUSED: aviso).
//
// Por qué existe: el plan free de UptimeRobot no permite alert contacts webhook
// (los webhooks son de pago), así que UptimeRobot no puede hablar con ntfy
// directamente. Este script se ejecuta como cron (GitHub Actions, cada 5 min) y
// hace de "vigía": si un monitor cambia de estado, avisa por push a ntfy.
//
// Uso:
//   node scripts/uptime-watch.js            (consulta y publica cambios)
//   node scripts/uptime-watch.js --dry-run  (muestra lo que haría, sin publicar)
//   node scripts/uptime-watch.js --state <file> (state file alternativo)
//
// Configuración (en orden de prioridad):
//   1. Variables de entorno UPTIMEROBOT_API_KEY / NOTIFY_TOPIC
//   2. Key del fichero .env.local de la raíz del repo
//   3. Key del fichero services/supabase/.env (vault)
//
// El estado previo se guarda en .opencode/temp/uptime-state.json (gitignored;
// en CI lo mantiene el cache de GitHub Actions). En el primer run no publica
// nada (solo inicializa el estado) para no spamear.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER = process.env.NOTIFY_SERVER || 'https://ntfy.sh';
const STATE_FILE_DEFAULT = path.join(ROOT, '.opencode', 'temp', 'uptime-state.json');

function readEnvFiles() {
  const files = [
    path.join(ROOT, '.env.local'),
    path.join(ROOT, 'services', 'supabase', '.env'),
  ];
  const vars = {};
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in vars)) vars[key] = value;
    }
  }
  return vars;
}

const env = readEnvFiles();
const API_KEY = process.env.UPTIMEROBOT_API_KEY || env.UPTIMEROBOT_API_KEY || '';
const TOPIC = process.env.NOTIFY_TOPIC || env.NOTIFY_TOPIC || '';
const DRY = process.argv.includes('--dry-run');
const stateArg = process.argv.indexOf('--state');
const STATE_FILE = stateArg !== -1 ? process.argv[stateArg + 1] : STATE_FILE_DEFAULT;

const PRIORITIES = { min: 1, low: 2, default: 3, high: 4, urgent: 5 };

// Estados v3 de UptimeRobot: UP | DOWN | PAUSED | STARTED (aún sin primer check)
function fmtDuration(seconds) {
  const s = Number(seconds) || 0;
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

async function fetchMonitors() {
  const res = await fetch('https://api.uptimerobot.com/v3/monitors', {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`UptimeRobot API HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  if (!Array.isArray(j.data)) throw new Error(`UptimeRobot API sin data: ${JSON.stringify(j).slice(0, 200)}`);
  const map = {};
  for (const m of j.data) {
    map[String(m.id)] = {
      name: m.friendlyName,
      url: m.url,
      status: m.status,
      duration: m.currentStateDuration || 0,
    };
  }
  return map;
}

async function publishToNtfy({ title, message, tag, priority }) {
  const params = new URLSearchParams({
    title: title || '',
    message,
    tags: tag || 'robot',
    priority: String(PRIORITIES[priority] ?? 3),
  });
  const res = await fetch(`${SERVER}/${TOPIC}?${params}`, { method: 'POST', body: '' });
  if (!res.ok && !/^4/.test(String(res.status))) {
    throw new Error(`ntfy HTTP ${res.status}`);
  }
  return res.ok;
}

function buildMessage(prev, cur) {
  const lines = [
    `Monitor: ${cur.name}`,
    `URL: ${cur.url}`,
    `Estado: ${prev ? prev.status : '?'} → ${cur.status}`,
  ];
  if (cur.status === 'DOWN') lines.push(`Caído desde hace ${fmtDuration(cur.duration)}`);
  else if (cur.duration) lines.push(`Así desde hace ${fmtDuration(cur.duration)}`);
  return lines.join('\n');
}

async function main() {
  if (!API_KEY) {
    console.error('Falta UPTIMEROBOT_API_KEY (env, .env.local o services/supabase/.env).');
    process.exit(1);
  }
  if (!TOPIC) {
    console.error('Falta NOTIFY_TOPIC (env, .env.local o services/supabase/.env).');
    process.exit(1);
  }

  const current = await fetchMonitors();

  let prev = {};
  if (fs.existsSync(STATE_FILE)) {
    try { prev = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { prev = {}; }
  }

  const firstRun = Object.keys(prev).length === 0;
  const events = [];

  for (const [id, cur] of Object.entries(current)) {
    const old = prev[id];
    if (!old) continue; // monitor nuevo: se registra sin avisar
    if (old.status === cur.status) continue;
    const style = {
      DOWN: { title: `UPTIME DOWN: ${cur.name}`, tag: 'rotating_light', priority: 'urgent' },
      UP: { title: `UPTIME UP: ${cur.name}`, tag: 'green_circle', priority: 'low' },
      PAUSED: { title: `UPTIME PAUSED: ${cur.name}`, tag: 'pause_button', priority: 'default' },
    }[cur.status] || { title: `UPTIME ${cur.status}: ${cur.name}`, tag: 'question', priority: 'default' };
    events.push({ id, cur, old, ...style });
  }

  if (events.length === 0) {
    console.log(`[uptime-watch] ${Object.keys(current).length} monitores, sin cambios.`);
  } else {
    for (const ev of events) {
      const msg = buildMessage(ev.old, ev.cur);
      if (DRY) {
        console.log(`[dry-run] ${ev.title}\n${msg}\n---`);
      } else {
        try {
          const ok = await publishToNtfy({ title: ev.title, message: msg, tag: ev.tag, priority: ev.priority });
          console.log(`[${ok ? 'ok' : 'ERR'}] ${ev.title}`);
        } catch (e) {
          console.error(`[fail] ${ev.title}: ${e.message}`);
        }
      }
    }
  }

  const snapshot = {};
  for (const [id, cur] of Object.entries(current)) {
    snapshot[id] = { name: cur.name, url: cur.url, status: cur.status };
  }
  if (!DRY) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot, null, 2));
    console.log(`[uptime-watch] estado guardado (${Object.keys(snapshot).length} monitores)${firstRun ? ' — primer run, sin notificaciones' : ''}`);
  }
}

main().catch((e) => { console.error(`Error: ${e.message}`); process.exit(1); });
