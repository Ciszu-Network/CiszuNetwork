# BUSINESS_STRATEGY — Estrategias (marketing, empresarial, relaciones)

Marco estratégico de Ciszu Network (ago 2026). Enfoque: empresa unipersonal con 4 productos, sin presupuesto de ads, apalancada en redes y comunidad.

## Estrategia de producto (por mercado)

| Producto | Estrategia | Canal de adquisición |
| -------- | ---------- | -------------------- |
| **MuzicMania** | Freemium, juego de ritmo con música propia (tracks gene-IA) | top.gg/DBL, Discord, TikTok (gameplay) |
| **CiszuBot** | Bot gratuito + monetización por comunidad (economía, niveles, música) | Discord App Directory, invitación en webs, top.gg/DBL |
| **CiszukoAntony** | Portfolio personal → atracción de colaboradores/clientes | LinkedIn, IG, redes |
| **CiszuNetwork** | HUB de marca → navegación a productos | Todas las redes (hub CDC) |

## Estrategia de marketing (orgánico, sin ads)

- **Contenido en redes**: TikTok/Instagram para gameplay (MuzicMania) y arte/música; X/LinkedIn para la marca/negocio/portfolio.
- **Transmedia**: mismo universo neon (cian/rosa, Geomanist) en todas las webs y redes → reconocimiento de marca.
- **Comunidad**: Discord Lounge como hub central (invite oficial `W3kMtMMj6E`), moderación con rangos (ver `BUSINESS_STRUCTURE.md`), eventos y rewards.
- **Bot lists**: top.gg + DBL con auto-post cada 30 min (recompensa por votar 500 monedas, webhook de votos en `statsServer`).
- **SEO**: robots.ts/robots.txt por web (allow `/`, disallow `/api/`), metadata completa, `NEXT_PUBLIC_SITE_URL` para OAuth; estructural.

## Estrategia empresarial

- **Fase 0 legal sin costo** (RIF persona natural, SENIAT, WhatsApp) — ver `COMPANY_REGISTRATION_PLAN.md`.
- **Monetización**: NOWPayments (invoices crypto) + donaciones (métodos env `DONATE_*`); madurar a LLC/18 años (ver `PAYMENTS_SYSTEM.md`, `INTERNATIONAL_LLC_GUIDE.md`).
- **Costo controlado**: Free tiers (Supabase 1 GB, Vercel Hobby, Cloudflare Fase A gratis, UptimeRobot 50 monitores, PostHog 1M eventos) — ver `ONLINE_SERVICES.md`.
- **Retención de usuario**: sistema de niveles/XP en el bot, leaderboard de MuzicMania, rewards por votos.

## Estrategia de relaciones

- **Alianzas**: con youtubers/streamers de música y gaming latino; servidores de Discord para integración del bot (canales por servidor).
- **Colaboraciones**: artistas/música (música propia generada), diseñadores; open-soruce visible en GitHub (`Ciszu-Network`).
- **Comunidad primero**: soporte en Discord + WhatsApp (wa.me/584126858111) + email (fplayersoffcial@gmail.com).

## Métricas y decisiones (ver `ANALYTICS_POSTHOG.md`, `STATISTICS.md`)

- KPIs: eventos PostHog (~1M free), visitas (Web Analytics), votos top.gg/DBL (cntadores `ciszu.counters`), récords/scores MuzicMania, crecimiento de servidores del bot (heartbeat `bot_status.guilds`).
- Revisar trimestralmente para decidir dónde invertir tiempo; 0 ads hasta tener datos suficientes.

_Última revisión: 11 ago 2026._