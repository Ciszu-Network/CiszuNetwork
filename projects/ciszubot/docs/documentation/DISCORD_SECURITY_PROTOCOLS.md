# DISCORD_SECURITY_PROTOCOLS — Protocolos de Seguridad de Discord (CiszuBot)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: DISCORD_SECURITY_PROTOCOLS_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: Protocolos de seguridad específicos del bot de Discord (CiszuBot): protección del token, permisos de invitación, rate limits de la API de Discord, manejo de datos de usuarios, verificación de comandos y checklist de auditoría. Lo genérico del ecosistema vive en `SECURITY_PROTOCOLS.md` (ciszu).

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Alcance y responsabilidad](#2-alcance-y-responsabilidad)
3. [Protección del token del bot](#3-protección-del-token-del-bot)
4. [Permisos y scopes de invitación](#4-permisos-y-scopes-de-invitación)
5. [Manejo de datos de usuarios](#5-manejo-de-datos-de-usuarios)
6. [Rate limits de la API de Discord](#6-rate-limits-de-la-api-de-discord)
7. [Verificación de comandos y permisos](#7-verificación-de-comandos-y-permisos)
8. [Seguridad de interacciones](#8-seguridad-de-interacciones)
9. [Seguridad del dashboard OAuth](#9-seguridad-del-dashboard-oauth)
10. [Persistencia en Supabase](#10-persistencia-en-supabase)
11. [Protección del servidor de Discord](#11-protección-del-servidor-de-discord)
12. [Monitoreo y respuesta a incidentes](#12-monitoreo-y-respuesta-a-incidentes)
13. [Estándares de referencia](#13-estándares-de-referencia)
14. [Checklist de auditoría](#14-checklist-de-auditoría)
15. [FAQ](#15-faq)

## 1. Visión general

Este documento recoge los protocolos de seguridad que aplican específicamente a la integración con **Discord**: token del bot, invitaciones, rate limits, datos de usuarios y verificación de comandos. Es el complemento específico de `SECURITY_PROTOCOLS.md` (ciszu), que cubre la seguridad genérica del ecosistema (RLS, rate limits de endpoints, secretos, XSS, SQLi, SAST/DAST).

El bot usa **Discord.js v14** (API v10), slash commands + prefijo `cz!`, y persiste datos en Supabase (schema `ciszubot`).

## 2. Alcance y responsabilidad

| Rol | Responsabilidad |
| --- | --- |
| Propietario (Ciszuko Antony) | Gestiona el Developer Portal, tokens y scopes |
| Agentes/colaboradores | Siguen estos protocolos; nunca manipulan tokens |
| Bot (runtime) | Lee secretos solo de `process.env`, nunca los loguea |
| Website | OAuth con cookie HMAC; nunca expone la service_role key al cliente |

**Regla cero**: si no se necesita un permiso o un dato, no se pide ni se almacena.

## 3. Protección del token del bot

1. El token `DISCORD_BOT_TOKEN` **NUNCA** debe imprimirse en logs, chats, artefactos, commits ni respuestas.
2. Se almacena en `.env` / `.env.local` (en `.gitignore`) o como secret de Vercel; no hay fallback en código.
3. En el código referirse a "el token del bot" sin revelar su valor; solo se usa vía `process.env.DISCORD_BOT_TOKEN` en `src/config/index.ts`.
4. Rotar el token inmediatamente si se sospecha filtración (Developer Portal → Reset Token). Tras rotar, actualizar `.env` y Vercel env vars.
5. Usar claves de solo lectura cuando exista la opción (aplica a otras credenciales; el token de bot no la tiene).
6. `SUPABASE_SERVICE_ROLE_KEY` es igual de sensible: nunca al cliente web (la web la usa solo server-side).

### 3.1 Detección de fugas

- Escanear el repo con gitleaks/secretlint (ver `DEVSECOPS_SYSTEM.md`, ciszu) antes de cada push.
- Si un token aparece en un commit pasado, rotarlo y purgar historial (rebase/`filter-repo`) bajo autorización del propietario.

## 4. Permisos y scopes de invitación

El enlace de invitación del bot se genera con scopes y permisos **mínimos**. El invite estándar:

- **Scopes**: `bot`, `applications.commands` (necesario para slash commands).
- **Permisos** sugeridos (mínimos por funcionalidad): `View Channels`, `Send Messages`, `Embed Links`, `Read Message History`, `Add Reactions`, `Manage Channels` (tickets/canales privados), `Manage Roles` (autoroles), `Kick/Ban Members` (moderación), `Manage Messages` (purge/snipe).

### 4.1 Principios

- **Least privilege**: solo los permisos que la funcionalidad activa necesita.
- No pedir `Administrator` salvo que sea estrictamente necesario.
- Documentar en la web los permisos solicitados (`/invite`).
- Revisar los permisos al añadir funcionalidad nueva: ampliar el permiso sin justificación es una vulnerabilidad.

### 4.2 Verificación del invite

- Probar el invite en un servidor de prueba y comprobar que el bot solo puede actuar sobre lo configurado.
- El bot respeta `permissionOverwrites` al crear canales de tickets/privados: no conceder a `@everyone` acceso por defecto.

## 5. Manejo de datos de usuarios

### 5.1 Principios

1. **Minimización**: almacenar solo lo necesario para la funcionalidad (IDs, XP, monedas, warns, tickets).
2. **Consentimiento**: no registrar información sensible sin consentimiento explícito.
3. **Finalidad**: los datos de Discord (IDs, mensajes) solo se usan para la funcionalidad del bot; no se venden ni se comparten.
4. **Retención**: limpiar datos obsoletos; los `snipes` y logs de comandos no deben retenerse indefinidamente sin necesidad.

### 5.2 Datos que se persisten (schema `ciszubot`)

| Tabla | Datos | Sensibilidad |
| --- | --- | --- |
| `wallets`/`transactions` | IDs de usuario, saldos | Media |
| `levels` | XP/nivel por usuario-guild | Baja |
| `warns` | IDs y razones | Media |
| `tickets` | IDs y contenido de ticket | Media |
| `snipes` | Contenido de mensajes borrados | Media (puede contener texto del usuario) |
| `command_logs` | IDs, comando, args | Baja (no exponer args sensibles) |
| `afk` | Razón y estado | Baja |
| `alliances`/`giveaways`/`inventory`/`shop_items`/`discord_users` | Datos de juego/servicio | Baja |

### 5.3 Reglas de exposición

- No exponer `command_logs.args` en APIs públicas ni en el dashboard sin anonimizar.
- `bot_status` es público por diseño, pero **solo contiene métricas agregadas** (online, guilds, commands_total, version), nunca datos de usuarios.
- No loguear el contenido completo de mensajes salvo que sea imprescindible para depurar, y nunca tokens ni credenciales.
- Para borrar datos de un usuario (derecho de supresión), identificar todas las tablas con su `user_id` y eliminar/anonimizar (función de limpieza pendiente de definir en el roadmap).

## 6. Rate limits de la API de Discord

La API de Discord tiene rate limits por ruta (token bucket). Discord.js respeta `X-RateLimit-Remaining` y emite `rateLimit` events.

### 6.1 Prácticas obligatorias

- **Colas**: comandos que puedan exceder límites (purges, envíos masivos) deben encolarse o espaciarse.
- **No reintentar en bucle**: respetar `Retry-After` cuando la API responde 429.
- **Registro global**: al hacer muchas llamadas concurrentes (ej. `guild.members.fetch()` en contadores), hacer `setInterval`/batches y no lanzar todas a la vez.
- **Bot lists**: el posting de stats a top.gg/DiscordBotList está espaciado (30 min) para no saturar.
- **Webhook de votos**: el endpoint `POST /api/votes` debe validar la firma del webhook antes de recompensar monedas (evita recompensas falsas y abuso).

### 6.2 Manejo de 429

```
HTTP 429 + Retry-After
 → detener llamadas a esa ruta
 → esperar Retry-After (+ pequeño margen)
 → reintentar de forma controlada
```

En el código, los upserts de estado (`bot_status`) y logs de comandos se envuelven en try/catch y degradan con warning, sin bloquear el bot.

## 7. Verificación de comandos y permisos

1. **Los comandos del bot deben validar permisos antes de ejecutarse.**
2. Usar el sistema de roles de Discord para restringir comandos administrativos (moderación, configuración, tickets, giveaways).
3. NUNCA ejecutar comandos que requieran privilegios sin verificar que el invocador los tiene:
   - En prefix: comprobar `message.member.permissions.has(...)`.
   - En slash: comprobar `interaction.memberPermissions`.
4. En la ejecución, verificar además los permisos del propio bot (que pueda ejecutar la acción; ej. `member.manageable`, `channel.deletable`).

### 7.1 Tabla de comandos restringidos

| Comando | Permiso requerido del usuario |
| --- | --- |
| `kick`, `ban`, `unban`, `mute`, `unmute`, `warn`, `warns`, `purge`, `close` | `KickMembers` / `BanMembers` / `ManageMessages` / `ManageChannels` según el caso |
| `setprefix`, `setlang`, `setup*` (welcome, goodbye, autorole, counters, tickets, leveling, private, logs) | `ManageGuild` |
| `giveaway`, `gend` | `ManageGuild` o rol de staff |
| `embed`, `directsay` | `ManageMessages` o rol de staff |
| `confess`, `closeprivate` | sin permiso especial (el usuario cierra su propio canal) |

**Nota**: validar que la acción no escale privilegios (p. ej. no permitir que un usuario sin permisos mute a un moderador). Comprobar también jerarquía de roles (el objetivo no debe tener un rol superior al del invocador).

## 8. Seguridad de interacciones

- `InteractionCreate` debe filtrar por `customId` conocidos (`ticket_create`, `ticket_close`, `private_channel_join`, `help_select`); los `customId` desconocidos se ignoran.
- En botones sensibles, verificar el `guild` y los permisos de quien pulsa (p. ej. solo el autor del ticket o staff puede cerrarlo).
- Los selects del menú de ayuda solo muestran información, pero validar categorías para evitar inyecciones en embeds.
- Sanitizar todo texto de usuario que se muestre en embeds (nombres de canales, razones, mensajes): usar `escapeHtml()`/`textContent`; nunca `innerHTML` con datos de usuario.
- No responder interacciones de bots con tiempo de espera agotado (si `interaction.replied`/`deferred`, usar `followUp`).

## 9. Seguridad del dashboard OAuth

- El flujo usa OAuth de Discord con cookie **HMAC** firmada con `SESSION_SECRET` (secreto de alta entropía, nunca `NEXT_PUBLIC_`).
- El callback `https://ciszubot.vercel.app/api/auth/discord/callback` debe estar registrado en el Developer Portal con redirects exactos.
- Validar el `state` del OAuth (anti-CSRF) en el intercambio.
- La web solo debe poder configurar servidores donde el usuario tenga permisos (comprobar roles vía API de Discord).
- La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en server-side; las rutas del dashboard son API server actions/routes, nunca expuestas.
- Proteger `/api/dashboard/*` con rate limiting y autenticación (cookie HMAC + comprobación de guild).

## 10. Persistencia en Supabase

- Toda tabla nueva: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policy explícita **en la misma migración**.
- Policies por comando (nunca `FOR ALL`); envolver `auth.*()` en `(SELECT auth.X())`.
- `bot_status`: `SELECT USING (true)` público (solo métricas) + escritura `service_role`. Ver `ARCHITECTURE.md` §5.1.
- El bot escribe con `service_role` (bypass RLS) — cualquier uso indebido de esa clave compromete todas las tablas.
- Tras cambios en policies/funciones, verificar con **dbvr** y los Security/Performance Advisors del Dashboard.
- No exponer `SUPABASE_URL`/key en la web pública; el cliente de la web usa server-side.

## 11. Protección del servidor de Discord

- El bot no debe conceder roles por encima del rango de quien lo pide ni asignar `Administrator`.
- Los canales privados/tickets se crean con `@everyone` sin `ViewChannel` y solo se añaden los participantes.
- Recomendar al servidor: 2FA para moderadores, `server verification` alta, anti-raid.
- Los comandos de moderación deben loguearse (Sentry + `command_logs`) para auditar acciones.
- Configurar un canal de logs del servidor (`setuplogs`) para registrar eventos de moderación.

## 12. Monitoreo y respuesta a incidentes

| Evento | Detección | Respuesta |
| --- | --- | --- |
| Fuga de token | gitleaks/secretlint, Sentry, revisión | Rotar token, purgar historial, actualizar secretos |
| 429 masivo | logs del bot, Sentry | Revisar comandos que disparan ráfagas; añadir colas |
| Uso indebido de comandos admin | `command_logs` + logs del bot | Revocar permisos, revisar roles, auditar |
| Fuga de service_role key | revisión de variables públicas | Rotar clave, corregir exposición |
| Downtime del bot | `bot_status.online`, UptimeRobot | Reiniciar contenedor; revisar `docker logs` |
| Webhook de votos spoofeado | firma inválida → rechazo | Validar firma siempre; loguear intentos |

Alertas: UptimeRobot + ntfy (ver `MONITORING_SYSTEM.md`, ciszu). Errores de runtime: Sentry.

## 13. Estándares de referencia

- `SECURITY_PROTOCOLS.md` (ciszu) — seguridad genérica del ecosistema (obligatorio leer).
- `DEVSECOPS_SYSTEM.md` (ciszu) — SAST/DAST, shift-left.
- `VAULT_SYSTEM.md` (ciszu) — almacenamiento de credenciales.
- `MONITORING_SYSTEM.md` (ciszu) — alertas y uptime.
- `BRAND_PLAN.md` — identidad visual del proyecto.
- Marco global: OWASP Top 10, NIST SP 800-218 (SSDF), ISO/IEC 27001, CVE/CWE.

## 14. Checklist de auditoría

**Token y secretos**
- [ ] `DISCORD_BOT_TOKEN` y `SUPABASE_SERVICE_ROLE_KEY` solo en `process.env`, sin fallbacks.
- [ ] No hay secretos en logs, commits ni respuestas.
- [ ] gitleaks/secretlint pasan antes del push.
- [ ] `NEXT_PUBLIC_` nunca contiene secretos.

**Invitación y permisos**
- [ ] Invite con scopes/permisos mínimos (`bot`, `applications.commands`).
- [ ] Sin `Administrator` salvo justificación.
- [ ] Permisos del bot respetan overwrites en canales creados.

**Comandos**
- [ ] Comandos admin validan permisos antes de ejecutarse.
- [ ] Verificación de jerarquía de roles en moderación.
- [ ] `customId` de interacciones filtrados por lista conocida.
- [ ] Texto de usuario sanitizado en embeds.

**Datos**
- [ ] `bot_status` solo métricas agregadas.
- [ ] No se expone `command_logs.args` en APIs públicas.
- [ ] Plan de supresión de datos de usuario definido.

**Rate limits**
- [ ] Sin bucles de reintento sin respetar `Retry-After`.
- [ ] Webhook de votos valida firma antes de recompensar.
- [ ] Envíos masivos encolados/espaciados.

**Supabase**
- [ ] RLS + policies por comando en cada tabla nueva.
- [ ] Verificado con dbvr y Advisors tras cambios.

## 15. FAQ

**¿Qué hago si se filtra el token?** Rotarlo en el Developer Portal, actualizar `.env`/Vercel y purgar historial si llegó a un commit.

**¿Por qué no se deben pedir muchos permisos?** Least privilege reduce el daño si el bot se compromete y genera confianza en los servidores.

**¿Cómo sé qué permisos tiene un comando?** Consultar la tabla de la sección 7.1 y validar con `PermissionsBitField`.

**¿El webhook de votos puede ser abusado?** Solo si no se valida la firma; el protocolo exige validarla (firma HMAC del proveedor) antes de acreditar las 500 monedas.

**¿Dónde está la seguridad genérica?** En `SECURITY_PROTOCOLS.md` (ciszu); este doc cubre solo lo específico de Discord.

