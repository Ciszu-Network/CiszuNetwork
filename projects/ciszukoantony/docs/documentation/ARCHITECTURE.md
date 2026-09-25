# ARCHITECTURE — Arquitectura del Portfolio (Ciszuko Antony)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: ARCHITECTURE_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta la estructura del portfolio de Ciszuko Antony
> (`ciszukoantony.vercel.app`): carpetas del proyecto, layout del website (Next.js 15),
> pipeline de documentación `txt → md → docx → pdf` y su relación con el ecosistema
> Ciszu Network.

---

## 1. Propósito y alcance

Este documento describe **cómo está montado** el proyecto `ciszukoantony`: dónde vive cada
cosa, qué hace cada carpeta, cómo se construye la web y cómo fluye la documentación desde el
texto plano hasta los formatos de publicación. Es el mapa de referencia para:

- Localizar código, contenido y documentación.
- Entender qué piezas se pueden tocar con seguridad.
- Integrar nuevas secciones o contenidos sin romper nada.
- Replicar el mismo patrón en otros proyectos del monorepo.

El alcance cubre la carpeta `projects/ciszukoantony/` y sus dependencias sobre los paquetes
compartidos (`@ciszu/ui`, `@ciszunetwork/cdn`, `@ciszunetwork/utils`).

## 2. Vista general del proyecto

```
projects/ciszukoantony/
├── website/                # Next.js 15 — Portfolio personal
│   ├── public/             # Assets públicos (docs/, pwa/, favicon)
│   └── src/                # Código fuente (app, components, config, lib)
├── content/                # Contenido de marca (logos, media) — servido vía CDN
├── musicboard/             # Contenido relacionado con música (albums/tracks)
├── docs/                   # Documentación del portfolio
│   ├── txt/                # Texto plano (fuente de verdad)
│   ├── md/                 # Markdown (generado de txt)
│   ├── docx/               # Word (generado de md)
│   ├── pdf/                # PDF (generado de md)
│   ├── obs/                # Configuración de OBS Studio (escenas)
│   └── documentation/      # Documentación para IA (esta carpeta)
└── package.json            # Workspace pnpm (ciszukoantony-website)
```

## 3. Descripción de carpetas

| Ruta | Qué contiene | Rol | ¿Toca el agente? |
|---|---|---|---|
| `website/src/app/` | Páginas (App Router) y rutas API | Código fuente de la web | Sí, con cuidado |
| `website/src/components/` | Componentes React (layout, RichText, FABs) | UI reutilizable | Sí |
| `website/src/config/` | Navegación, títulos, búsqueda | Config de frontend | Sí |
| `website/src/lib/` | Utilidades del lado del servidor/cliente | Lógica auxiliar | Sí |
| `website/src/middleware.ts` | Cabeceras de seguridad y CSP | Seguridad | Sí |
| `website/src/app/robots.ts` | Reglas de robots para `/api/` | SEO/seguridad | Sí |
| `website/public/` | Assets públicos servidos por Vercel | Estáticos | No (usar CDN) |
| `website/public/docs/` | Copia pública de la documentación (txt/md/docx/pdf) | Publicación | Automatizado |
| `content/` | Logos y media de marca | Assets de marca | No (gitignored en parte) |
| `musicboard/` | Contenido musical (albumes, tracks) | Contenido | Sí, si aplica |
| `docs/txt/` | Documentos en texto plano | **Fuente de verdad** | Solo editar fuente |
| `docs/md/` | Markdown generado desde txt | Derivado | Generado |
| `docs/docx/` | Word generado desde md | Derivado | Generado |
| `docs/pdf/` | PDF generado desde md | Derivado | Generado |
| `docs/obs/` | Configuración OBS (escenas juego/música) | Streaming | Manual |
| `docs/documentation/` | Documentación para agentes/IA | **Este sistema** | Sí |

### 3.1 Reglas de las carpetas derivadas

- `docs/md/`, `docs/docx/` y `docs/pdf/` se generan desde `docs/txt/`. No se editan a mano:
  si el contenido cambia, se cambia la fuente `txt` y se regenera (ver `WORKFLOW_SYSTEM.md`).
- Hay un subconjunto de archivos especiales (`GUIDELINES`, `RULES`, `ACTA`) que **no** se
  convierten a DOCX/PDF de forma automática: su composición es manual.
- `website/public/docs/` publica la documentación en la web; se regenera en el pipeline de
  documentación.

