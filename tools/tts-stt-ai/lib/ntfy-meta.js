// ntfy-meta.cjs — metadatos y nombres de archivo para pushes ntfy.
//
// Helper COMPARTIDO entre:
//   - tools/tts-stt-ai/lib/tts.js             (plugin opencode, ESM → import default)
//   - scripts/ntfy-notif.js                  (CLI, CJS → require)
//   - futuros comandos de opencode-commands-ciszu (categoría A: notificaciones)
//
// Garantiza que TODOS los audios que llegan al móvil tengan nombre identificable
// y metadatos ricos (title, message, tags, priority, click, icon, actions).
//
// Patrón de nombre: ciszu-<tipo>-<YYYYMMDD>-<HHMMSS>-<motivo>-<sesion>-<hash4>.mp3
//   ej: ciszu-tts-20260805-025812-respuesta-ciszuai-8f3a.mp3

function sanitize(part, maxLen = 24) {
  const s = String(part || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (s || "na").slice(0, maxLen);
}

function shortHash(text, len = 4) {
  let h = 0;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(len, "0").slice(-len);
}

function nowParts(date = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return {
    fecha: `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`,
    hora: `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`,
  };
}

/**
 * Nombre de archivo descriptivo para un audio de ntfy.
 * @param {object} opts - { tipo="tts", motivo="respuesta", sesion="", texto="" }
 * @returns {string} ej. "ciszu-tts-20260805-025812-respuesta-ciszuai-8f3a.mp3"
 */
function buildAudioName({ tipo = "tts", motivo = "respuesta", sesion = "", texto = "" } = {}) {
  const { fecha, hora } = nowParts();
  const hash = shortHash(texto || `${tipo}-${motivo}-${fecha}-${hora}`);
  const base = `ciszu-${sanitize(tipo)}-${fecha}-${hora}-${sanitize(motivo)}-${sanitize(sesion)}-${hash}`;
  return base + ".mp3";
}

/**
 * Campos de metadatos para ntfy (query params del PUT/POST — UTF-8 seguro,
 * a diferencia de los headers que ntfy decodifica como latin1).
 * El filename va como parámetro `f` (los aliases Filename/File/f respetan el
 * nombre; el multipart SIEMPRE lo ignora → "attachment.mp3").
 * Solo incluye los campos presentes (los vacíos/undefined se omiten).
 * @param {object} opts - { title, message, tags=[], priority, click, icon, actions=[], filename, markdown }
 * @returns {object} campos lista para `URLSearchParams.set(k, v)`
 */
function buildNtfyMeta({
  title,
  message,
  tags = [],
  priority,
  click,
  icon,
  actions = [],
  filename,
  markdown,
} = {}) {
  const meta = {};
  if (title) meta.title = title;
  if (message) meta.message = message;
  if (tags && tags.length) meta.tags = Array.isArray(tags) ? tags.join(",") : String(tags);
  if (priority) meta.priority = String(priority);
  if (click) meta.click = click;
  if (icon) meta.icon = icon;
  if (actions && actions.length) meta.actions = JSON.stringify(actions);
  if (filename) meta.filename = filename;
  if (markdown) meta.markdown = "yes";
  return meta;
}

/**
 * Acción `view`: abre una web/app al pulsar el botón de la notificación.
 * @param {object} opts - { label, url, clear=false }
 * @returns {object} acción JSON lista para `actions: [ ... ]`
 */
function buildViewAction({ label, url, clear = false } = {}) {
  const a = { action: "view", label, url };
  if (clear) a.clear = true;
  return a;
}

/**
 * Acción `http`: dispara una petición HTTP al pulsar el botón, con headers custom
 * (p.ej. `Authorization` para llamar a tu propia API del bot).
 * Ejemplo:
 *   buildHttpAction({
 *     label: "Ping bot",
 *     url: "https://api.ciszubot.vercel.app/ping",
 *     method: "POST",
 *     headers: { Authorization: "Bearer <token>", "X-Demo": "ciszu" },
 *     body: '{"cmd":"status"}',
 *   })
 * @param {object} opts - { label, url, method="GET", headers={}, body, clear=false }
 * @returns {object} acción JSON lista para `actions: [ ... ]`
 */
function buildHttpAction({ label, url, method = "GET", headers = {}, body, clear = false } = {}) {
  const a = { action: "http", label, url, method };
  if (headers && Object.keys(headers).length) a.headers = headers;
  if (body !== undefined) a.body = body;
  if (clear) a.clear = true;
  return a;
}

export { buildAudioName, buildNtfyMeta, buildViewAction, buildHttpAction, sanitize, shortHash };
