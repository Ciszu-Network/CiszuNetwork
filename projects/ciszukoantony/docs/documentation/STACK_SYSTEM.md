# STACK_SYSTEM — Stack Tecnológico del Portfolio (Ciszuko Antony)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: STACK_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta el stack tecnológico del portfolio de Ciszuko Antony
> (`ciszukoantony.vercel.app`): capas de web, estilos, tooling y deploy, fuentes, redes y
> medios, además de las reglas de versionado y dependencias.

---

## 1. Propósito y alcance

Este documento es el **inventario técnico** del proyecto `ciszukoantony`: qué tecnologías se
usan, qué versiones, para qué y con qué reglas. Sirve para:

- Saber qué stack hay antes de añadir dependencias.
- Mantener consistencia entre el portfolio y el resto del monorepo.
- Resolver dudas de "¿esto con qué se hace aquí?".
- Documentar los recursos de marca y redes que rodean al proyecto.

## 2. Resumen del stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Lenguaje | TypeScript | 6.x (strict) |
| UI | React / React DOM | 19.x |
| Estilos | Tailwind CSS + PostCSS | v4 |
| Lint | ESLint (`eslint-config-next`) | 9.x |
| Análisis | ESLint + TypeScript | — |
| Deploy | Vercel | — |
| Package manager | pnpm | 10.8.1 |
| Runtime | Node.js | >=20 |

### 2.1 Dependencias principales (`website/package.json`)

| Paquete | Tipo | Uso |
|---|---|---|
| `next` | dependency | Framework de la web |
| `react` / `react-dom` | dependency | UI |
| `@ciszu/ui` | dependency (workspace) | Componentes UI compartidos |
| `@ciszunetwork/cdn` | dependency (workspace) | Resolución de assets |
| `@ciszunetwork/utils` | dependency (workspace) | Utilidades compartidas |
| `@sentry/nextjs` | dependency | Monitorización de errores |
| `framer-motion` | dependency | Animaciones |
| `tailwindcss` | devDependency | Estilos |
| `typescript` | devDependency | Tipado |
| `eslint` / `eslint-config-next` | devDependency | Lint |

## 3. Capa web (Next.js 15 + App Router)

- **App Router**: las páginas viven en `src/app/` con `page.tsx`, `layout.tsx`, `not-found.tsx`
  y `global-error.tsx`.
- **Server Components por defecto**: el layout y las páginas son componentes de servidor;
  los componentes interactivos (Navbar, FABs) se marcan explícitamente como clientes cuando
  lo requieren.
- **Metadatos**: `Metadata` exportado en `layout.tsx` (título, descripción, Open Graph) y
  `manifest.ts` para la PWA.
- **Middleware**: `src/middleware.ts` añade cabeceras de seguridad y CSP; `robots.ts`
  permite `/` y bloquea `/api/`.

### 3.1 Por qué App Router

- Renderizado híbrido (SSG/SSR/CSR) según la página.
- Metadatos y fuentes optimizados (`next/font`).
- Rutas API bajo `src/app/api/` cuando se necesitan (ej. `verify-turnstile`).
- Alineación con el resto de proyectos del monorepo (mismo patrón).

## 4. Capa de estilos (Tailwind v4 + PostCSS)

- **Tailwind CSS v4** con el plugin `@tailwindcss/postcss`.
- Configuración en `tailwind.config.mjs` y `postcss.config.mjs`.
- CSS global en `src/app/globals.css`.
- Paleta e identidad visual del ecosistema (neon cyan/rosa) definida por temas de ciszu; ver
  `COLOR_SYSTEM.md` y `STYLES_SYSTEM.md` (ciszu).

### 4.1 Fuentes

| Fuente | Rol | Carga |
|---|---|---|
| **Exo_2** | Titulares / variable `--font-exo2` | `next/font/google` |
| **Rajdhani** | Subtítulos / pesos 400 y 700 / variable `--font-rajdhani` | `next/font/google` |

- Las fuentes se cargan en `src/app/layout.tsx` y se aplican como variables CSS en el
  `<body>` (clases `font-sans` etc.).

## 5. Capa de tooling

### 5.1 pnpm (workspaces)

| Comando | Uso |
|---|---|
| `pnpm install` | Instala todos los workspaces |
| `pnpm --filter ciszukoantony-website dev` | Desarrollo |
| `pnpm --filter ciszukoantony-website build` | Build |
| `pnpm --filter ciszukoantony-website lint` | Lint |
| `pnpm --filter ciszukoantony-website verify` | Lint + build |

### 5.2 ESLint y TypeScript

- `eslint.config.mjs` con `eslint-config-next`.
- TypeScript estricto (`tsconfig.json`): los tipos son el contrato.
- Verificación de cero regresiones: lint + build antes de dar por cerrado un cambio.

### 5.3 Node y entorno

- Node `>=20` (engines en `package.json`).
- pnpm `10.8.1` en el monorepo.

## 6. Capa de deploy (Vercel)

| Aspecto | Valor |
|---|---|
| Proyecto | `ciszukoantony-website` |
| URL | `ciszukoantony.vercel.app` |
| Rama de deploy | `main` |
| Trigger | Push a GitHub (GitHub Actions) |
| Comando de build | `next build` (via pnpm) |
| Salida | Next.js estándar |

