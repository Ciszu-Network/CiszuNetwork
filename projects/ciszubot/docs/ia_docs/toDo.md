# To Do List — CiszuBot

> Este archivo solo puede ser editado por Ciszuko Antony.

## Prioridad Alta

- [ ] **CDN Migration**: Migrar assets multimedia del bot a Supabase Storage
- [ ] **Registrar callback OAuth en Discord Developer Portal**: `https://ciszubot.vercel.app/api/auth/discord/callback` + guardar `DISCORD_CLIENT_SECRET` (Vercel + `.env.local`) — necesario para el dashboard
- [ ] **Subir comandos a bot lists**: `TOP_GG_TOKEN` y `DISCORDBOTLIST_TOKEN` en `.env` del bot (código listo: AutoPoster + DBL posting cada 30 min + webhook `/api/votes` recompensa 500 monedas)
- [ ] **Configurar hosting** para el bot (VPS o similar, 24/7) — ver `VPS_247.md`

## Prioridad Media

- [ ] **Push + deploy** del website (v3.2.0: dashboard + 72 comandos)
- [ ] **Invalidar caché de config del bot** desde el dashboard (hoy los cambios requieren reinicio del bot)
- [ ] Más comandos: eventos, sorteos avanzados, economías por guild

## Completado (2 ago 2026)

- [x] **Migración 14 aplicada** — 13 tablas: guild_configs, wallets, transactions, shop_items, inventory, levels, warns, tickets, giveaways, afk, alliances, discord_users, snipes
- [x] **72 comandos en 9 categorías** — economía (10), música (7), moderación (8), configuración (10), niveles (2), social (5), diversión (text, avatar, snipe, afk, search, animal, minigames) + legado
- [x] **Sistema de economía** — wallets, daily, gamble, slot, tienda, leaderboard
- [x] **Sistema de niveles** — XP por mensaje + rango/top
- [x] **Sistema de música** — cola, loop, pause/resume (@discordjs/voice + play-dl + ffmpeg en Docker)
- [x] **Tickets + privados + giveaways** — botones con deferUpdate, reanudación al reiniciar
- [x] **Bot lists** — top.gg AutoPoster + DBL posting + webhook de votos
- [x] **Dashboard web OAuth** — login Discord, `/dashboard`, configuración por servidor, API propia
- [x] **Env vars Vercel** — DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET, NEXT_PUBLIC_SITE_URL
- [x] **Docker** — ffmpeg + python3 + make + g++ añadidos (música)
- [x] **Bot v3.2.0 en línea** — 2 guilds, heartbeat Supabase OK

## Pendientes de la sesión (2 ago 2026)

- [ ] **Verificar la app de Discord (Verified App)** — esperar a que Stripe confirme la verificación de identidad del usuario (pendiente en Discord Developer Portal)
