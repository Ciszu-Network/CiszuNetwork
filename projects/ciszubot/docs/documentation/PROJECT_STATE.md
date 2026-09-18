# PROJECT_STATE — Estado de CiszuBot

Versión: 1.1.0
Actualización: 2026-09-10
Identificador: PROJECT_STATE_V1.1.0_2026_09_10_ciszunetwork

> **Definición**: estado actual del proyecto **CiszuBot** (bot de Discord + landing web +
> base de datos Supabase): componente, estado y notas. Documento vivo: se actualiza en cada
> sesión. Solo lo edita Ciszuko Antony.

## Estado actual

| Componente | Estado | Notas |
|---|---|---|
| Website (Next.js) | ✅ Listo | Landing neon + dashboard OAuth (config por servidor) — 12 rutas, build OK 2 ago 2026 |
| Bot (Discord.js) | ✅ Listo | v3.2.0 — TypeScript, 72 comandos (slash + prefijo `cz!`), heartbeat Supabase |
| Comandos | ✅ 72 | 9 categorías: Configuración, Diversión, Economía, Información, Moderación, Música, Niveles, Social, Utilidad |
| Slash commands JSON | ✅ Listo | `commands.json` (canónico) + `docs/slash-commands.json`/`.md` — regenerables con `scripts/generate-commands.js` |
| Migración 14 | ✅ Aplicada | 13 tablas en `ciszubot` (guild_configs, wallets, transactions, shop_items, inventory, levels, warns, tickets, giveaways, afk, alliances, discord_users, snipes) |
| Economía | ✅ | balance/daily/give/gamble/slot/deposit/withdraw/leaderboard/shop/buy (wallets + transactions) |
| Niveles | ✅ | rank/topxp — XP por mensaje (cooldown 60s), canal de nivel configurable |
| Música | ✅ | play/skip/queue/stop/loop/pause/resume — @discordjs/voice + play-dl (requiere ffmpeg, ya en Dockerfile) |
| Tickets | ✅ | setup tickets, botones ticket_create/ticket_close |
| Bot lists API | ⏳ Pendiente | Código listo (`botlists.ts`, webhook `POST /api/votes` recompensa 500 monedas). Subir a top.gg/DiscordBotList requiere tokens del usuario (`TOP_GG_TOKEN`, `DISCORDBOTLIST_TOKEN`) |
| Dashboard web | ✅ Build OK | OAuth Discord (cookie HMAC), `/dashboard` + `/dashboard/[guildId]` + API `/api/dashboard/[guildId]`. Requiere registrar callback `https://ciszubot.vercel.app/api/auth/discord/callback` en el Developer Portal |
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

## Notas técnicas (10 sep 2026)

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

ÚLTIMA ACTUALIZACIÓN: 2026-09-10
