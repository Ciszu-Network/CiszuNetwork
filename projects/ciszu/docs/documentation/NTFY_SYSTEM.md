# NTFY_SYSTEM

> **Versión**: 2.0
> **Actualización**: 09 oct 2026
> **Identificador**: NTFY_SYSTEM
> **Definición**: Sistema de notificaciones push del ecosistema: canal único ntfy.sh, seguridad (reserva + token), suscripción, política de contenido y rotación.

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

## 6. Roadmap

- Evaluar ntfy Pro si el spoofing pasa a ser inaceptable.
- Tokens de publicación por rol cuando entre personal.

---

_Última revisión: 09 oct 2026._ Relacionados: `SECURITY_PROTOCOLS.md`,
`ACCESS_CONTROL_SYSTEM.md`, `MONITORING_SYSTEM.md`, `VAULT_SYSTEM.md`.