- `vercel.json` y `.vercelignore` configuran ajustes específicos del proyecto.
- Los deploys se disparan desde la Organization `Ciszu-Network` en GitHub.

## 7. Paquetes compartidos del monorepo

| Paquete | Módulo | Qué aporta al portfolio |
|---|---|---|
| `@ciszu/ui` | `PwaRegister`, `InstallPdwaButton`, `CloudflareGuard`, `PostHogAnalytics`, `FabStackProvider`, `RichText` | UI de sistema y componentes reutilizables |
| `@ciszunetwork/cdn` | `assetResolver.resolve`, `resolveIcon` | Resolución de assets (imágenes, iconos) desde Supabase Storage |
| `@ciszunetwork/utils` | utilidades varias | Helpers compartidos |

> Los paquetes viven en `packages/` en la raíz del monorepo. Su documentación detallada está
> en `PACKAGES_SYSTEM.md` (ciszu).

## 8. Redes y medios

| Plataforma | Usuario / Nombre | Uso |
|---|---|---|
| YouTube | Cisco Antony Play | Canal principal de video |
| TikTok | @ciszukoantony | Shorts y clips |
| Instagram / Facebook | @itz.ciszukoant0nyz | Redes de marca |
| Twitch | itz.ciszukoant0nyz | Streaming |
| GitHub | `github.com/CiszukoAntony` | Código |
| X | `x.com/CiszukoAntony` | Red social |
| Discord | Comunidad de Ciszu Network | Soporte/comunidad |
| LinkedIn | `linkedin.com/in/ciszuko` | Perfil profesional |
| WhatsApp | WhatsApp personal de contacto | Contacto directo |
| Spotify | Perfil musical | Música |

> Los enlaces y handles concretos están centralizados en `website/src/config/navigation.tsx`
> (constante `SOCIALS`). La guía de uso de marca está en `BRAND_PLAN.md`.

## 9. Versionado

### 9.1 Versión del proyecto

- `website/package.json` declara `version: 1.0.0` (privado).
- El monorepo usa pnpm workspaces; cada app y paquete versiona de forma independiente.

### 9.2 Versionado de la documentación

- Los docs siguen semver (`X.Y.Z`) en su cabecera.
- `MAJOR`: reestructuración mayor; `MINOR`: cambios sustanciales; `PATCH`: correcciones.
- El identificador de cada doc incluye la fecha: `NOMBRE_V1.0.0_2026_08_13_ciszunetwork`.

## 10. Seguridad del stack

- **Secretos**: solo `process.env.X` en server-only; `NEXT_PUBLIC_` solo para lo público por
  diseño. No hay secretos hardcodeados en fallbacks.
- **Middlewares**: cabeceras de seguridad y CSP en `middleware.ts`; `robots.ts` bloquea
  `/api/`.
- **Rate limit**: todo endpoint POST que muta o consume servicios externos usa
  `createRateLimiter` de `@ciszunetwork/utils`.
- **Protección Cloudflare**: `CloudflareGuard` (Turnstile) en el layout.
- Las reglas completas están en `SECURITY_PROTOCOLS.md` (ciszu).

## 11. FAQ

**¿Qué versión de Next.js usa el portfolio?** Next.js 15 (App Router), con React 19.

**¿Por qué pnpm y no npm/yarn?** Es el gestor de workspaces del monorepo (pnpm 10.8.1), que
maneja los paquetes compartidos (`workspace:*`).

**¿Puedo añadir una librería nueva?** No sin validación: primero se propone y se espera
aprobación (ver DevSecOps / auditoría de dependencias en ciszu).

**¿Las fuentes se autoalojan?** Se cargan con `next/font/google` (optimizadas y autoalojadas
por Next.js).

**¿Cómo se desplega?** Vercel, desde `main`, con build `next build`. El push lo hace el
usuario de forma manual si el DNS local falla.

**¿Dónde está la configuración de redes sociales?** En `website/src/config/navigation.tsx`
(constante `SOCIALS`).

**¿El portfolio usa Supabase?** Consume los assets (Storage) vía `@ciszunetwork/cdn`; no se
conecta directamente a la base de datos.

## 12. Checklist del agente

- [ ] No introduje dependencias sin aprobación.
- [ ] Los secretos solo vienen de `process.env` (server-only).
- [ ] Verifiqué `pnpm --filter ciszukoantony-website lint` y `build`.
- [ ] Las fuentes nuevas (si aplica) se cargan con `next/font`.
- [ ] Cualquier asset usa `@ciszunetwork/cdn`.
- [ ] La versión de la documentación actualizada en la cabecera.

## 13. Resumen ejecutivo

- Stack: Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind v4 + ESLint.
- Tooling: pnpm 10.8.1 workspaces, Node >=20; deploy en Vercel desde `main`.
- Fuentes: Exo_2 (titulares) y Rajdhani (subtítulos) vía `next/font/google`.
- Redes y medios centralizados en `navigation.tsx`; guía de uso en `BRAND_PLAN.md`.
- Seguridad del stack: middlewares, CSP, Turnstile y rate limiting (reglas en ciszu).

_Última revisión: 13 ago 2026._ Relacionado: `ARCHITECTURE.md`, `WORKFLOW_SYSTEM.md`,
`BRAND_PLAN.md`, `README.md`.

