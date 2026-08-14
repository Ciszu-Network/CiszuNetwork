# FRONTEND_SYSTEM — Sistema de Frontend de los Proyectos (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: FRONTEND_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta el **frontend** (lado cliente: componentes, estilos,
> navegación, estado, SEO, PWA) de los proyectos de Ciszu Network: qué tecnologías se usan,
> cómo se estructuran las webs, cómo se comparte UI entre apps y cómo se sirven los assets.

---

## 1. Visión general del frontend

| Capa | Tecnología | Descripción |
|---|---|---|
| **Framework web** | Next.js 15 (App Router) | Las 4 webs |
| **UI/React** | React 19.x + `@ciszu/ui` | Componentes compartidos |
| **Estilos** | Tailwind CSS v4 (`@theme`) | Tokens y utilidades |
| **Desktop** | Tauri 2.x (Rust + WebView) | MuzicMania desktop |
| **Iconos** | `@ciszu/ui` (`Icon`) | SVGs inline desde registry |
| **Assets** | `@ciszunetwork/cdn` | Imágenes, skins, audio |
| **Analítica** | PostHog (Web) | Eventos de producto |

## 2. Las 4 webs

| Web | Paquete (pnpm) | URL (Vercel) | Rol |
|---|---|---|---|
| **CiszuNetwork** | `ciszunetwork-website` | `ciszunetwork.vercel.app` | Marca y ecosistema |
| **CiszukoAntony** | `ciszukoantony-website` | `ciszukoantony.vercel.app` | Portfolio personal |
| **MuzicMania** | `muzicmania-website` | `muzicmania.vercel.app` | Juego de ritmo |
| **CiszuBot** | `ciszubot-website` | `ciszubot.vercel.app` | Landing del bot |

- Las 4 usan **el mismo stack** (Next 15 + Tailwind 4 + App Router) y **el mismo layout
  maestro** (logo, nav, hamburguesa, buscador, zona de cuentas, footer).
- Los assets se sirven vía **resolver/CDN** (`@ciszunetwork/cdn`); `public/` solo para
  docs/pwa/sw.js.

## 3. Estructura App Router

Cada web sigue la misma estructura base:

```
src/app/
├── layout.tsx          # layout raíz (nav, footer, metadata, manifest, guard)
├── globals.css         # @theme + estilos globales
├── page.tsx            # página principal
├── (secciones)/        # rutas agrupadas
├── api/                # API routes (serverless)
├── feedback/           # página Feedback (4 webs)
├── descargas/          # sección Descargas (PDWA)
└── sw.js / manifest    # PWA
```

### 3.1 Convenciones de componentes

- **Server Components por defecto** (sin `'use client'`): datos, layouts, contenido.
- **Client Components** solo con interactividad: `'use client'` al inicio del archivo.
- `metadata` export en layouts/pages para SEO (títulos `SITE | SECCIÓN`).
- Hooks propios tipados; `usePageTitle` en ciszukoantony/muzicmania.

## 4. Componentes compartidos (`@ciszu/ui`)

| Componente | Función |
|---|---|
| `<Icon name="..." />` | Icono SVG inline (registry) |
| `<SmartImage ... />` | Imagen optimizada desde CDN |
| `<FabStack ... />` | Botones flotantes apilados (PDWA + reportar) |
| `<InstallPdwaButton />` | Instalación PWA por navegador |
| `<Guard>` / IAST | Protección por página |

- Paquetes compartidos viven en `packages/`: `@ciszu/ui`, `@ciszunetwork/cdn`,
  `@ciszunetwork/utils`, `@ciszunetwork/email`, `@ciszunetwork/payments`.
- Detalle de paquetes: `PACKAGES_SYSTEM.md` (crear).

## 5. Estilos y tokens

- **Tailwind v4** con tokens en `@theme` dentro de `globals.css` (sin config JS).
- Tokens de color: `--color-brand*`, `--color-neon-*`, `--color-bg-*`, `--shadow-*`.
- Reglas completas: `STYLES_SYSTEM.md` y `COLOR_SYSTEM.md`.
- Fuentes auto-hospedadas en `public/fonts/*.woff2` con `@font-face`.

## 6. Iconos

- Fuente única: `shared/icons/**` (SVG, espejo CDN).
- Registry generado por `scripts/generate-icon-registry.js`.
- Uso: `<Icon name="..." />`; nunca mezclar lucide-react con `@ciszu/ui`.
- Detalle: `ICON_SYSTEM.md`.

