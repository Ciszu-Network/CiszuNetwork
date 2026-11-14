# NTFY_SYSTEM

> **Versión**: 2.1
> **Actualización**: 14 nov 2026
> **Identificador**: NTFY_SYSTEM
> **Definición**: Sistema de notificaciones push del ecosistema: canal único ntfy.sh, automatizaciones de monitorización, resumen de estadísticas, estado semanal, alertas de CI/deploys, seguridad (reserva + token), suscripción y política de contenido.

---

## 1. Canal único: ntfy.sh

- **Decision (09 oct 2026)**: canal operativo único siempre disponible, **sin dependencia del PC**.
  El self-hosted fue descartado (se eliminaron binario, tarea, regla de firewall y claves del vault).
- Topic rotado y no adivinable: `CZ-ntfytask-<32 dígitos>` (vault: `NOTIFY_TOPIC`).
- Los scripts (`ntfy-notif.js`, `moderation.js`, `uptime-watch.js`) leen `NOTIFY_TOPIC` del
  vault; `uptime-watch` en CI usa el secret de GitHub `NOTIFY_TOPIC` (`gh secret set`).

## 2. Token de publicación (ACTIVO) y reserva (Pro)

- **Token activo**: cuenta ntfy.sh del owner + access token de publicación guardado en el vault
  (`NOTIFY_TOKEN`, verificado 200 el 09 oct 2026). Los scripts lo adjuntan automáticamente.
- **Reserva del topic**: requiere **ntfy Pro** (de pago). Decisión actual: sin Pro. Consecuencia:
  sin reserva, quien conozca el nombre del topic aún puede publicar (spoofing) y leer; por eso
  rigen el nombre aleatorio (`CZ-ntfytask-<32 dígitos>`) y la política de contenido estricta.
- Alternativas si algún día se quiere eliminar el spoofing: ntfy Pro o self-host (descartado por
  dependencia del PC).

## 3. Suscripción (móvil)

1. App **ntfy** (Play Store / App Store).
2. Botón **+** → pegar el topic del vault → servidor por defecto (`ntfy.sh`) → Suscribir.
3. Permisos de notificación + excluir ntfy de la optimización de batería.

## 4. Política de contenido

- **NUNCA** por ntfy: secretos, tokens, credenciales, datos personales, detalles de incidentes ni
  información de clientes. Solo avisos operativos breves.
- Lo sensible va por email (marca y control) o se consulta en el servidor.

## 5. Operación y rotación

- Enviar: `pnpm notify "Titulo" "Mensaje"` (soporta voz, prioridad, tags, imagen, delay, markdown).
- Si el topic se filtra: generar `CZ-ntfytask-<32 dígitos>` nuevos → actualizar vault →
  `gh secret set NOTIFY_TOPIC` → `vault.ps1 crypt` + `verify` → re-suscribir al staff.
- Staff: cada miembro suscribe el topic; quien deba **emitir** avisos recibe su propio token de
  publicación (nunca el del owner).

## 6. Automatizaciones (14 nov 2026)

Además del envío manual y de los avisos de herramientas locales, el ecosistema publica
automáticamente en ntfy:

| Automatización | Frecuencia | Workflow / script | Qué avisa |
|---|---|---|---|
| **System watch** | cada 15 min | `system-watch.yml` · `.github/scripts/system-watch.js` | Cambios de estado de las 4 webs, Supabase REST y CDN. Usa `ciszu.ops_monitor_state` para no repetir avisos. |
| **Bot heartbeat** | cada 15 min | `bot-heartbeat-watch.yml` | Bot sin latir >5 min o recuperación. |
| **UptimeRobot** | cada 30 min | `uptime-watch.yml` | Cambios de los 5 monitores externos. |
| **Stats digest** | diario 12:00 UTC | `stats-digest.yml` · `.github/scripts/stats-digest.js` | Cuentas, reseñas, wallets, scores/niveles/plays/likes de MuzicMania y estado del bot. |
| **Status report** | lunes 12:10 UTC | `status-report.yml` · `.github/scripts/status-report.js` | Estado de sistemas, bot y fallos de GitHub Actions de los últimos 7 días. |
| **Workflow failure** | al completar | `workflow-failure-notify.yml` | Fallo/timeout de CI, CodeQL, DAST, Lighthouse, Limpieza, backups y automatizaciones. |
| **Deploy status** | al completar | `deploy-status-notify.yml` | Deploy completado o fallido de cada web. |

Reglas:

- `NOTIFY_TOPIC` es obligatorio; `NOTIFY_TOKEN` es opcional y solo se usa si existe.
- Los scripts viven en `.github/scripts/` (versionados); los scripts operativos locales de
  `scripts/` siguen fuera del repo público.
- `system-watch` guarda estado en `ciszu.ops_monitor_state` (RLS sin policies, grants solo a
  `service_role`); el primer run crea la baseline sin notificar.
- Los resúmenes no incluyen secretos, emails, IPs ni datos personales: solo agregados y estados.
- `services/supabase/` conserva las migraciones locales: `20261114000001_service_role_metrics_select.sql`
  y `20261114000002_ops_monitor_state.sql`.

## 7. Roadmap

- Evaluar ntfy Pro si el spoofing pasa a ser inaceptable.
- Tokens de publicación por rol cuando entre personal.

---

_Última revisión: 14 nov 2026._ Relacionados: `SECURITY_PROTOCOLS.md`,
`ACCESS_CONTROL_SYSTEM.md`, `MONITORING_SYSTEM.md`, `VAULT_SYSTEM.md`.
