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

