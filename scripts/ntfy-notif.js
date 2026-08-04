// ntfy-notif.js — push al teléfono vía ntfy.sh (gratis, sin registro).
// Uso:
//   node scripts/ntfy-notif.js "Mensaje"
//   node scripts/ntfy-notif.js "Titulo" "Mensaje"
//   NOTIFY_TOPIC=mi-topic node scripts/ntfy-notif.js "Mensaje"
//
// Requisito: instalar la app ntfy (Android/iOS) y suscribirse al topic.
// Topic recomendado: privado tipo "ciszu-<hash-unico>" para que nadie más lo vea.
// El topic se lee de la variable de entorno NOTIFY_TOPIC o, si no existe,
// de la key NOTIFY_TOPIC del fichero .env.local de la raíz del repo (gitignored).

const fs = require('fs');
const path = require('path');

function loadTopicFromEnvFile() {
  const envLocal = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envLocal)) return null;
  const line = fs.readFileSync(envLocal, 'utf8').split(/\r?\n/).find((l) => /^NOTIFY_TOPIC\s*=/.test(l));
  if (!line) return null;
  return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

const TOPIC = process.env.NOTIFY_TOPIC || loadTopicFromEnvFile() || 'ciszu-network-tasks';
const SERVER = process.env.NOTIFY_SERVER || 'https://ntfy.sh';

const title = process.argv[2] || 'Ciszu Network';
const message = process.argv[3] || (process.argv[2] || '');

fetch(`${SERVER}/${TOPIC}`, {
  method: 'POST',
  body: message,
  headers: {
    Title: title,
    Priority: 'default',
    Tags: 'robot',
  },
})
  .then((r) => {
    if (r.ok) console.log(`Notificacion enviada a ${TOPIC}: ${title}`);
    else console.error(`Error ${r.status}: ${r.statusText}`);
  })
  .catch((e) => console.error('Error enviando notificacion:', e.message));
