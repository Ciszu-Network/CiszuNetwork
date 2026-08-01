// Notify — push al teléfono vía ntfy.sh (gratis, sin registro).
// Uso:
//   node scripts/notify.js "Mensaje"
//   node scripts/notify.js "Titulo" "Mensaje"
//   NOTIFY_TOPIC=mi-topic node scripts/notify.js "Mensaje"
//
// Requisito: instalar la app ntfy (Android/iOS) y suscribirse al topic.
// Topic recomendado: privado tipo "ciszu-<hash-unico>" para que nadie más lo vea.

const TOPIC = process.env.NOTIFY_TOPIC || 'ciszu-network-tasks';
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
