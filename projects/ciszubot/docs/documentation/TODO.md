# To Do List — CiszuBot

> Este archivo solo puede ser editado por Ciszuko Antony.

## Prioridad Alta

- [ ] **CDN Migration**: Migrar assets multimedia del bot a Supabase Storage
- [ ] **Registrar callback OAuth en Discord Developer Portal**: `https://ciszubot.vercel.app/api/auth/discord/callback` + guardar `DISCORD_CLIENT_SECRET` (Vercel + `.env.local`) — necesario para el dashboard
- [ ] **Subir comandos a bot lists**: `TOP_GG_TOKEN` y `DISCORDBOTLIST_TOKEN` en `.env` del bot (código listo: AutoPoster + DBL posting cada 30 min + webhook `/api/votes` recompensa 500 monedas)
- [ ] **Configurar hosting** para el bot (VPS o similar, 24/7) — ver `VPS_PLAN.md`

## Prioridad Media

- [ ] Más comandos: eventos, sorteos avanzados, economías por guild

## Pendientes de la sesión (2 ago 2026)

- [ ] **Verificar la app de Discord (Verified App)** — esperar a que Stripe confirme la verificación de identidad del usuario (pendiente en Discord Developer Portal)

## Widgets (mejora futura — 12 ago 2026)

- [ ] **Sentry feedback a página dedicada**: mover el widget "Reportar un problema" (botón flotante, a veces tapa UI) a una página/sección propia con estética del sitio y soporte de traducciones (hoy textos configurables sin i18n automático). Ver `ERRORS_SYSTEM.md` §8 (repo raíz).
- [ ] **Botón "Instalar PDWA" a página dedicada**: el fab flotante inferior-izquierda pasará a una página de instalación/ayuda (depende: decidir por sitio).
