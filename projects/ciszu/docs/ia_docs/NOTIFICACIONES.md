# Notificaciones de la IA al teléfono (jul/ago 2026)

Investigación solicitada: cómo recibir en el teléfono un aviso cuando la IA (opencode/agente) termina una tarea larga, o poder ver qué hace en segundo plano.

## Opciones ordenadas por simplicidad

| Opción | Alcance | Coste | Complejidad | Veredicto |
|---|---|---|---|---|
| **ntfy.sh + script `scripts/notify.js`** | Push al móvil (Android/iOS) | Gratis | Muy baja | ✅ Recomendada |
| **opencode-notify (plugin)** | Toast nativo de Windows | Gratis | Baja | ✅ Complementaria (misma máquina) |
| **Pushover** | Push al móvil | 5$ one-time | Baja | Alternativa de pago |
| Telegram Bot API | Push al móvil | Gratis | Media (token) | Alternativa si ya se usa Telegram |
| Agent Approve | iOS + Watch, aprobar acciones | Gratis | Media | Alternativa iOS |

## Solución implementada — ntfy (push directo al teléfono)

ntfy es un servicio de push sin registro: la app del móvil se suscribe a un "topic" (una cadena) y cualquier script hace un simple POST HTTP para notificar. Sin cuentas, sin tokens, sin pagos.

**Script creado**: `scripts/notify.js`

```bash
node scripts/notify.js "Título" "Mensaje"
```

**Puesta en marcha (1 minuto):**
1. Instalar la app **ntfy** en el móvil (Play Store / App Store).
2. En la app, suscribirse a un topic privado, p.ej. `ciszu-<hash-unico>` (cualquier cadena; usar una larga y aleatoria para privacidad).
3. Ejecutar el script con ese topic:

```powershell
$env:NOTIFY_TOPIC = "ciszu-tu-hash-unico"; node scripts/notify.js "Build OK" "Las 4 apps compilan"
```

El móvil recibe la notificación al instante. El topic no requiere suscripción previa del script: ntfy permite publicar sin estar suscrito, así que cualquiera de las tareas del bot/agente puede llamar a este script al terminar (builds, deploys, migraciones, cargas CDN).

## Complemento en la misma máquina — opencode-notify

Plugin del ecosistema opencode (`kdcokenny/opencode-notify`): muestra toasts nativos de Windows cuando el agente inicia/termina tareas. No llega al teléfono, pero da visibilidad inmediata en la consola sin mirarla. Instalable en la config de opencode si se desea.

## Alternativa sin app — Telegram Bot API

Como el proyecto ya opera bots de Telegram, un bot propio con `sendMessage` al chat del usuario logra lo mismo sin app extra (el móvil ya tiene Telegram). Requiere crear bot con @BotFather y obtener el chat_id. Si se prefiere, el script `notify.js` puede extenderse con un flag `--telegram <token>:<chat_id>`.

## Decisión

No es complejo en absoluto: la vía ntfy resuelve el caso con un script de 20 líneas ya creado. Pendiente solo del usuario: instalar la app ntfy en el móvil y elegir el topic definitivo.
