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

## 2. Reserva del topic + token (recomendado, pendiente)

1. Crear cuenta en **ntfy.sh** (usuario/contraseña, sin email).
2. En la app web (`ntfy.sh/app`), añadir el topic y usar **Reservar topic** (solo tu cuenta podrá
   publicar; se elimina el spoofing).
3. Settings → **Access tokens** → crear token con permisos **solo de publicación** sobre ese topic.
4. Pasar el token por `SECRET_TEMP.env` como `NOTIFY_TOKEN` → se guarda en el vault cifrado.
   La lectura del topic sigue siendo pública por nombre (limitación de ntfy.sh): por eso la
   política de contenido es estricta.

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

- Reserva + `NOTIFY_TOKEN` (requiere cuenta del owner).
- Tokens de publicación por rol cuando entre personal.

---

_Última revisión: 09 oct 2026._ Relacionados: `SECURITY_PROTOCOLS.md`,
`ACCESS_CONTROL_SYSTEM.md`, `MONITORING_SYSTEM.md`, `VAULT_SYSTEM.md`.
