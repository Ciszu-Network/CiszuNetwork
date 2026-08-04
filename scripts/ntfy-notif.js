// ntfy-notif.js — notificaciones push vía ntfy.sh (gratis, sin registro).
// Comodidad: un solo script para enviar, listar y limpiar el topic.
//
// Uso:
//   node scripts/ntfy-notif.js "Mensaje"
//   node scripts/ntfy-notif.js "Titulo" "Mensaje"
//   node scripts/ntfy-notif.js "Mensaje" --priority urgent --tag warning
//   echo "texto" | node scripts/ntfy-notif.js "Titulo"      (lee el mensaje de stdin)
//   node scripts/ntfy-notif.js --list                        (lista mensajes recientes)
//   node scripts/ntfy-notif.js --clear                       (borra TODOS los mensajes, requiere token)
//
// Flags:
//   --priority <min|low|default|high|urgent>   prioridad (default: default)
//   --tag <tag>                                tag (emoji/categoría, p.ej. robot, warning, check)
//   --title <texto>                            título explícito (alternativo a argv[2])
//
// Configuración (en orden de prioridad):
//   1. Variables de entorno NOTIFY_TOPIC / NOTIFY_TOKEN
//   2. Key NOTIFY_TOPIC / NOTIFY_TOKEN del fichero .env.local de la raíz del repo
//   3. Key NOTIFY_TOPIC / NOTIFY_TOKEN del fichero services/supabase/.env (vault)
//   4. Defaults: topic 'ciszu-network-tasks', sin token

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER = process.env.NOTIFY_SERVER || 'https://ntfy.sh';

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
const TOPIC = process.env.NOTIFY_TOPIC || env.NOTIFY_TOPIC || 'ciszu-network-tasks';
const TOKEN = process.env.NOTIFY_TOKEN || env.NOTIFY_TOKEN || '';

const PRIORITIES = { min: 1, low: 2, default: 3, high: 4, urgent: 5 };

function parseArgs(argv) {
  const args = { positionals: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (key === 'priority' || key === 'tag' || key === 'title') {
        args.flags[key] = next;
        i++;
      } else {
        args.flags[key] = true;
      }
    } else {
      args.positionals.push(a);
    }
  }
  return args;
}

async function send({ title, message, priority, tag }) {
  const headers = {
    Title: title,
    Priority: String(PRIORITIES[priority] ?? 3),
    Tags: tag || 'robot',
  };
  const res = await fetch(`${SERVER}/${TOPIC}`, {
    method: 'POST',
    body: message,
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  console.log(`Notificacion enviada a ${TOPIC}: ${title} (${message.slice(0, 60)}${message.length > 60 ? '…' : ''})`);
}

async function listMessages() {
  const headers = {};
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`${SERVER}/${TOPIC}/json?poll=1&since=all`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();
  const messages = text
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((m) => m && m.event === 'message');
  if (!messages.length) {
    console.log(`(topic ${TOPIC} sin mensajes)`);
    return [];
  }
  for (const m of messages) {
    const t = new Date(m.time * 1000).toLocaleString('es-ES');
    console.log(`  [${m.id}] ${t} — ${m.title || '(sin titulo)'}: ${(m.message || '').slice(0, 80)}`);
  }
  return messages;
}

async function clearMessages() {
  if (!TOKEN) {
    console.error('  [!] --clear requiere NOTIFY_TOKEN (configurado en .env.local / services/supabase/.env)');
    process.exit(1);
  }
  const messages = await listMessages();
  for (const m of messages) {
    const res = await fetch(`${SERVER}/${TOPIC}/${m.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (res.ok) console.log(`  [DEL] ${m.id}`);
    else console.error(`  [ERR] ${m.id}: HTTP ${res.status}`);
  }
  console.log(`Borrados ${messages.length} mensajes.`);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));

  if (flags.clear) { await clearMessages(); return; }
  if (flags.list) { await listMessages(); return; }

  let title = flags.title;
  let message;
  const maybePiped = !process.stdin.isTTY; // true si hay pipe real o stdin no-consola

  if (maybePiped) {
    // intenta leer stdin; en pipe real llegan datos, en shell headless termina vacío
    let stream = '';
    try {
      const chunks = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      stream = Buffer.concat(chunks).toString('utf8').trim();
    } catch { stream = ''; }

    if (stream) {
      message = stream;
      title = title || (positionals[0] || 'Ciszu Network');
    } else if (positionals.length >= 2 && !flags.title) {
      title = positionals[0];
      message = positionals[1];
    } else if (positionals[0]) {
      message = positionals[0];
      title = title || 'Ciszu Network';
    }
  } else if (positionals.length >= 2 && !flags.title) {
    title = positionals[0];
    message = positionals[1];
  } else {
    title = title || 'Ciszu Network';
    message = positionals[0] || '';
  }

  if (!message) {
    console.error('Uso: node scripts/ntfy-notif.js "Titulo" "Mensaje" | --list | --clear');
    process.exit(1);
  }

  await send({ title, message, priority: flags.priority, tag: flags.tag });
}

main().catch((e) => { console.error(`Error: ${e.message}`); process.exit(1); });
