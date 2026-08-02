# To Do List — CiszuBot

> Este archivo solo puede ser editado por Ciszuko Antony.

## Prioridad Alta

- [ ] **Registrar callback OAuth en Discord Developer Portal**: `https://ciszubot.vercel.app/api/auth/discord/callback` (OAuth2 → Redirects) — ya configurados `DISCORD_CLIENT_SECRET` y `DISCORD_CLIENT_ID` (sin BOM, fallback hardcodeado) en Vercel + `.env.local`; sin el redirect el login falla al volver de Discord
- [ ] **Subir comandos a bot lists**: `TOP_GG_TOKEN` y `DISCORDBOTLIST_TOKEN` en `.env` del bot (código listo: AutoPoster + DBL posting cada 30 min + webhooks `/api/votes` y `/api/votes/dbl` con 500 monedas)
- [ ] **Webhook de votos DBL**: pegar la URL del bot (`https://<host>:5000/api/votes/dbl`) en el panel de DiscordBotList, copiar el secret generado a `DBL_WEBHOOK_SECRET` en `.env` del bot y reiniciar el contenedor (el endpoint ya está en el código, se activa al configurar la var)
- [ ] **Configurar hosting** para el bot (VPS 24/7) — ver `VPS_247.md` (Oracle Free Tier recomendado, requiere cuenta del usuario)
- [ ] **CDN Migration**: Migrar assets multimedia del bot a Supabase Storage

## Prioridad Media

- [ ] **BUG iconos en navbar (documentado, sin arreglar)**: al inicio los iconos se muestran (SSR inline), pero al rato o al cambiar de página se pierden — consola: `shield.svg:1 404` y `gift.svg:1 404`. Datos: `gift` y `shield` SÍ están en `icon-registry.ts` (líneas ~137/142, SVGs Font Awesome) y los archivos `outline/*.svg` NO existen en `shared/icons/svg` (solo `filled`), pero el registry los tiene → la pérdida ocurre porque en navegación cliente `getIcon(style, name)` devuelve undefined (causa exacta por investigar: ¿style pedido distinto, hidratación del módulo client, o ICON_LIST con nombres sin archivo?) → cae al fallback CDN → el bucket `ciszu-cdn` tampoco tiene esos SVGs → 404. Ver `docs/ia_docs/ICON_SYSTEM.md` → sección "Bug conocido"
- [ ] **Invalidar caché de config del bot** desde el dashboard (hoy los cambios requieren reinicio del bot)
- [ ] **Más comandos**: eventos, sorteos avanzados, economías por guild
- [ ] **Dependabot moderate pendiente**: revisar `https://github.com/Ciszu-Network/CiszuNetwork/security/dependabot/12` (1 moderate nueva)

## Completado (2 ago 2026)

- [x] **Iconos inline en la web (fix "ningún icono carga")** — `money` y `music` añadidos a `shared/icons/svg` + registro regenerado (177 iconos, los 29 de la web inline). Fix SSR: DOMPurify no expone `sanitize` sin window → guard `typeof window === 'undefined'` en `Icon.tsx` (SVG propio) + `DOMPurify.sanitize` directo en cliente (semgrep CI limpio)
- [x] **Login OAuth arreglado** — `DISCORD_CLIENT_ID` en Vercel tenía BOM (`%EF%BB%BF`) que rompía el authorize → env var borrada, usa el fallback hardcodeado (client id es público)
- [x] **Webhook de votos DBL** — `POST /api/votes/dbl` con verificación `Authorization` y recompensa 500 monedas (`87afc72`)
- [x] **Migración 14 aplicada** — 13 tablas: guild_configs, wallets, transactions, shop_items, inventory, levels, warns, tickets, giveaways, afk, alliances, discord_users, snipes
- [x] **72 comandos en 9 categorías** — economía (10), música (7), moderación (8), configuración (10), niveles (2), social (5), diversión (text, avatar, snipe, afk, search, animal, minigames) + legado
- [x] **Sistema de economía** — wallets, daily, gamble, slot, tienda, leaderboard
- [x] **Sistema de niveles** — XP por mensaje + rango/top
- [x] **Sistema de música** — cola, loop, pause/resume (@discordjs/voice + play-dl + ffmpeg en Docker)
- [x] **Tickets + privados + giveaways** — botones con deferUpdate, reanudación al reiniciar
- [x] **Bot lists** — top.gg AutoPoster + DBL posting + webhooks de votos
- [x] **Dashboard web OAuth** — login Discord, `/dashboard`, configuración por servidor, API propia
- [x] **Env vars Vercel** — DISCORD_BOT_TOKEN, DISCORD_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET, NEXT_PUBLIC_SITE_URL
- [x] **Docker** — ffmpeg + python3 + make + g++ añadidos (música)
- [x] **Bot v3.2.0 en línea** — 2 guilds, heartbeat Supabase OK

## Pendientes de la sesión (2 ago 2026)

- [ ] **Verificar la app de Discord (Verified App)** — esperar a que Stripe confirme la verificación de identidad del usuario (pendiente en Discord Developer Portal)
