# FEATURE_FLAGS_SYSTEM

> **Versión**: 1.1
> **Actualización**: 25 oct 2026
> **Identificador**: FEATURE_FLAGS_SYSTEM
> **Definición**: Kill switches globales por función de CiszuBot (música, búsqueda, minijuegos, economía, +18…), control de la beta Premium y el sistema de interceptación Premium (aviso en beta / bloqueo real), con control en tiempo real desde la devcon y override por deploy.

---

## 1. Qué es

CiszuBot expone decenas de funciones agrupadas por categorías. Este sistema permite
**desactivar funciones globalmente en tiempo real** (para todos los servidores) sin
desplegar código:

- **Feature flags** (`ciszubot.feature_flags`): una fila por función con `enabled` y
  `reason`. El bot las aplica en ≤20 s (caché) y bloquea el comando con un embed que
  muestra el motivo al usuario.
- **Beta Premium** (`premium_beta`): fila especial que controla si las funciones
  premium están **gratis** (beta activa) o sujetas a suscripción por servidor.
- **Override por deploy** (`FEATURES_OFF`): variable de entorno que fuerza el apagado
  de funciones en una instancia concreta (p. ej. el hosting gratuito sin ffmpeg).
- **Interceptación Premium**: en el dispatch de comandos, antes de ejecutar, se avisa
  (beta) o se bloquea (post-beta) con un embed CTA a la página `/premium`.

Los flags los escribe la **devcon** (sección `FEATURES DEL BOT`) con permiso reforzado:
devcon (nivel ≤ 6) + subcargo del proyecto `ciszubot` + cargo administrativo
(CEO/C-level/Gerentes/Supervisores/Administradores). Cada cambio queda auditado con
`actor` en los logs de sesión.

## 2. Modelo de datos (Supabase, schema `ciszubot`)

Migración `20261010000002_feature_flags.sql` (migración 58; aplicar con
`node scripts/apply-migration-58.js`):

| Tabla | Columnas | Notas |
| --- | --- | --- |
| `ciszubot.feature_flags` | `feature` (PK) · `enabled` (bool, default true) · `reason` (text) · `updated_at` · `updated_by` | Lectura pública (estado no sensible); escritura solo `service_role` |
| `ciszubot.premium_guilds` | `guild_id` (PK) · `plan` · `status` (`active`/`past_due`/`canceled`) · `expires_at` · timestamps | **Deny-all** para anon/authenticated (facturación futura); solo `service_role`. Vacía durante la beta |

Seeds iniciales (todas `enabled = true`): `music`, `search`, `minigames`, `economy`,
`help`, `utility`, `moderation`, `setup`, `levels`, `social`, `premium_beta`. El flag
`nsfw` se añadió después con la migración `20261024000005_nsfw_feature_flag.sql`.

Drizzle: `packages/db/src/schemas/ciszubot.ts` exporta `featureFlags` y `premiumGuilds`.

## 3. Slugs y mapeo a comandos

`projects/ciszubot/discord-bot/src/config/features.ts` (`FEATURE_DEFS`) define cada flag,
su etiqueta y lo que cubre. Los **comandos concretos tienen prioridad** sobre las
categorías:

| Slug | Cubre | Premium |
| --- | --- | --- |
| `music` | categoría `Música` (play, skip, queue, stop, loop, pause, resume) | Sí |
| `search` | comando `search` | Sí |
| `minigames` | categoría `Diversión` (8ball, dice, rps, snipe…) | No |
| `economy` | categoría `Economía` (balance, daily, gamble, shop…) | No |
| `help` | categoría `Información` (help, links, profile, serverinfo, status, premium) | No |
| `utility` | categoría `Utilidad` (bump, vote, giveaway, embed…) | No |
| `moderation` | categoría `Moderación` (kick, ban, mute, warns, purge…) | No |
| `setup` | categoría `Configuración` (setprefix, setlang, setupwelcome…) | No |
| `levels` | categoría `Niveles` (rank, topxp) | No |
| `social` | categoría `Social` (afk, hi, bye, alliance…) | No |
| `nsfw` | categoría `+18` y `nsfwpic` (catálogo adulto completo) | No |

Comandos premium individuales adicionales: `embed` (`PREMIUM_COMMANDS`). La función
"perfil del bot por servidor" se listará como beneficio premium cuando se implemente.

### 3.1 Flag `nsfw` y subsistema +18