## 7. Navegación y estado

- Config de navegación por web: `src/config/navigation.tsx` (o equivalente).
- Menú móvil (hamburguesa) en las 4 webs; sub-links con iconos.
- Sistema de idiomas y tema (toggle) sincronizado en layouts.
- Buscador (`SEARCH_PAGES`) en ciszunetwork/ciszubot/muzicmania/ciszukoantony.
- Zona de cuentas: icono de autenticación (Discord OAuth, futuro otros).

### 7.1 Estado global con Zustand

- **Zustand v5** (`^5.0.14`) es el gestor de estado global en **ciszunetwork y muzicmania**
  (`package.json` de ambas webs); ciszukoantony/ciszubot aún no lo instalan.
- Los stores viven en `src/store/useAppStore.ts` (un solo hook por web).
- Forma canónica: `create<AppState>((set, get) => ({ ... }))`; acciones con `set({})`,
  lectura de estado compuesto con `get()`.

```ts
// ciszunetwork — src/store/useAppStore.ts
import { create } from 'zustand';
interface AppState {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (val: 'dark' | 'light') => void;
  language: 'es' | 'en';
  setLanguage: (val: 'es' | 'en') => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}
export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  theme: 'dark',
  setTheme: (val) => set({ theme: val }),
  language: 'es',
  setLanguage: (val) => set({ language: val }),
  searchQuery: '',
  setSearchQuery: (val) => set({ searchQuery: val }),
}));
```

- Uso en componentes: `const { theme, setTheme } = useAppStore();` — selección por
  propiedad evita re-renderizados por estado ajeno.
- Estado global típico: menú, tema, idioma, búsqueda, session/UI de audio (muzicmania),
  cookies aceptadas.
- **Reglas**:
  - Zustand es solo **estado de UI/usuarios**, no cache de datos (eso es `@ciszunetwork/cdn`
    + caché del servidor en `ciszu.cache`). Ver `CACHING_SYSTEM.md`.
  - No duplicar estado que ya vive en URL (`useSearchParams`) o servidor (RSC).
  - Persistencia a `localStorage` (p.ej. volúmenes, idioma): se puede hacer a mano con
    `set` + `localStorage.setItem`, o con `persist` middleware si se estandariza.
  - Un store por dominio de UI; si un store crece mucho, dividir (KISS — ver
    `CODE_PRINCIPLES_PROTOCOLS.md`).

### 7.2 Middleware de Next.js (capa de seguridad Edge)

- **Las 4 webs** tienen `src/middleware.ts` implementando la capa de seguridad de borde.
- Se ejecuta antes de cada request (según `matcher`) en el runtime Edge de Vercel.
- Funciones del paquete `@ciszunetwork/utils`: `buildCsp()` genera CSP por web con
  fuentes extra; `createIast('<nombre-web>')` crea el sensor IAST runtime.

```ts
// ciszunetwork — src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createIast, buildCsp } from '@ciszunetwork/utils';

const iast = createIast('ciszunetwork');

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', buildCsp({ /* fuentes extra por web */ }));

  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => { params[k] = v; });
  iast.observe(request.method, request.nextUrl.pathname, params);

  return response;
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|sitemap.xml|robots.txt|images|icons|audio|logos|fonts).*)'],
};
```

- **Qué hace**: cabeceras de seguridad HTTP (nosniff, referrer, HSTS, CSP) + sensor IAST
  (detecta payloads maliciosos en query, solo observa — emite `[IAST]` a logs Vercel con
  dedupe 5 min, ver `SECURITY_PROTOCOLS.md`).
- `matcher` excluye `_next`, static assets y fuentes para no parchear respuestas de assets.
- CSP debe listar las fuentes externas que usa cada web (widgets Trustpilot, NOWPayments,
  `wss://<proyecto>.supabase.co` para realtime).
- `X-Frame-Options` **no** se pone en muzicmania (permite preview de Vercel Dashboard);
  el CSP `frame-ancestors` puede cubrirlo si hace falta.
- **Limite**: el middleware **no** gestiona sesiones ni protege rutas (las webs usan
  `localStorage` en client; la autenticación se maneja en el cliente con Zustand + AuthProvider).
  No añadir redirects de auth al middleware salvo migrar a cookies SSR de Supabase.

### 7.3 Herramientas client/validación (decisiones 14 ago 2026)

