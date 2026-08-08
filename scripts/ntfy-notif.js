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
//   node scripts/ntfy-notif.js "Titulo" "Mensaje"            (SIEMPRE adjunta audio, voz femenina)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --no-voice (solo texto, sin audio)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --voice amy (voz femenina especifica; masculinas se ignoran)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --text "texto limpio para el audio"
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --markdown  (mensaje con formato Markdown: **negritas**, links, code)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --delay 30m (entrega programada: 30m, 3h, "2 days", "tomorrow, 3pm", timestamp)
//   node scripts/ntfy-notif.js "Titulo" "Mensaje" --image C:\ruta\foto.png
//                                                       (adjunta una IMAGEN; el audio se envia en un 2º push aparte)
//
// Flags:
//   --priority <int|low|default|high|urgent>   prioridad (default: default)
//   --tag <tag>                                tag (emoji/categoría, p.ej. robot, warning, check)
//   --title <texto>                            título explícito (alternativo a argv[2])
//   --markdown                                 marca el mensaje como Markdown (se renderiza en la web app)
//   --delay <duracion|"fecha natural">         entrega programada (X-Delay: 30m, 3h, "tomorrow, 3pm", Unix ts)
//   --text <texto>                             texto del AUDIO (Piper) separado del mensaje de la notificación.
//                                              Recomendado: el audio en español natural SIN rutas, siglas en
//                                              inglés ni tecnicismos (la voz los pronuncia mal). Si no se pasa,
//                                              se usa el mensaje con una limpieza automática.
//   --no-voice                                 sin audio (solo texto). Por defecto SIEMPRE se adjunta audio.
//   --image <ruta>                             adjunta una imagen al push. Se envia como attach del PRIMER
//                                              mensaje (Content-Type según extensión) y el audio se manda
//                                              en un segundo push con el mismo título.
//   --voice [voz]                              voz del audio. Política: SIEMPRE femenina (sharvard ES = speaker
//                                              femenino). Las voces masculinas (ryan, bryce, davefx) se ignoran
//                                              y se usa sharvard.
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
// POLITICA (6 ago 2026): el audio SIEMPRE usa voz femenina. Sharvard (es_ES) es
// multi-speaker (M=0, F=1) → forzar `-s 1` para el speaker femenino (sin él suena
// masculina). Las voces masculinas se aceptan en el mapa pero nunca se usan.
const VOICE_ROOT = path.join(ROOT, 'tools', 'tts-stt-ai', 'runtime');
const NOTIFY_VOICES = {
  amy: { label: 'Amy (EN, femenina)', file: 'en_US-amy-medium.onnx', female: true },
  sharvard: { label: 'Sharvard (ES, femenina)', file: 'es_ES-sharvard-medium.onnx', speaker: 1, female: true },
  daniela: { label: 'Daniela (ES-AR, femenina)', file: 'es_AR-daniela-high.onnx', female: true },
  ryan: { label: 'Ryan (EN, masculina)', file: 'en_US-ryan-high.onnx', female: false },
  bryce: { label: 'Bryce (EN, masculina)', file: 'en_US-bryce-medium.onnx', female: false },
  davefx: { label: 'Davefx (ES, masculina)', file: 'es_ES-davefx-medium.onnx', female: false },
};
const DEFAULT_NOTIFY_VOICE = 'sharvard';

function resolveVoice(voiceKey) {
  let voice = NOTIFY_VOICES[voiceKey] || NOTIFY_VOICES[DEFAULT_NOTIFY_VOICE];
  if (!voice.female) {
    console.warn(`  [!] Voz '${voiceKey}' es masculina — politica: SIEMPRE femenina. Usando ${NOTIFY_VOICES[DEFAULT_NOTIFY_VOICE].label}.`);
    voice = NOTIFY_VOICES[DEFAULT_NOTIFY_VOICE];
  }
  return voice;
}

