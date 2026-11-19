# TELEMETRY_SYSTEM — Telemetría del ecosistema

**Versión:** 1.0  
**Actualización:** 18 nov 2026  
**Identificador:** `TELEMETRY_SYSTEM`  
**Definición:** Ingesta central de eventos técnicos y de uso de launcher, instaladores, webs y bot.

---

## 1. Objetivo

Recoger eventos verificables para saber qué se descarga, qué se instala, qué launcher está activo,
en qué dispositivo/OS/arquitectura/país y qué ocurre al desinstalar. La telemetría se complementa
con los eventos web. Los instaladores y desinstaladores son obligatorios; launcher y web permiten
desactivarla.

## 2. Fuentes y consentimiento

| Fuente | `source` | Opt-out |
| --- | --- | --- |
| Launcher Tauri | `launcher` | Sí, ajustes del launcher |
| Setup NSIS/Tauri | `installer` | No |
| Desinstalador | `uninstaller` | No |
| Web | `web` | Sí, ajustes de cuenta |
| Bot Discord | `bot` | No (eventos de operación) |
| Juego web | `web`/`game` | Según cuenta web |

El launcher añade `session_start`, `heartbeat` cada 60 s, `play_online`, `play_offline`,
`session_end`, `update_check` y eventos de bloqueo. Si está offline, los eventos se guardan en una
cola local y se envían al recuperar conexión. La web envía `session_start`, `page_view`,
`heartbeat`, `connectivity`, `download_click` y `session_end`.

## 3. Endpoint central

`POST https://muzicmania.vercel.app/api/telemetry/ingest`

Acepta un evento o un lote `{ "events": [...] }` de hasta 50. El servidor añade IP, país/región
de Vercel y `user-agent`; nunca confía en esos campos del cliente.

Respuesta `202 { ok: true, accepted }`. Errores: `400` payload, `403` origen, `429` rate limit,
`503` servidor sin Supabase, `500` fallo de inserción.

Orígenes CORS: webs oficiales, localhost 3000–3003 y `tauri://localhost` /
`http://tauri.localhost`.

## 4. Esquema de base de datos

Tablas en schema `ciszu`, solo `service_role`:

- `telemetry_events`: evento individual, `event_id` único, timestamps, fuente, app, usuario,
  dispositivo, sesión, IP, país/región, OS, arquitectura, versión, canal, consentimiento,
  `is_official` y `properties` JSONB.
- `telemetry_devices`: última información por `(app, device_id)`, usuario, IP, plataforma y
  metadata.
- `telemetry_sessions`: sesión por `session_id`, última actividad, estado y dispositivo.

La IP se usa para sesiones/seguridad y consultas por IP. Un usuario puede tener varias IPs y
dispositivos asociados.

## 5. Retención y privacidad

Los datos se conservan para analítica histórica y seguridad. No se venden. La web y el launcher
respetan su preferencia local; los setups/desinstaladores no tienen toggle. Las páginas de
Privacidad y Términos describen la recogida, finalidad, proveedores y derechos. Para eliminación
o acceso, usar el canal de privacidad de Ciszu Network.

## 6. Staffcon

```powershell
node scripts/staffcon.js telemetry --actor CZ-001 --session staffcon-xxx --user @usuario
node scripts/staffcon.js telemetry --actor CZ-001 --session staffcon-xxx --ip 190.0.0.1
```

Muestra sesiones activas en los últimos 2 minutos (estado online), dispositivos, país, OS,
arquitectura, versión, canal y últimos eventos. Solo niveles ≤4. El actor queda en el log local de
staffcon.

## 7. Anti-abuso

- Rate limit por IP (180/min), lote máximo 50, campos truncados y validación de fuente/app.
- Ingesta server-only con `service_role`; RLS sin permisos para anon/authenticated.
- `is_official` preparado para la verificación de builds oficiales y futura licencia premium.
- La telemetría no sustituye el código de firma ni el ticket de lanzamiento online.

## 8. Web y bot

Las cuatro webs montan `TelemetryTracker` desde `@ciszu/ui` y envían eventos con ID de
dispositivo/sesión. `TelemetryPreference` aparece en la configuración de cuenta compartida.
CiszuBot envía `bot_ready` y `command_used` (comando, guild, canal, prefijo) mediante
`src/services/telemetry.ts`.

## 9. Limitaciones

- La telemetría offline se envía cuando vuelve la conexión; un desinstalador offline puede perder
  eventos si el sistema elimina sus datos antes del siguiente envío.
- El bloqueo de launcher sigue siendo cliente + servidor futuro; no es DRM absoluto.
- Vercel/ GitHub pueden estar pausados; el endpoint central y el manifiesto tienen fallback local
  cuando corresponde.

## 10. Verificación

- Migración `20261118000002_telemetry.sql` aplicada.
- `cargo test`, `tsc`, ESLint y `next build`.
- Consulta de tabla vía REST con `Accept-Profile: ciszu`.
- Revisar eventos reales con staffcon después del despliegue.

---

_Última revisión: 18 nov 2026._ Relacionado: `LAUNCHER_SYSTEM.md`, `INSTALLERS_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `ACCESS_CONTROL_SYSTEM.md`, `STAFF_SYSTEM.md`.