## 4. Arquitectura del website (Next.js 15)

### 4.1 Stack de base

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + `@ciszu/ui` |
| Estilos | Tailwind CSS v4 + PostCSS |
| Lenguaje | TypeScript (estricto) |
| Assets | `@ciszunetwork/cdn` (assetResolver) |
| Lint | ESLint |
| Deploy | Vercel |

### 4.2 Layout raíz (`src/app/layout.tsx`)

El layout raíz monta la estructura común de todas las páginas:

1. **Fuentes**: `Exo_2` y `Rajdhani` cargadas con `next/font/google` (variables `--font-exo2`
   y `--font-rajdhani`).
2. **Metadata**: título, descripción, Open Graph y manifest PWA para `ciszukoantony.vercel.app`.
3. **CloudflareGuard**: guardia de verificación (Turnstile) con logo del isotipo vía
   `assetResolver`.
4. **Navbar + Footer**: navegación y pie comunes.
5. **PwaRegister + InstallPdwaButton**: registro del service worker y botón de instalación
   como aplicación de escritorio (PDWA).
6. **FeedbackFab**: botón flotante de reporte de problemas.
7. **PostHogAnalytics**: analítica de la web.

### 4.3 Páginas del website

| Ruta | Página |
|---|---|
| `/` | Home (portfolio) |
| `/about` | Sobre Ciszuko Antony |
| `/team` | Equipo de Ciszu Network |
| `/faq` | Preguntas frecuentes |
| `/support` | Soporte |
| `/policies` | Políticas (terms, privacy, cookies, legal) |
| `/projects` | Proyectos |
| `/certificates` | Certificados |
| `/feedback` | Feedback / reporte de problemas |
| `/descargas` | Descargas (instalación PDWA) |
| `/contact` | Contacto |
| `/not-found` | 404 personalizado |

### 4.4 Configuración de navegación

`src/config/navigation.tsx` centraliza:

- Iconos SVG inline (`I`).
- Menú principal (`NAV_MAIN`).
- Todas las páginas (`ALL_PAGES`).
- Redes sociales (`SOCIALS`).
- Secciones del footer (`FOOTER_SECTIONS`).
- Títulos/descripciones por página (`PAGE_TITLES`).
- Índice de búsqueda (`SEARCH_INDEX`).

## 5. Pipeline de documentación

La documentación del portfolio sigue una cadena de generación simple:

```
txt → md → docx → pdf
```

### 5.1 Fases del pipeline

| Fase | Entrada | Salida | Herramienta | Notas |
|---|---|---|---|---|
| 1 | `docs/txt/*.txt` | `docs/md/*.md` | `txt2md` | Conversión de texto plano a markdown |
| 2 | `docs/md/*.md` | `docs/docx/*.docx` | `md2office` | Saltar GUIDELINES/RULES/ACTA |
| 3 | `docs/md/*.md` | `docs/pdf/*.pdf` | `md2office` | Saltar GUIDELINES/RULES/ACTA |
| 4 | `docs/*` | `website/public/docs/` | copia | Publicación en la web |

### 5.2 Fuente de verdad

- `docs/txt/` es la **única** fuente de verdad de los documentos (ABOUT, CONTACT, FAQ,
  POLICY, RULES, GUIDELINES, ACTA, CREDITS, HELP, SUPPORT, TEAM, SECURITY, LICENSE,
  CHANGELOG, TERMS_AND_CONDITIONS, DOCUMENTATION).
- Cualquier corrección se hace en `txt` y se propaga con el pipeline; nunca al revés.
- Los comandos concretos del pipeline viven en `WORKFLOW_SYSTEM.md` (§3).

### 5.3 Archivos especiales (composición manual)

Los documentos `GUIDELINES`, `RULES` y `ACTA` **no** se convierten a DOCX/PDF de forma
automática. Su diseño (encabezados, tablas, firmas) se compone a mano en Word y se mantiene
de forma deliberada fuera del pipeline.

## 6. Relación con el ecosistema Ciszu Network

| Recurso | Origen | Uso en el portfolio |
|---|---|---|
| `@ciszu/ui` | Paquete compartido | Componentes UI (PwaRegister, CloudflareGuard, FABs, PostHogAnalytics) |
| `@ciszunetwork/cdn` | Paquete compartido | Resolución de assets (`assetResolver.resolve`) |
| `@ciszunetwork/utils` | Paquete compartido | Utilidades (rate limiting, etc.) |
| Supabase Storage (`ciszu-cdn`) | Infraestructura | Imágenes y multimedia servidas vía CDN |
| Vercel | Infraestructura | Deploy de `ciszukoantony.vercel.app` |
| GitHub | Infraestructura | Repositorio y deploys desde `main` |
| `content/` del proyecto | Contenido | Logos e isotipos de la marca |