| Herramienta | Estado | Rol / decisión |
|---|---|---|
| **Zod** | Integrado en `@ciszunetwork/utils` | Validación de inputs en el borde (API routes, formularios). Esquemas reutilizables (`turnstileTokenSchema`, `contactMessageSchema`, ...). Aplicado con `parseJsonBody` a todas las mutantes (`dashboard`, `resolve-username`, `invoice`). Se amplía con `drizzle-zod`. |
| **RSC (Server Components)** | Ya en uso | Render + lecturas de datos en servidor (async, directo a Drizzle/Supabase). Sin red en el cliente. |
| **Server Actions** | **Decidido (14 ago 2026) — YAGNI por ahora** | Evaluado en F3: formularios actuales son `mailto:` cliente (feedback/soporte) o ya validan vía API route (dashboard). No hay vacío real para `'use server'` hoy. Adoptar en formularios nuevos que reporten a servidor, con rate limit + Turnstile server-side. |
| **Storybook** | **Añadido (F3, dev-only)** en `@ciszu/ui` v10.5.8 | Documenta los componentes compartidos (Icon, SmartImage) con visual regression. Scripts `storybook`/`build-storybook`; sin runtime en prod. |
| **Chromatic** | **Añadido (F4, dev-only)** en `@ciszu/ui` (CLI 18.2) | Visual testing alojado de las stories. Build 1 publicado (14 ago 2026, 5 stories/2 componentes). Token `CHROMATIC_PROJECT_TOKEN` en vault; script `chromatic`. |
| **TanStack Query** | **Añadido (F3)** en `ciszubot-website` | Caché/refetch de datos client dinámicos. `QueryProvider` en el layout raíz; dashboard guild usa `useQuery`/`useMutation`. Extender a las demás webs cuando exista feature. |
| **tRPC / GraphQL** | **No instalar** | Solapan con RSC + Server Actions + PostgREST. Quedan como opción con disparador (API pública / multi-cliente / servicio standalone grande). Ver `BACKEND_SYSTEM.md` §20. |

- **Regla general**: nada se instala "de base sin uso" (deuda). Se instala cuando el problema
  existe; los descartados no bloquean el futuro.
- Validación Server Actions: todo formulario nuevo valida con Zod en `@ciszunetwork/utils`
  antes de mutar (ver `SECURITY_PROTOCOLS.md`).

## 8. Seguridad en el frontend

- **Nunca** `dangerouslySetInnerHTML`/`innerHTML` con datos de usuario (XSS).
- `escapeHtml()`/`textContent` de `@ciszunetwork/utils`; DOMPurify solo si imprescindible.
- Turnstile (Cloudflare) en formularios; verificado server-side con rate limit.
- Cabeceras de seguridad + CSP (`buildCsp()`) en middleware (ver `SECURITY_PROTOCOLS.md`).
- `robots.ts`: allow `/`, disallow `/api/`.
- En client: solo **anon key**; `service_role` jamás en el cliente.

## 9. PWA y distribuciones

- Las 4 webs tienen **Descargas (PDWA)** + página **Feedback**.
- `InstallPdwaButton`: nativo para Chrome/Chromium/Edge; alternativas por navegador.
- `FabStack` con animaciones de entrada/salida apiladas (X cierra + aviso de reactivación).
- Tauri (MuzicMania): build de escritorio con instaladores NSIS.
- Detalle: `INSTALLERS_SYSTEM.md`.

## 10. SEO

| Aspecto | Práctica |
|---|---|
| **Títulos** | `SITE | SECCIÓN` (metadata server / `usePageTitle`) |
| **metadata** | Export en layouts/pages; descripción + keywords |
| **OpenGraph** | Imagen + título + descripción por página |
| **Sitemap/robots** | `sitemap.ts` / `robots.ts` |
| **Alt text** | Obligatorio en imágenes |
| **Semántica** | `h1` único, jerarquía correcta, landmarks |

## 11. Rendimiento

| Práctica | Detalle |
|---|---|
| **Server Components** | Menos JS en cliente |
| **Imágenes CDN** | `SmartImage` + resolver (lazy, webp) |
| **Fuentes locales** | Sin peticiones a Google Fonts en runtime |
| **SVGs inline** | Iconos sin requests extra |
| **Build estático** | `output` / ISR donde aplica |

## 12. Reglas del frontend

