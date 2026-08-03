# STATUS - CiszuBot

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
| 24/7 hosting | ❌ Pendiente | Ver `docs/ia_docs/VPS_247.md` (recomendación Oracle Free Tier) |
| Documentación | ✅ Completa | Todos los formatos |
| ia_docs | ✅ Completo | 11 archivos |
| public/docs/ | ✅ Creado | En website/public/docs/ |
| Shigamens Server Docs | ✅ Incluidas | Reglas y directrices |

### Notas técnicas (2 ago 2026)
- Registry soporta arrays y fábricas por archivo (`utils/commandRegistry.ts`).
- SimulatedMessage ampliado (mentions con users/roles/channels, member con permissions/roles/voice).
- Limitación conocida: `configService.ts` cachea guild_configs en memoria del bot; cambios desde el dashboard no invalidan la caché hasta reiniciar el bot.

ÚLTIMA ACTUALIZACIÓN: 2026-08-02
