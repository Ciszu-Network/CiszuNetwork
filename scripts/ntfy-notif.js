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
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --voice     (adjunta AUDIO del mensaje sintetizado con Piper)
//   node scripts/ntfy-notif.js "Mensaje" --voice sharvard     (voz femenina ES; voces: amy, ryan, bryce, sharvard, davefx)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --markdown  (mensaje con formato Markdown: **negritas**, links, code)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --delay 30m (entrega programada: 30m, 3h, "2 days", "tomorrow, 3pm", timestamp)
//
// Flags:
//   --priority <min|low|default|high|urgent>   prioridad (default: default)
//   --tag <tag>                                tag (emoji/categoría, p.ej. robot, warning, check)
//   --title <texto>                            título explícito (alternativo a argv[2])
//   --markdown                                 marca el mensaje como Markdown (se renderiza en la web app)
//   --delay <duracion|"fecha natural">         entrega programada (X-Delay: 30m, 3h, "tomorrow, 3pm", Unix ts)
//   --voice [voz]                              sintetiza el mensaje a audio (Piper) y lo adjunta al push.
//                                              Sin valor usa la voz por defecto (sharvard — femenina ES).
//                                              Un solo push con texto + audio (el audio llega con nombre
//                                              identificable, p.ej. ciszu-notif-20260805-...-aviso-....mp3).
//                                              La app ntfy del móvil lo reproduce.
//
// Configuración (en orden de prioridad):
//   1. Variables de entorno NOTIFY_TOPIC / NOTIFY_TOKEN
//   2. Key NOTIFY_TOPIC / NOTIFY_TOKEN del fichero .env.local de la raíz del repo
//   3. Key NOTIFY_TOPIC / NOTIFY_TOKEN del fichero services/supabase/.env (vault)
//   4. Defaults: topic 'ciszu-network-tasks', sin token
//
// Voz por audio: requiere los binarios del sistema de voz (tools/tts-stt-ai/runtime/
// — piper + ffmpeg + voces). Sharvard (es_ES) es femenina; amy (en_US) también.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER = process.env.NOTIFY_SERVER || 'https://ntfy.sh';

const { buildAudioName } = require(path.join(
  ROOT, 'tools', 'tts-stt-ai', 'lib', 'ntfy-meta.js',
));

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

// ---- Voz (Piper) para notificaciones con audio ----
const VOICE_ROOT = path.join(ROOT, 'tools', 'tts-stt-ai', 'runtime');
const NOTIFY_VOICES = {
  amy: { label: 'Amy (EN, femenina)', file: 'en_US-amy-medium.onnx' },
  ryan: { label: 'Ryan (EN)', file: 'en_US-ryan-high.onnx' },
  bryce: { label: 'Bryce (EN)', file: 'en_US-bryce-medium.onnx' },
  sharvard: { label: 'Sharvard (ES, femenina)', file: 'es_ES-sharvard-medium.onnx' },
  davefx: { label: 'Davefx (ES)', file: 'es_ES-davefx-medium.onnx' },
};
const DEFAULT_NOTIFY_VOICE = 'sharvard';

function synthesizeVoice(text, voiceKey) {
  const voice = NOTIFY_VOICES[voiceKey] || NOTIFY_VOICES[DEFAULT_NOTIFY_VOICE];
  const piper = path.join(VOICE_ROOT, 'piper', 'piper', 'piper.exe');
  const ffmpeg = path.join(VOICE_ROOT, 'ffmpeg-9.0-essentials_build', 'bin', 'ffmpeg.exe');
  const model = path.join(VOICE_ROOT, 'piper-voices', voice.file);
  const mp3Name = buildAudioName({ tipo: 'notif', motivo: 'aviso', texto: text });
  const wav = path.join(ROOT, '.opencode-tmp', mp3Name.replace(/\.mp3$/, '.wav'));
  const mp3 = wav.replace(/\.wav$/, '.mp3');
  if (!fs.existsSync(piper) || !fs.existsSync(ffmpeg) || !fs.existsSync(model)) return null;

  const { spawnSync } = require('child_process');
  const synth = spawnSync(piper, ['-m', model, '-f', wav], {
    input: text.replace(/\n/g, ' ').trim() + '\n',
    encoding: 'utf8',
    timeout: 60000,
  });
  if (synth.status !== 0 || !fs.existsSync(wav)) return null;
  const conv = spawnSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '6', mp3], { timeout: 60000 });
  try { fs.unlinkSync(wav); } catch {}
  if (conv.status !== 0 || !fs.existsSync(mp3)) return null;
  return mp3;
}