El flag `nsfw` es el kill switch global del catálogo adulto. **No sustituye** la
verificación por servidor: un comando `+18` solo se ejecuta si el flag está activo
**y** el servidor cumple la triple verificación **y** el canal está marcado como NSFW
en Discord.

- **Candados por servidor** (todos en `ciszubot.guild_configs`):
  1. `nsfw_bot_preferences_enabled` — consentimiento en `/dashboard/bot`
     (Preferencias del bot).
  2. `nsfw_general_enabled` — activación en la sección **General** del dashboard.
  3. `nsfw_enabled` — apartado **+18** del dashboard.
  `isNsfwUnlocked()` exige los tres; `updateGuildConfig()` y la API aplican la cascada
  (apagar un candado apaga los siguientes y sus sub-opciones).
- **Sub-opciones**: `nsfw_commands_enabled` (comandos), `nsfw_autopost_enabled` +
  `nsfw_autopost_minutes` (autopics), `nsfw_channel_id` y
  `nsfw_autopost_channel_id` (canal independiente opcional). Los canales deben existir
  y estar marcados NSFW; la API lo valida antes de guardar.
- **Preferencias de contenido** (`nsfw_content` JSONB): `default_gender`
  (`women`/`men`/`mixed`), toggles LGBT (`gay`, `lesbian`, `trans`, `bisexual`,
  `pansexual`, `nonbinary`) y fetiches (`femboy`, `tomboy`, `blonde`, `ebony`,
  `latina`, `milf`, `feet`, `thighs`, `belly`). Los comandos y autopics filtran el
  catálogo con estas preferencias.
- **Catálogo**: 30 bases en `src/services/nsfw/catalog.ts` (actos, cuerpo, waifu,
  LGBT y fetiches), estilos `anime`/`cartoon`/`real`, géneros `girl`/`boy`/`mixed` y
  aliases generados (`base+estilo+género`, p. ej. `cz!boobsanimegirl`,
  `cz!dickrealboy`). Los comandos LGBT y de fetiche son independientes y
  desactivables por servidor.
- **Proveedores**: Purrbot para anime/cartoon cuando hay tag; RedGifs para `real` y
  fallback. Timeout de 8 s, token temporal de RedGifs cacheado 20 h, allowlist de
  hosts HTTPS y bloqueo de tags de menores (`loli`, `shota`, `child`, `underage`,
  `teen`, `schoolgirl`, etc.). El bot no almacena ni proxya el media.
- **Runtime**: `src/utils/commandGate.ts` evalúa flag global → categoría `+18` →
  triple candado → canal NSFW → `nsfw_commands_enabled`; `src/commands/nsfw.ts`
  repite las comprobaciones para prefijo y slash. `cz!help` oculta la categoría y
  desactiva el select si no está desbloqueada.
- **Autopics**: `src/services/autoposts.ts` crea el timer `guild:nsfw` solo con triple
  candado, canal configurado y `nsfw_autopost_enabled`; intervalo mínimo 15 min
  (máximo 10080). Publica en `nsfw_autopost_channel_id` o, si es `null`, en
  `nsfw_channel_id`; si el canal deja de ser NSFW, no publica.
- **Operación**: `node scripts/features.mjs disable nsfw "motivo"` apaga el catálogo
  global en ≤20 s (TTL de `featureFlags`). La verificación por servidor y el canal
  NSFW siguen aplicando. Para reactivar: `enable nsfw`.
- **Archivos**: `src/config/features.ts` · `src/services/nsfw/{catalog,providers}.ts` ·
  `src/commands/nsfw.ts` · `src/services/autoposts.ts` · `src/services/configService.ts`
  · `src/utils/commandGate.ts` · `src/commands/help.ts` · dashboard/API de ciszubot.
  Migraciones: `20261019000011_autoposts_nsfw.sql`,
  `20261024000003_nsfw_subsystem.sql`, `20261024000005_nsfw_feature_flag.sql`.

## 4. Lado bot

- **Servicio** (`src/services/featureFlags.ts`): lee la tabla con caché de 20 s (sin
  golpear la DB por comando). Sin fila ⇒ **activo** (nunca romper por un seed ausente).
  DB caída ⇒ degradación segura (todo activo; beta gratis). `FEATURES_OFF` gana sobre
  la DB.
