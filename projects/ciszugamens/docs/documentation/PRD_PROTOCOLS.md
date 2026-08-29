# PRD_PROTOCOLS — Product Requirements Document (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: PRD_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Requisitos de producto para CiszuGamens (comunidad gaming + servidor Discord + landing web). Define qué se construye, para quién y por qué.

## 1. Visión del producto

**CiszuGamens** es la comunidad gaming del ecosistema Ciszu Network. Un servidor Discord humano (sin bot propio) con landing web institucional, enfocado en gaming competitivo, torneos y comunidad hispanohablante.

**Objetivo principal**: Consolidar la comunidad gaming bajo la marca Ciszu Network, sirviendo como hub para jugadores, torneos y contenido gaming.

**Usuario objetivo**: Gamers hispanohablantes (14+), competitivos y casuales, interesados en Discord, torneos, rankings y comunidad.

## 2. Alcance (MVP - Landing Web)

| Funcionalidad | Prioridad | Estado |
|---|---|---|
| Hero con video banner + CTA a Discord | P0 | 🚧 Pendiente |
| Sección "Sobre CiszuGamens" | P0 | 🚧 Pendiente |
| Estadísticas servidor (miembros, online) | P1 | 🚧 Pendiente |
| Próximos eventos/torneos | P1 | 🚧 Pendiente |
| Botón "Unirse al servidor" (invite) | P0 | 🚧 Pendiente |
| Footer con links ecosistema | P0 | 🚧 Pendiente |
| SEO básico (meta, OG, sitemap) | P1 | 🚧 Pendiente |
| Analytics (GA4 + GTM) | P1 | 🚧 Pendiente |

## 3. Fuera de alcance (v1)

- Bot de Discord propio
- Dashboard de usuario
- Sistema de ranking/web perfil jugador
- Tienda / monetización directa
- App móvil / Tauri

## 4. Requisitos funcionales

### RF-001: Landing Page
- **Descripción**: Single-page responsive con hero, features, stats, events, CTA
- **Criterio de aceptación**: Carga < 3s, Lighthouse ≥ 90, responsive mobile/desktop

### RF-002: Integración Discord
- **Descripción**: Botón "Unirse" → invite válido; widget miembros online (opcional)
- **Criterio**: Invite https://discord.gg/W3kMtMMj6E funcional

### RF-003: Assets CDN
- **Descripción**: Logos, banner video servidos desde `ciszu-cdn` (Supabase Storage)
- **Criterio**: `NEXT_PUBLIC_CDN_URL` resuelve assets correctamente

### RF-004: Analytics
- **Descripción**: GA4 + GTM + AdSense (cuando aprobado)
- **Criterio**: Eventos `page_view`, `click_discord_invite`, `scroll_depth`

## 4. Requisitos no funcionales

| Requisito | Especificación |
|---|---|
| **Performance** | LCP < 2.5s, TBT < 200ms, CLS < 0.1 |
| **Accesibilidad** | WCAG 2.1 AA (contraste, focus visible, alt text) |
| **SEO** | Meta tags, Open Graph, Twitter Card, sitemap.xml, robots.txt |
| **Seguridad** | CSP estricto, HSTS, X-Frame-Options, Referrer-Policy |
| **Privacidad** | Cookies solo esenciales + analytics (consentimiento) |

## 5. Métricas de éxito (KPIs)

| KPI | Target v1 |
|---|---|
| Miembros Discord | +10% mensual |
| CTR botón "Unirse" | ≥ 3% |
| Tiempo en landing | > 60s |
| Core Web Vitals | Verde (LCP/CLS/FID) |

## 5. Dependencias

- `projects/ciszu/docs/documentation/CDN_SYSTEM.md` — Assets
- `projects/ciszu/docs/documentation/GOOGLE_SYSTEM.md` — GA4/GTM/AdSense
- `projects/ciszu/docs/documentation/AD_SYSTEM.md` — Anuncios (source ciszugamens)

## 5. Criterios de lanzamiento (Definition of Done)

- [ ] Landing desplegada en Vercel (proyecto `ciszugamens`)
- [ ] GA4/GTM disparando eventos
- [ ] Assets cargando desde CDN
- [ ] Lighthouse ≥ 90 en todas las categorías
- [ ] DNS configurado (ciszugamens.vercel.app o dominio propio)

---

_Última revisión: 29 ago 2026._