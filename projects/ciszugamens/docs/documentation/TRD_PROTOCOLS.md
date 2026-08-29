# TRD_PROTOCOLS — Technical Requirements Document (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: TRD_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Requisitos técnicos detallados para la implementación de la landing web de CiszuGamens.

## 1. Stack técnico

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| Framework | Next.js | 15.x (App Router) | SSR/SSG, React 18, Turbopack |
| Lenguaje | TypeScript | 5.x | Tipado estricto, DX |
| Estilos | Tailwind CSS | 4.x | Utility-first, tokens globales |
| Package Manager | pnpm | 10.x | Workspaces, hoisting controlado |
| CDN | Supabase Storage | — | `ciszu-cdn` bucket, global |
| Hosting | Vercel | — | Edge, preview deployments |
| CI/CD | GitHub Actions | — | Lint, typecheck, build, deploy |

## 2. Estructura del proyecto (website/)

```
projects/ciszugamens/website/
├── public/
│   ├── docs/                    # Docs sincronizados (txt/md/docx/pdf)
│   ├── robots.txt               # Generado (robots.ts)
│   └── favicon.ico              # Desde isotipo
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout + providers
│   │   ├── page.tsx             # Landing (hero, features, stats, events, CTA)
│   │   ├── globals.css          # Tailwind + tokens globales
│   │   ├── robots.ts            # robots.txt dinámico
│   │   ├── sitemap.ts           # sitemap.xml dinámico
│   │   ├── api/
│   │   │   └── discord/         # Proxy widget miembros (opcional)
│   │   └── components/          # Componentes de la landing
│   ├── components/
│   │   ├── ui/                  # Componentes base (Button, Card, etc.)
│   │   ├── landing/             # Hero, Features, Stats, Events, CTA, Footer
│   │   └── providers/           # AdsProvider, ThemeProvider, ToastProvider
│   ├── config/
│   │   └── site.ts              # Config sitio (nombre, urls, colores)
│   ├── lib/
│   │   ├── utils.ts             # Utilidades (clsx, etc.)
│   │   └── cdn.ts               # AssetResolver helpers
│   ├── instrumentation.ts       # Sentry server
│   ├── instrumentation-client.ts # Sentry client
│   ├── sentry.edge.config.ts
│   ├── sentry.server.config.ts
│   ├── middleware.ts            # Security headers, CSP
│   └── robots.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.js
├── .prettierrc
└── vercel.json
```

## 3. Configuración Next.js

### next.config.js
```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/ciszu-cdn/**' }
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders() }
    ];
  },
};
```

### Security Headers (middleware.ts + next.config)
- CSP estricto: `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com`
- HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## 4. Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `NEXT_PUBLIC_CDN_URL` | `https://<project>.supabase.co/storage/v1/object/public/ciszu-cdn` | Sí |
| `NEXT_PUBLIC_SITE_URL` | `https://ciszugamens.vercel.app` | Sí |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Sí |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Sí |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-XXXXXXXXXXXXXXXX` | Opcional |
| `SUPABASE_URL` | Server-only | Deploy |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Deploy |

## 5. Componentes clave (landing)

| Componente | Props | Descripción |
|---|---|---|
| `Hero` | `videoBanner`, `ctaHref` | Video banner + CTA Discord |
| `Features` | `features[]` | Grid 3 columnas (Comunidad, Torneos, Rankings) |
| `Stats` | `memberCount`, `onlineCount` | Contadores live (API Discord opcional) |
| `Events` | `events[]` | Próximos torneos/fechas |
| `CTA` | `href`, `label` | Botón "Unirse al servidor" |
| `Footer` | — | Links ecosistema, legal, social |

## 6. Integración CDN

```typescript
// src/lib/cdn.ts
import { AssetResolver } from '@ciszunetwork/cdn';
export const cdn = new AssetResolver();

// Uso en componentes:
<Image src={cdn.resolve('projects/ciszugamens/content/banners/images/ciszugamens_video_banner.gif')} />
```

## 6. Integración Ads (source: ciszugamens)

```tsx
<AdsProvider site="ciszugamens" />
<AdFloat placement="corner" side="bottom-right" />
<AdPill placement="body" side="bottom-center" />
```

## 7. Analytics & Tracking

- **GA4**: `page_view`, `click_discord_invite`, `scroll_depth_90`, `video_play`
- **GTM**: Contenedor `GTM-XXXXXXX` (dataLayer para eventos custom)
- **AdSense**: `ca-pub-XXXXXXXXXXXXXXXX` (cuando aprobado)
- **Sentry**: DSN compartido, sampling 10%

## 8. Testing

| Tipo | Herramienta | Cobertura objetivo |
|---|---|---|
| Unit | Vitest | ≥ 80% utils/lib |
| Integration | Playwright | E2E: hero→CTA→Discord |
| Lint | ESLint | 0 errors, 0 warnings |
| Typecheck | tsc --noEmit | 0 errors |
| Lighthouse | CI | ≥ 90 Performance/Accessibility/SEO |

## 9. Despliegue (Vercel)

- **Project name**: `ciszugamens`
- **Root Directory**: `projects/ciszugamens/website`
- **Build Command**: `pnpm --filter ciszugamens-website build`
- **Output Directory**: `.next`
- **Env vars**: Configurar en Vercel Dashboard (Production + Preview)

---

_Última revisión: 29 ago 2026._