- **Interceptor** (`src/utils/commandGate.ts`): se ejecuta en el dispatch de prefijo
  (`src/index.ts`, mensajes `cz!`) y de slash (`InteractionCreate`) antes de
  `command.execute`:
  1. Si la función está desactivada ⇒ embed `⛔ Función desactivada` con el motivo y
     **no ejecuta**.
  2. Si el comando es premium y la beta está activa ⇒ envía el embed `⭐ Función
     Premium` + el embed aparte `🧪 BETA — gratis por ahora` y **ejecuta**.
  3. Si la beta está apagada y el servidor no tiene premium (`premium_guilds`) ⇒ embed
     CTA a `/premium` y **no ejecuta**.
- **Comando `cz!premium`** (`src/commands/premium.ts`): informa del programa premium,
  incluye el disclaimer de beta cuando aplica y enlaza a la página web.
- **Help**: `cz!help` marca las categorías desactivadas (`⛔ desactivada`), y el detalle
  de comando añade los campos `⛔ Desactivada` (con motivo) y `⭐ Premium`. La categoría
  `+18` solo se lista si el flag `nsfw`, la triple verificación y
  `nsfw_commands_enabled` están activos; si no, se oculta del listado y el select.
- **Per-deploy**: `FEATURES_OFF=music,search` en el `.env` del panel (ver §7).

## 5. Devcon

- **Sección** `FEATURES DEL BOT (kill switches)` en `test/website/debug/dev_console.ps1`
  (`Show-FeaturesSection`): al entrar muestra una **fila por función con su estado**
  (`ON`/`OFF` + motivo), más `Resumen` y `Salir`. Al elegir una función:
  `Activar` / `Desactivar (pide motivo)` / `Cambiar motivo` / `Volver`.
- **Gate**: `Test-ConsoleProjectAdmin` (en `tools/consoles/console-guard.ps1`) exige
  `can --project ciszubot` permitido **y** que los cargos del subcargo del proyecto
  (o del comodín `*`) incluyan un cargo administrativo. El guard
  (`scripts/console-guard.mts`) devuelve `projectCargos` para este chequeo.
- **CLI** `scripts/features.mjs` (patrón `botstatus.mjs`, PostgREST con service_role):
  - `list` · `json` (para la devcon) · `enable <feature>` · `disable <feature> [motivo]`
    · `reason <feature> <motivo>` · `beta on|off`.
  - Actor vía `FEATURES_ACTOR` (la devcon lo registra en
    `test/website/debug/local-logs/`).
- Tiempo real: el bot aplica los cambios en ≤20 s (TTL de caché). No requiere reinicio.

## 6. Sistema Premium

- **Beta**: `premium_beta = true` ⇒ todo gratis para todos los servidores. Al apagarla
  (`beta off` o desactivar la fila), la interceptación bloquea de verdad las funciones
  premium sin suscripción. Sin fila ⇒ beta activa (seguro por defecto).
- **Página web** `/premium` (ciszubot): beneficios, suscripción con precio "por
  definir" y **modal bloqueante** mientras la beta esté activa (sin checkout). Gating
  futuro ya cableado: sesión Discord (redirect a login), CISZU ID (chequeo cliente) y
  bot en ≥1 servidor del usuario (server-side con `getGuildsForUser` + `getBotGuildIds`).
- **Promos**: sección en el home (`PremiumSection`), sección en el dashboard
  (`PreQuickDocks`), bloque en `/explore` y comando `cz!premium`.
- **Términos**: `/terms` (es/en) añade "Compras y suscripciones", "Reembolsos y
  cancelación" y "Beta premium". El disclaimer de beta se repite en la página, las
  promos y los embeds del bot.
- **Pagos**: no implementados todavía (decisión de producto). `premium_guilds` queda
  lista para poblarse cuando exista la pasarela.
- **Sub-opciones premium**: además de funciones completas (música, búsqueda), una
  configuración puede tener sub-opciones premium marcadas con etiqueta (`PremiumTag`).
  Durante la beta funcionan gratis (nota "Premium · gratis durante la beta"); al salir
  de beta se bloquearán con el estado de `premium_guilds`.
- **Leaderboard por servidor** (11 oct 2026): cada servidor puede activar un ranking
  público de niveles en `/leaderboard/<guild_id>` (misma fórmula de XP que el bot).
  La **URL personalizada** (`/leaderboard/<slug>`, único case-insensitive) y el
  **reinicio** del leaderboard son sub-opciones premium (gratis en beta); el reinicio
  se audita como `leaderboard_reset` y borra `ciszubot.levels` del servidor. Columnas
  `leaderboard_enabled` / `leaderboard_slug` en `guild_configs` (migración 60).

