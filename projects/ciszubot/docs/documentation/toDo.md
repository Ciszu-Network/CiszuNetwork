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

## Pendientes de la sesión (2 ago 2026)

- [ ] **Verificar la app de Discord (Verified App)** — esperar a que Stripe confirme la verificación de identidad del usuario (pendiente en Discord Developer Portal)
