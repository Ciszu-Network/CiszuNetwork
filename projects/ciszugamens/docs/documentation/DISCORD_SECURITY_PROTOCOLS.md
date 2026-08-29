# DISCORD_SECURITY_PROTOCOLS — Seguridad del Servidor Discord (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: DISCORD_SECURITY_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Protocolos de seguridad, moderación y gestión del servidor Discord de CiszuGamens. Complementa `SECURITY_PROTOCOLS.md` (ciszu) con reglas específicas de Discord.

## Roles y permisos

| Rol | Permisos clave | Asignación |
|---|---|---|
| **Owner** (CEO) | Todos + Server Settings | Ciszuko Antony |
| **Admin** | Manage Server, Roles, Channels, Ban, Kick, Timeout | Equipo directivo |
| **Moderador** | Kick, Timeout, Mute, Manage Messages, View Audit Log | Moderadores activos |
| **Verificado** | Acceso a canales principales, voz, media | Miembros verificados |
| **Comunidad** | Chat general, off-topic | Miembros base |
| **Eventos** | Anuncios eventos, crear hilos | Organizadores eventos |
| **Bot** (si aplica) | Manage Messages, Embed Links, Read History | Bot auxiliar futuro |

## Verificación de ingreso

1. **Regla de lectura**: Canal `#reglas` → reacción ✅ → rol `Verificado`
2. **Captcha opcional**: Turnstile en web landing → rol `Verificado` automático
3. **Anti-alt**: Detección de cuentas < 7 días o sin avatar → revisión manual

## Canales sensibles

| Canal | Acceso | Protección |
|---|---|---|
| `#admin-log` | Admin | Audit log automático |
| `#mod-log` | Moderador + Admin | Solo lectura para mods |
| `#anuncios` | @everyone (read) / Admin (write) | Solo admins publican |
| `#soporte` | Verificado + Admin | Hilos privados por ticket |
| `#eventos` | Verificado + Eventos | Anuncios de torneos |

## Rate limits y anti-spam

- **Slowmode**: 5s en general, 10s en off-topic
- **Auto-mod**: Bloquea links sospechosos, invites externos, spam de emojis
- **Rate limit API**: Respetar límites Discord (50 req/s global, 5 req/s por canal)

## Auditoría y logs

- **Audit log nativo**: Revisión semanal por Admin
- **Bot logging** (si aplica): `#mod-log` con embeds (kick, ban, timeout, role change)
- **Retención**: 90 días mínimo

## Moderación (directrices completas en `docs/docx/DISCORD_MODERATION_GUIDELINES.docx`)

| Infracción | Acción | Escalado |
|---|---|---|
| Spam / flood | Timeout 10m → 1h → 24h | Ban si reincide 3x |
| Toxicidad / insultos | Warning → Timeout 1h → Kick | Ban |
| Contenido NSFW / ilegal | Ban inmediato + reporte Discord | — |
| Raid / alt accounts | Lockdown canal + verificación captcha | Ban masivo |
| Phishing / scam | Ban + reporte + aviso comunidad | — |

## Seguridad de cuentas staff

- **2FA obligatorio**: Owner, Admin, Moderador
- **Sesiones**: Revisar dispositivos activos mensualmente
- **Compromiso**: Rotar token bot / revocar sesiones si compromiso

## Backups y recuperación

| Qué | Frecuencia | Dónde |
|---|---|---|
| Config roles/canales | Semanal | `docs/backups/discord_config_YYYY-MM-DD.json` |
| Audit log export | Mensual | `docs/backups/audit_log_YYYY-MM.json` |
| Lista bans/timeouts | Mensual | `docs/backups/bans_YYYY-MM.xlsx` |

## Incident response

1. **Detección**: Alerta moderador / usuario / auto-mod
2. **Contención**: Timeout / kick / ban / lockdown canal
3. **Investigación**: Revisar audit log + contexto
4. **Resolución**: Aplicar sanción + documentar en `#mod-log`
5. **Post-mortem**: Si ban > 1 usuario o raid → actualizar protocolos

## Integración con ecosistema

- **Sistema de anuncios**: Webhooks Discord para `GLOBAL_ADVISOR_SYSTEM`
- **Landing web**: OAuth Discord para dashboard admin (futuro)
- **CDN**: Assets de moderación (imágenes ban, avisos) en `ciszu-cdn`

---

_Última revisión: 29 ago 2026._