# PROJECT_STATE — Estado de CiszuBot

Versión: 1.1.1
Actualización: 2026-11-13
Identificador: PROJECT_STATE_V1.1.1_2026_11_13_ciszunetwork

> **Definición**: estado actual del proyecto **CiszuBot** (bot de Discord + landing web +
> base de datos Supabase): componente, estado y notas. Documento vivo: se actualiza en cada
> sesión. Solo lo edita Ciszuko Antony.

## Estado actual

| Componente | Estado | Notas |
|---|---|---|
| Website (Next.js) | ✅ Build OK / ⛔ caída en producción | Landing neon + dashboard OAuth (config por servidor) — build OK; `ciszubot.vercel.app` responde HTTP 402 `DEPLOYMENT_DISABLED` por la pausa de Vercel |
| Bot (Discord.js) | ✅ Listo | v3.4.0 — TypeScript, 72 comandos (slash + prefijo `cz!`), heartbeat Supabase |
| Comandos | ✅ 72 | 9 categorías: Configuración, Diversión, Economía, Información, Moderación, Música, Niveles, Social, Utilidad |
| Slash commands JSON | ✅ Listo | `commands.json` (canónico) + `docs/slash-commands.json`/`.md` — regenerables con `scripts/generate-commands.js` |
| Migración 14 | ✅ Aplicada | 13 tablas en `ciszubot` (guild_configs, wallets, transactions, shop_items, inventory, levels, warns, tickets, giveaways, afk, alliances, discord_users, snipes) |
| Economía | ✅ | balance/daily/give/gamble/slot/deposit/withdraw/leaderboard/shop/buy (wallets + transactions) |
| Niveles | ✅ | rank/topxp — XP por mensaje (cooldown 60s), canal de nivel configurable |
| Música | ✅ | play/skip/queue/stop/loop/pause/resume — @discordjs/voice + play-dl (requiere ffmpeg, ya en Dockerfile) |
| Tickets | ✅ | setup tickets, botones ticket_create/ticket_close |
| Bot lists API | ⛔ Top.gg denegado | Top.gg rechazó la verificación (13 nov 2026) porque el dashboard está caído por la pausa de Vercel. Código listo (`botlists.ts`, webhook `POST /api/votes` recompensa 500 monedas). Reintentar cuando `ciszubot.vercel.app` y el dashboard estén operativos; `DISCORDBOTLIST_TOKEN` sigue pendiente |
| Dashboard web | ✅ Build OK / ⛔ no accesible | OAuth Discord (cookie HMAC), `/dashboard` + `/dashboard/[guildId]` + API `/api/dashboard/[guildId]`. Requiere registrar callback `https://ciszubot.vercel.app/api/auth/discord/callback` en el Developer Portal y que Vercel vuelva a servir la web |
| Producción Vercel | ⛔ Bloqueada | Las 4 URLs del ecosistema responden HTTP 402 `DEPLOYMENT_DISABLED` (13 nov 2026); sin nuevos deploys |
| Env vars Vercel | ✅ Añadidas | DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET, NEXT_PUBLIC_SITE_URL (producción) |
| 24/7 hosting | ❌ Pendiente | Ver `VPS_PLAN.md` (ciszu) — recomendación Oracle Free Tier |
| Documentación | ✅ Completa | Todos los formatos |
| documentation | ✅ Completo | Archivos con estructura completa |
| public/docs/ | ✅ Creado | En website/public/docs/ |
| Shigamens Server Docs | ✅ Incluidas | Reglas y directrices |
| Stats | ✅ Completo | Página `/stats` leyendo métricas reales desde `ciszubot_stats` (Supabase) |
| Changelog | ✅ Completo | Página `/changelog` con filtros, búsqueda, orden, paginación y likes con login |
| Support | ✅ Completo | Página `/support` con sistema de tickets (tabla `ciszubot_tickets`) y AuthWarningModal |
| Disclaimers | ✅ Actualizado | Soporte de botones de acción (`--action "Texto|URL"` o `--action "OK|close"`) en devcon y componente `DisclaimerStack` |

## Notas técnicas (13 nov 2026)

- **Top.gg (13 nov 2026)**: denegó la verificación de CiszuBot porque `ciszubot.vercel.app` y el dashboard están caídos por la pausa de Vercel (HTTP 402 `DEPLOYMENT_DISABLED`). Reintentar cuando la web esté operativa; el token de posting a Top.gg y `DISCORDBOTLIST_TOKEN` son bloqueos separados.
- **Vercel (13 nov 2026)**: comprobadas las 4 webs; siguen pausadas (HTTP 402), por lo que no hay deploy ni validación online del dashboard/OAuth.
- **Auditoría de seguridad (10 nov 2026)**: eliminado el fallback hardcodeado de `SESSION_SECRET`; las sesiones llevan expiración absoluta (7 días) y el state OAuth usa `crypto.randomBytes`. `POST /api/update-stats` exige `STATS_UPDATE_SECRET` y los webhooks de votos fallan cerrados si falta token. Tests del bot 81/81.
- **Auditoría documental (10 nov 2026)**: fechas de revisión refrescadas; sin cambios funcionales adicionales en bot ni web. El bot reporta v3.4.0; Top.gg denegó la verificación el 13 nov 2026 por el dashboard caído.
- Registry soporta arrays y fábricas por archivo (`utils/commandRegistry.ts`).
- SimulatedMessage ampliado (mentions con users/roles/channels, member con permissions/roles/voice).
- Limitación conocida: `configService.ts` cachea guild_configs en memoria del bot; cambios desde el dashboard no invalidan la caché hasta reiniciar el bot.
- `framer-motion` instalado en website para soportar animaciones en changelog y support.
- Navbar responsive arreglada: overflow resuelto con `overflow-x-hidden`, breakpoints expandidos a 16 niveles.

## Stack

- **Website**: Next.js 15 + TypeScript + Tailwind 4 + framer-motion
- **Bot**: Discord.js v14 + TypeScript
- **Package Manager**: pnpm
- **Backend**: Supabase (PostgreSQL + Auth + Storage)

ÚLTIMA ACTUALIZACIÓN: 2026-11-13
