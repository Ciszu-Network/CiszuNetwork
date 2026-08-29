# WORKFLOW_APP_PROTOCOLS — Workflow de la Aplicación (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: WORKFLOW_APP_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Workflow de usuario por página/landing/sitemap y disparadores GitHub para CiszuGamens. Complementa `WORKFLOW_SYSTEM.md` (operación diaria) y `GLOBAL_SYSTEM.md` (ciszu).

## 1. Sitemap y flujo de usuario

```
┌─────────────────────────────────────────────────────────────┐
│                        LANDING (/)                          │
│  Hero (video banner + CTA Discord)                          │
│  Features (3 cards) → Stats (live) → Events (próximos)      │
│  CTA Footer → Discord Invite                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DISCORD SERVER (externo)                  │
│  #reglas → ✅ Verificado → Canales principales              │
│  #anuncios, #general, #torneos, #media, #soporte           │
└─────────────────────────────────────────────────────────────┘
```

## 2. Páginas y componentes

| Ruta | Componente | Estado | Datos | Interacciones |
|---|---|---|---|---|
| `/` | `page.tsx` (Landing) | 🚧 | `siteConfig`, `events[]`, `stats` | Click CTA → Discord, Scroll tracking |
| `/robots.txt` | `robots.ts` | ✅ | `siteConfig` | — |
| `/sitemap.xml` | `sitemap.ts` | 🚧 | `siteConfig` | — |

## 3. Disparadores GitHub Actions

| Workflow | Trigger | Jobs |
|---|---|---|
| `deploy-ciszugamens-website.yml` | `push` a `main` (paths: `projects/ciszugamens/website/**`) | lint → typecheck → build → deploy Vercel |
| `cdn-upload.yml` | `push` a `main` (paths: `projects/ciszugamens/content/**`) | `pnpm cdn:upload` |
| `docs-sync.yml` | `push` a `main` (paths: `projects/ciszugamens/docs/**`) | `pnpm docs:sync` |
| `globaldocsgen.yml` | `push` a `main` (paths: `scripts/globaldocsgen.js`, `projects/ciszu/docs/documentation/**`) | `node scripts/globaldocsgen.js` |

## 4. Flujo de datos por interacción

| Acción usuario | Evento GA4 | DataLayer (GTM) | Side effects |
|---|---|---|---|
| Carga landing | `page_view` | `{page: 'landing'}` | — |
| Click "Unirse a Discord" | `click_discord_invite` | `{event: 'discord_invite', method: 'hero_cta'}` | `window.open(invite)` |
| Click "Unirse" (footer) | `click_discord_invite` | `{event: 'discord_invite', method: 'footer_cta'}` | `window.open(invite)` |
| Scroll 90% | `scroll_depth_90` | `{event: 'scroll', depth: 90}` | — |
| Play video banner | `video_play` | `{event: 'video', action: 'play'}` | — |
| Hover feature card | — | — | Animación scale |

## 5. Estados de la UI

| Componente | Estados | Transiciones |
|---|---|---|
| Hero video | `loading` → `playing` → `paused` | Autoplay muted → click unmute |
| CTA Button | `idle` → `hover` → `focus` → `active` | CSS + focus-visible |
| Stats counter | `loading` → `loaded` → `error` | Fetch API Discord (opcional) |
| Events list | `empty` → `loaded` → `error` | Static JSON → API futura |

## 6. Accesibilidad (WCAG 2.1 AA)

- **Contraste**: ≥ 4.5:1 (texto), ≥ 3:1 (UI)
- **Focus visible**: Anillo `outline: 2px solid #22d3ee` en `:focus-visible`
- **Alt text**: Todos los assets (`video_banner.gif`, logos)
- **ARIA**: `aria-label` en botones icono, `role="button"` en CTA
- **Navegación teclado**: Tab order lógico, skip link

## 7. SEO Técnico

| Elemento | Implementación |
|---|---|
| `robots.txt` | `robots.ts` → `Allow: /`, `Disallow: /api/` |
| `sitemap.xml` | `sitemap.ts` → URLs estáticas + dinámicas |
| Meta tags | `metadata` export en `layout.tsx` + `page.tsx` |
| Open Graph | `og:title`, `og:description`, `og:image` (video banner) |
| Twitter Card | `summary_large_image` con video banner |
| Canonical | `<link rel="canonical" href={siteUrl}>` |
| JSON-LD | `Organization` + `WebSite` schema |

## 8. Performance Budget

| Métrica | Target | Herramienta |
|---|---|---|
| LCP | < 2.5s | Lighthouse / Web Vitals |
| CLS | < 0.1 | Lighthouse |
| TBT | < 200ms | Lighthouse |
| JS Bundle | < 150KB gz | `next build` analyze |
| CSS | < 50KB gz | `next build` analyze |
| Imágenes | WebP/AVIF, sizes | `next/image` + CDN |

---

_Última revisión: 29 ago 2026._