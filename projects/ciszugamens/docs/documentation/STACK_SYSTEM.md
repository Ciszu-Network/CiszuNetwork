# STACK_SYSTEM — Pila Tecnológica (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: STACK_SYSTEM_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Pila tecnológica completa del proyecto CiszuGamens por capas, versiones y criterios de selección.

## Capas

### Frontend (Landing Web)

| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 15.x (App Router) | Framework React SSR/SSG para landing |
| **React** | 18.x | UI components |
| **TypeScript** | 5.x | Tipado estático estricto |
| **Tailwind CSS** | 4.x | Utility-first styling (config global en `@ciszu/ui`) |
| **pnpm** | 10.x | Package manager monorepo |

### Backend / Infraestructura

| Tecnología | Versión | Uso |
|---|---|---|
| **Supabase** | — | Postgres + Auth + Storage (CDN `ciszu-cdn`) |
| **Vercel** | — | Hosting landing + edge functions |
| **GitHub Actions** | — | CI/CD (lint, typecheck, build, deploy) |

### Discord (Comunidad)

| Tecnología | Versión | Uso |
|---|---|---|
| **Discord.js** | 14.x | Solo si se añade bot auxiliar futuro |
| **Discord API** | v10 | Roles, invites, webhooks para anuncios |

### Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| **ESLint** | Linting (config monorepo) |
| **Prettier** | Formateo |
| **Playwright** | E2E tests (si aplica) |
| **Sentry** | Error tracking (compartido) |
| **PostHog** | Analytics (compartido) |

## Dependencias compartidas (monorepo)

| Paquete | Uso en CiszuGamens |
|---|---|
| `@ciszu/ui` | Componentes UI, Ads.tsx, Icon, Modal, Toast, GoogleScripts |
| `@ciszunetwork/cdn` | `AssetResolver`, `resolveIcon` para logos/banners |
| `@ciszunetwork/utils` | `createRateLimiter`, `buildCsp`, `escapeHtml` (server-only) |
| `@ciszunetwork/config` | Configuración compartida (site config, env) |

## Criterios de selección

1. **Consistencia**: Mismo stack que Ciszu Network / CiszuBot / MuzicMania
2. **CDN-first**: Assets en Supabase Storage, nunca en `public/`
3. **TypeScript estricto**: `strict: true`, no `any`
4. **Tailwind v4**: Config global vía `@ciszu/ui` (tokens, colores, fuentes)
5. **pnpm workspaces**: Dependencias hoisted solo donde se usan

## Variables de entorno (landing)

| Variable | Descripción | Requerida |
|---|---|---|
| `NEXT_PUBLIC_CDN_URL` | URL base CDN Supabase | Sí |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID | Sí (GA4/AdSense) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | GA4 Measurement ID | Sí |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID | Opcional |
| `SUPABASE_URL` | Supabase project URL | Server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Server-only (deploy) |

## Scripts pnpm (desde raíz)

```bash
pnpm --filter ciszugamens-website dev    # Dev server (puerto 3004)
pnpm --filter ciszugamens-website build  # Build producción
pnpm --filter ciszugamens-website lint   # ESLint
pnpm cdn:upload                          # Sube assets a CDN
```

---

_Última revisión: 29 ago 2026._