> La web **no** conecta directamente con Postgres: el acceso a datos (si aplica) se hace vía
> RPC de Supabase con políticas RLS. Ver `SECURITY_PROTOCOLS.md` (ciszu).

## 7. Flujo de datos de la web

1. El navegador pide una ruta al dominio de Vercel.
2. Next.js (App Router) resuelve la página y sus componentes en `src/app/`.
3. Los componentes usan `@ciszu/ui` para la UI de sistema (guardias, PWA, analytics).
4. Las imágenes y el logo se resuelven con `@ciszunetwork/cdn` → Supabase Storage.
5. El layout monta Navbar, Footer, CloudflareGuard y los FABs de instalación/feedback.
6. La respuesta se sirve con las cabeceras de seguridad del `middleware.ts`.

## 8. Buenas prácticas de arquitectura

- **No duplicar lógica**: si algo es compartido entre proyectos, vive en `packages/` y se
  importa (DRY). El portfolio no tiene copias locales de componentes del sistema.
- **Assets por CDN**: las imágenes de marca se sirven con `assetResolver`, no se meten en
  `public/` (salvo docs/PWA/sw).
- **Config centralizada**: la navegación, los títulos y la búsqueda viven en un solo archivo
  (`navigation.tsx`) para evitar dispersión.
- **Separación de intereses**: el frontend no ejecuta lógica pesada; el backend (Supabase)
  gestiona datos y seguridad con RLS.
- **KISS/YAGNI**: no añadir carpetas, páginas o dependencias "por si acaso".

## 9. FAQ

**¿Por qué `docs/txt/` es la fuente de verdad?** Porque es el formato más portable y editable;
los formatos ricos se generan desde él, garantizando consistencia.

**¿Puedo editar directamente `docs/md/`?** No recomendado: se regenera desde `txt`. Los
cambios hechos a mano se pierden en la siguiente pasada.

**¿Qué pasa si agrego un documento nuevo en `docs/txt/`?** Debe tener su par en `docs/md/`,
`docx/`, `pdf/` y publicarse en `website/public/docs/` (ver `WORKFLOW_SYSTEM.md`).

**¿Dónde están los assets de la marca?** En `content/` del proyecto, resueltos por
`@ciszunetwork/cdn` contra Supabase Storage. La carpeta `website/public/` solo lleva lo que
debe servirse estático.

**¿La web usa base de datos?** No directamente; cualquier dato se sirve vía RPC de Supabase
con RLS. Los paquetes compartidos y las políticas se documentan en ciszu.

**¿Cómo se agrega una página nueva?** Se crea su carpeta en `src/app/`, se registra en
`navigation.tsx` (si aplica) y se verifica con `pnpm --filter ciszukoantony-website build`.

## 10. Checklist del agente

- [ ] Localicé la página/componente en `src/` antes de modificar.
- [ ] Los assets nuevos usan `assetResolver`, no `public/`.
- [ ] Cambié `docs/txt/` (no `docs/md/`) si es documentación.
- [ ] No toqué `docs/obs/`, `musicboard/` ni `content/` sin permiso.
- [ ] Verifiqué el layout raíz si el cambio afecta a todas las páginas.
- [ ] Corrí lint + build al terminar.

## 11. Resumen ejecutivo

- El portfolio es un proyecto Next.js 15 (App Router) dentro del monorepo, con `website/`,
  `content/`, `musicboard/` y `docs/`.
- La documentación fluye `txt → md → docx → pdf`, con `docs/txt/` como fuente de verdad y un
  subconjunto especial (GUIDELINES/RULES/ACTA) de composición manual.
- El website consume los paquetes compartidos (`@ciszu/ui`, `@ciszunetwork/cdn`) y los assets
  se sirven desde Supabase Storage vía `assetResolver`.
- La configuración de navegación, redes y títulos está centralizada en `navigation.tsx`.

_Última revisión: 13 ago 2026._ Relacionado: `STACK_SYSTEM.md`, `WORKFLOW_SYSTEM.md`,
`BRAND_PLAN.md`, `PROMPTS_PLAN.md`, `README.md`.