| Regla | Descripción |
|---|---|
| **Next 15 obligatorio** | No mezclar frameworks web (Vite/Remix) |
| **Tailwind v4** | Tokens en `@theme`; sin CSS modules salvo excepción |
| **`@ciszu/ui` para UI** | No duplicar componentes; reutilizar paquetes |
| **Sin inline styles** | Color/estilo vía clases y tokens |
| **Assets vía CDN** | No duplicar en `public/` |
| **XSS cero** | Nunca innerHTML con datos de usuario |
| **Server > client** | Solo client lo imprescindible |
| **Verificación externa** | Curl a prod + Playwright (smoke/security) |

## 13. Checklist de implementación frontend

- [ ] Componente en el nivel correcto (app / `packages/ui`).
- [ ] `'use client'` solo donde hace falta.
- [ ] Tokens del `@theme` para color/fuente/sombra.
- [ ] `<Icon />` para iconos, `SmartImage` para imágenes.
- [ ] `aria-label`/`title` en controles; `aria-hidden` en decorativos.
- [ ] Responsive (móvil + desktop) verificado.
- [ ] Contraste AA donde aplica.
- [ ] `metadata` correcto (título `SITE | SECCIÓN`).
- [ ] Sin innerHTML inseguro; XSS safe.
- [ ] Build + lint + test OK.

## 14. Conceptos frontend (contexto informático)

| Concepto | Definición |
|---|---|
| **Frontend** | Parte cliente: lo que ve el usuario en el navegador |
| **Componente** | Bloque de UI reutilizable |
| **Server Component** | Componente renderizado en servidor (sin JS cliente) |
| **Client Component** | Componente con interactividad en el navegador |
| **SSR/SSG/ISR** | Renderizado en servidor / estático / revalidado |
| **App Router** | Sistema de rutas por carpetas de Next.js |
| **Layout** | Estructura compartida entre páginas |
| **Metadata** | Datos SEO de la página (title, description) |
| **Manifest** | Configuración de la PWA (nombre, iconos) |
| **Service Worker** | Script que controla caché y offline |
| **PDWA** | Progressive Web App instalable |
| **Token (design token)** | Variable de diseño (color, fuente, sombra) |
| **Responsive** | Adaptar el layout al tamaño de pantalla |
| **Breakpoint** | Punto de corte del diseño |
| **Hydration** | Activar interactividad en el cliente |

## 15. Componentes por web (patrones)

| Web | Componentes clave |
|---|---|
| **ciszunetwork** | Hero + logotipo, navbar, footer multi-columna, CTA |
| **ciszukoantony** | Hero con isotipo, canal YouTube, portfolio, medios |
| **muzicmania** | Juego (ritmo), scores, skins, comunidad |
| **ciszubot** | Landing del bot, estado en vivo, invite, donaciones |

## 16. Ciclo de vida de una página nueva

1. Crear la ruta en `src/app/`.
2. Añadir `metadata` (título `SITE | SECCIÓN`).
3. Construir con componentes de `@ciszu/ui`.
4. Añadir a la navegación si aplica (config de nav + buscador).
5. Verificar responsive, SEO, seguridad (guard/IAST).
6. Build + lint + test + verificación externa.

## 17. Monitoreo del frontend

| Fuente | Qué vigilar |
|---|---|
| Vercel | Builds, deploys, funciones edge |
| UptimeRobot | Disponibilidad de las 4 webs |
| Sentry | Errores en runtime (front/edge) |
| PostHog | Eventos de producto y métricas de uso |
| Playwright security-e2e | Cabeceras, CSP, IAST, paths |

## 18. Resumen ejecutivo

- Frontend = **Next.js 15 (App Router) + React 19 + Tailwind v4** en las 4 webs, con
  **`@ciszu/ui`** como librería compartida de componentes.
- Estructura uniforme: layout maestro (logo, nav, hamburguesa, buscador, cuentas, footer),
  PWA (PDWA) y página Feedback en las 4.
- Estilos con **tokens en `@theme`** (brand + neon); assets servidos por **CDN**.
- Seguridad: XSS cero, Turnstile + rate limit, CSP/IAST en middleware.
- Toda página nueva pasa por el checklist de calidad y verificación externa.

_Última revisión: 13 ago 2026._ Relacionado: `BACKEND_SYSTEM.md`, `FRAMEWORKS_SYSTEM.md`,
`STYLES_SYSTEM.md`, `COLOR_SYSTEM.md`, `ICON_SYSTEM.md`, `PACKAGES_SYSTEM.md` (crear),
`INSTALLERS_SYSTEM.md`, `FULL_STACK_SYSTEM.md`, `SECURITY_PROTOCOLS.md`.