## 7. Operación (caso música sin Lavalink)

La música del bot usa `play-dl` (sin Lavalink). En el hosting gratuito (256 MB) la
música puede no sobrevivir (transcodificación); para probar:

1. Desplegar el bot completo con música activa y probar `cz!play`.
2. Si falla (OOM/crash), apagar la función sin desplegar código:
   `node scripts/features.mjs disable music "Música en mantenimiento"` (o desde la
   devcon). El bot responde `⛔ Función desactivada — Motivo: …` a `cz!play`.
3. Re-activar cuando haya recursos: `node scripts/features.mjs enable music`.
4. Alternativa por deploy: `FEATURES_OFF=music` en el `.env` del panel (gana sobre la
   DB; útil para una instancia concreta sin ffmpeg).

## 8. Archivos clave

- Migración: `services/supabase/migrations/20261010000002_feature_flags.sql` ·
  `scripts/apply-migration-58.js`.
- Bot: `src/config/features.ts` · `src/services/featureFlags.ts` ·
  `src/utils/commandGate.ts` · `src/commands/premium.ts` · `src/index.ts` (dispatch) ·
  `src/commands/help.ts`.
- Subsistema +18: `src/services/nsfw/catalog.ts` · `src/services/nsfw/providers.ts` ·
  `src/services/autoposts.ts` · `src/commands/nsfw.ts` · `src/services/configService.ts`
  (triple candado y `nsfw_content`) · migraciones `20261024000003_nsfw_subsystem.sql` y
  `20261024000005_nsfw_feature_flag.sql`.
- Devcon: `test/website/debug/dev_console.ps1` (sección) ·
  `tools/consoles/console-guard.ps1` (`Test-ConsoleProjectAdmin`) ·
  `scripts/console-guard.mts` (`projectCargos`) · `scripts/features.mjs`.
- Web: `src/app/premium/{page,client}.tsx` · `src/lib/premiumFlags.ts` ·
  `src/components/home/PremiumSection.tsx` ·
  `src/components/dashboard/PreQuickDocks.tsx` · `src/app/explore/page.tsx` ·
  `src/lib/i18n.ts` (bloques `premiumPage`, `premiumPromo`, `legalPage`).
- Deploy: `scripts/build-bot-standalone.mjs` · `scripts/standalone-postbuild.mjs` ·
  `deploy/ciszubot-standalone.zip` (no versionado).

## 9. Seguridad

- Escritura de flags solo con `service_role` (vault local); la web solo lee
  `premium_beta`. `premium_guilds` es deny-all para anon/authenticated.
- El gate de la devcon es doble (consola + proyecto + cargo admin) y cada acción queda
  auditada con actor.
- Los motivos son texto mostrado a usuarios finales: se escriben desde la devcon (sin
  entrada de usuarios).
- No hay secretos en el repo: el standalone usa `.env` del panel; el vault es la fuente.

## 10. Verificación

- Migración aplicada y verificada con Management API (`feature_flags` con 12 filas,
  incluida `nsfw`; `premium_guilds` vacía).
- `scripts/features.mjs` probado (disable/enable con motivo).
- Guard probado: `can --staff CZ-001 --project ciszubot` ⇒ `projectCargos: ["CEO"]`.
- `pnpm --filter ciszubot exec tsc --noEmit` ✅ · `pnpm --filter ciszubot-website
  {tsc,lint,build}` ✅ · `pnpm typecheck` (monorepo) ✅ · `pnpm verify:i18n` ✅.
- Standalone: `npm run setup && npm start` verificado en local (comandos cargados,
  servidor HTTP en `:5000`, único error esperado: token vacío sin `.env`).

---

_Última revisión: 25 oct 2026._ Relacionado: `ACCESS_CONTROL_SYSTEM.md` (gate de
consolas), `CONSOLE_SECURITY_SYSTEM.md`, `DEV_CONSOLE_SYSTEM.md`, `DB_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `HEALTH_AND_SAFETY_PROTOCOLS.md` (contenido adulto y edad),
`PAYMENTS_SYSTEM.md` (futuro checkout), `MONETIZATION_PROTOCOLS.md`,
`VPS_PLAN.md` (despliegue del bot), `AGENTS.md`.