function synthesizeVoice(text, voiceKey) {
  const voice = resolveVoice(voiceKey);
  const piper = path.join(VOICE_ROOT, 'piper', 'piper', 'piper.exe');
  const ffmpeg = path.join(VOICE_ROOT, 'ffmpeg-9.0-essentials_build', 'bin', 'ffmpeg.exe');
  const model = path.join(VOICE_ROOT, 'piper-voices', voice.file);
  const mp3Name = buildAudioName({ tipo: 'notif', motivo: 'aviso', texto: text });
  const wav = path.join(ROOT, '.opencode-tmp', mp3Name.replace(/\.mp3$/, '.wav'));
  const mp3 = wav.replace(/\.wav$/, '.mp3');
  if (!fs.existsSync(piper) || !fs.existsSync(ffmpeg) || !fs.existsSync(model)) return null;

  const { spawnSync } = require('child_process');
  const piperArgs = ['-m', model, '-f', wav];
  if (voice.speaker !== undefined) piperArgs.push('-s', String(voice.speaker));
  const synth = spawnSync(piper, piperArgs, {
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

// Limpieza del texto que se sintetiza a AUDIO: la voz ES no pronuncia bien rutas,
// siglas en ingles ni tecnicismos → se separa del mensaje de la notificacion.
// El mensaje visible conserva el texto tecnico completo; el audio usa este limpio.
function cleanTextForAudio(text) {
  let t = String(text || '')
    .replace(/https?:\/\/\S+/gi, '')                       // urls
    .replace(/(?:[A-Za-z]:[\\/]|\/|\.\.\/)[\w\-.\\/ ]+/g, ' ') // rutas de archivo
    .replace(/\S+\.(?:mp4|mp3|wav|ogg|png|jpg|jpeg|json|js|ts|tsx|jsx|md|txt|exe|cmd|ps1|log)\b/gi, ' ') // ficheros con extension
    .replace(/`[^`]*`/g, ' ')                              // codigo inline
    .replace(/[_\*#\|]/g, ' ');                            // markdown
  const dict = {
    opencode: 'open code',
    'opencode-ai': 'open code',
    ntfy: 'n t f y',
    piper: 'paiper',
    sharvard: 'sharvard',
    terminal: 'terminal',
    urls: 'enlaces',
    cdn: 'c d n',
  };
  for (const [k, v] of Object.entries(dict)) {
    t = t.replace(new RegExp(`\\b${k}\\b`, 'gi'), v);
  }
  return t.replace(/\s+/g, ' ').trim();
}

function parseArgs(argv) {
  const args = { positionals: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (key === 'priority' || key === 'tag' || key === 'title' || key === 'delay' || key === 'text' || key === 'image') {
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

// FIX (8 ago 2026): si el token configurado da 401 (revocado/inválido) y el topic es
// público, se reenvía SIN token automáticamente. El topic ciszu-* es público — el
// token NUNCA debe bloquear la entrega.
async function publishWithFallback({ params, method, body, headers }) {
  try {
    await requestWithRetry(() =>
      fetch(`${SERVER}/${TOPIC}?${params}`, { method, body, headers }),
    );
  } catch (e) {
    if (headers.Authorization && /401/.test(e.message)) {
      console.warn('  [!] Token 401 (revocado/inválido) — topic público: se reenvía SIN token.');
      const anon = { ...headers };
      delete anon.Authorization;
      await requestWithRetry(() =>
        fetch(`${SERVER}/${TOPIC}?${params}`, { method, body, headers: anon }),
      );
      return;
    }
    throw e;
  }
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
    await publishWithFallback({ params, method: 'PUT', body: buf, headers });
  } else {
    await publishWithFallback({ params, method: 'POST', body: '', headers });
  }
  console.log(`Notificacion enviada a ${TOPIC}: ${title} (${message.slice(0, 60)}${message.length > 60 ? '…' : ''})${audioPath ? ' + audio' : ''}`);
}

function imageContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.svg': 'image/svg+xml',
  };
  return map[ext] || 'application/octet-stream';
}

async function sendWithImage({ title, message, priority, tag, markdown, delay, imagePath }) {
  const params = new URLSearchParams({
    title: title || '',
    message,
    tags: tag || 'robot',
    priority: String(PRIORITIES[priority] ?? 3),
  });
  if (markdown) params.set('markdown', 'yes');
  if (delay) params.set('delay', delay);
  const buf = fs.readFileSync(imagePath);
  params.set('f', path.basename(imagePath));
  const headers = { 'Content-Type': imageContentType(imagePath) };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  await publishWithFallback({ params, method: 'PUT', body: buf, headers });
  console.log(`Imagen enviada a ${TOPIC}: ${title} → ${path.basename(imagePath)} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function listMessages() {
  const headers = {};
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  let res = await fetch(`${SERVER}/${TOPIC}/json?poll=1&since=all`, { headers });
  if (res.status === 401 && TOKEN) {
    // FIX (8 ago 2026): token revocado — leer sin token (topic público)
    res = await fetch(`${SERVER}/${TOPIC}/json?poll=1&since=all`);
  }
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

  // POLITICA (6 ago 2026): las notificaciones SIEMPRE llevan audio (voz femenina).
  // Solo se omite con --no-voice explicito o si falla la sintesis (cae a texto).
  let audioPath = null;
  if (!flags['no-voice']) {
    const voiceKey = flags.voice === true || flags.voice === undefined ? DEFAULT_NOTIFY_VOICE : flags.voice;
    const audioText = flags.text !== undefined ? String(flags.text) : cleanTextForAudio(message);
    audioPath = synthesizeVoice(audioText, voiceKey);
    if (!audioPath) {
      console.warn(`  [!] No se pudo sintetizar la voz (${NOTIFY_VOICES[voiceKey]?.label || voiceKey}) — se envia solo texto.`);
    }
  }

  if (flags.image !== undefined) {
    const imagePath = String(flags.image);
    if (!fs.existsSync(imagePath)) {
      console.error(`  [!] Imagen no encontrada: ${imagePath}`);
      process.exit(1);
    }
    await sendWithImage({ title, message, priority: flags.priority, tag: flags.tag || 'fetch', markdown: flags.markdown, delay: flags.delay, imagePath });
    // El audio va en un 2º push aparte (un attach por mensaje en ntfy.sh)
    if (audioPath) {
      await send({ title: `${title} (audio)`, message: 'Audio de la notificacion.', tag: flags.tag || 'robot', priority: flags.priority, audioPath, markdown: flags.markdown, delay: flags.delay });
    }
  } else {
    await send({ title, message, priority: flags.priority, tag: flags.tag, audioPath, markdown: flags.markdown, delay: flags.delay });
  }
  if (audioPath) {
    try { fs.unlinkSync(audioPath); } catch {}
  }
}

main().catch((e) => { console.error(`Error: ${e.message}`); process.exit(1); });