function parseArgs(argv) {
  const args = { positionals: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (key === 'priority' || key === 'tag' || key === 'title' || key === 'delay') {
        args.flags[key] = next;
        i++;
      } else if (key === 'voice') {
        args.flags[key] = next && !next.startsWith('--') ? next : true;
        if (args.flags[key] !== true) i++;
      } else {
        args.flags[key] = true;
      }
    } else {
      args.positionals.push(a);
    }
  }
  return args;
}

const RETRY_DELAYS_MS = [1500, 4000, 10000];

// ntfy.sh IGNORA el filename del multipart (siempre "attachment.mp3") y decodifica
// headers como latin1 (rompe tildes). Por eso TODO va como query params (UTF-8):
// title/message/tags/priority + `f` = filename del adjunto.
async function requestWithRetry(makeRequest) {
  let lastError = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await makeRequest();
      if (res.ok) return res;
      const bodyText = await res.text().catch(() => '');
      lastError = `HTTP ${res.status} ${res.statusText}${bodyText ? ` — ${bodyText.slice(0, 200)}` : ''}`;
      if (res.status !== 429 && res.status < 500) break; // errores del cliente no se reintentan
    } catch (e) {
      lastError = `red: ${e.message}`;
    }
    if (attempt < RETRY_DELAYS_MS.length) {
      console.warn(`  [retry ${attempt + 1}/${RETRY_DELAYS_MS.length}] ${lastError} → reintento en ${RETRY_DELAYS_MS[attempt]}ms`);
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }
  throw new Error(`enviar a ${SERVER}/${TOPIC} fallo: ${lastError}`);
}

async function send({ title, message, priority, tag, audioPath, markdown, delay }) {
  const params = new URLSearchParams({
    title: title || '',
    message,
    tags: tag || 'robot',
    priority: String(PRIORITIES[priority] ?? 3),
  });
  if (markdown) params.set('markdown', 'yes');
  if (delay) params.set('delay', delay);
  const headers = {};
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  if (audioPath) {
    const buf = fs.readFileSync(audioPath);
    params.set('f', path.basename(audioPath));
    headers['Content-Type'] = 'audio/mpeg';
    await requestWithRetry(() =>
      fetch(`${SERVER}/${TOPIC}?${params}`, { method: 'PUT', body: buf, headers }),
    );
  } else {
    await requestWithRetry(() =>
      fetch(`${SERVER}/${TOPIC}?${params}`, { method: 'POST', body: '', headers }),
    );
  }
  console.log(`Notificacion enviada a ${TOPIC}: ${title} (${message.slice(0, 60)}${message.length > 60 ? '…' : ''})${audioPath ? ' + audio' : ''}`);
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

  let audioPath = null;
  if (flags.voice) {
    const voiceKey = flags.voice === true ? DEFAULT_NOTIFY_VOICE : flags.voice;
    audioPath = synthesizeVoice(message, voiceKey);
    if (!audioPath) {
      console.warn(`  [!] No se pudo sintetizar la voz (${NOTIFY_VOICES[voiceKey]?.label || voiceKey}) — se envia solo texto.`);
    }
  }

  await send({ title, message, priority: flags.priority, tag: flags.tag, audioPath, markdown: flags.markdown, delay: flags.delay });
  if (audioPath) {
    try { fs.unlinkSync(audioPath); } catch {}
  }
}

main().catch((e) => { console.error(`Error: ${e.message}`); process.exit(1); });
