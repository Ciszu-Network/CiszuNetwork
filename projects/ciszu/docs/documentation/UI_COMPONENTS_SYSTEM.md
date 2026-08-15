# UI_COMPONENTS_SYSTEM — Sistema de Componentes UI de los Proyectos (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: UI_COMPONENTS_SYSTEM_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: sistema que documenta el **ecosistema de componentes de UI** del monorepo:
> cómo se diseñan, se implementan, se documentan, se testean y se publican los componentes
> compartidos de `@ciszu/ui`, junto con las herramientas de soporte (Storybook, Chromatic,
> Figma, Tailwind CSS, React, Vitest, Playwright). Complementa a `PACKAGES_SYSTEM.md` y a
> `FRONTEND_SYSTEM.md` desde la óptica **del componente como unidad de trabajo**.

---

## 1. Visión general del ecosistema

| Herramienta | Rol en `@ciszu/ui` |
|---|---|
| **React 19.x** | Runtime de los componentes (librería UI compartida) |
| **Next.js 15** | Consumidor principal (4 webs); peer en `peerDependencies` |
| **Tailwind CSS v4** | Estilos con tokens vía `@theme` (ver `STYLES_SYSTEM.md`) |
| **Storybook 10.5.8** | Shell de desarrollo, documentación y pruebas de componentes |
| **Chromatic** | Visual + a11y testing alojado (cloud) |
| **Figma** | Diseño de los componentes (integración vía addon-designs) |
| **Vitest 4** | Runner de pruebas (unit + component vía addon-vitest) |
| **Playwright** | Navegador para tests de componente e E2E |
| **MSW** | Mocking de API en historias de Storybook |

## 2. `@ciszu/ui` — el paquete de UI compartida

- Filtro pnpm: `@ciszu/ui`. Ubicación: `packages/ui/`.
- Consume `@ciszunetwork/cdn` (resolución de assets) y `storybook` (dev-only).
- **Peer deps**: `react`/`react-dom` ≥17 (el bundler de la app resuelve). Sin bundle propio.
- Componentes actuales: `Icon`, `IconButton`, `SmartImage`, `Button`, `RichText`, `VinylDisc`,
  `ScrollSpy`, `FlagIcon`, `SocialIcon` (con `SOCIAL_COLORS`), `ZoomWarning` (+ utilidades de
  PWA/analytics en `src/`). Los atoms `Button`, `RichText`, `VinylDisc`, `ScrollSpy`, `FlagIcon`,
  `SocialIcon` y `ZoomWarning` fueron **portados desde los proyectos** (ciszu/muzicmania/
  ciszukoantony) a `@ciszu/ui` sin dependencias nuevas. Detalle: `PACKAGES_SYSTEM.md` §2.

## 3. Storybook — el entorno de desarrollo de componentes

Configuración en `packages/ui/.storybook/`:

| Archivo | Función |
|---|---|
| `main.ts` | Stories, `staticDirs` (`public/`), addons, `viteFinal` (define de env) |
| `preview.ts` | Loaders MSW, layout `centered`, parámetros globales |
| `manager.ts` | Config de badges de tags (tag-badges) en la UI |
| `vitest.setup.ts` | Setup del addon-vitest (import del setup-file interno) |
| `public/` | `mockServiceWorker.js` (MSW) servido estático para las stories |

### 3.1 Addons instalados (y su rol)

| Addon | Paquete | Rol |
|---|---|---|
| **Accessibility** | `@storybook/addon-a11y` 10.5.8 | Tests de accesibilidad (Axe/WCAG) en panel y tests |
| **Test** | `@storybook/addon-vitest` 10.5.8 | Convierte stories en tests de componente (browser) |
| **Designs (Figma)** | `@storybook/addon-designs` 11.1.4 | Pestaña **Design** con el embed del frame en Figma |
| **Themes** | `@storybook/addon-themes` 10.5.8 | Cambiar tema desde el toolbar (light/dark/brand) |
| **Dark Mode** | `storybook-dark-mode` 5.0.0 | Toggle light/dark independiente en la toolbar |
| **Tag Badges** | `storybook-addon-tag-badges` 3.1.0 | Badges de tags en sidebar/toolbar (test/a11y/autodocs) |
| **Visual Tests** | `@chromatic-com/storybook` 5.3.0 | UI de visual testing de Chromatic dentro de Storybook |
| **Mock Service Worker** | `msw-storybook-addon` 3.0.0 | Mock de APIs en las historias (runtime browser) |
| **Chromatic CLI** | `chromatic` 18.2 | Publica el build de Storybook a Chromatic |

Los addons **a11y, vitest, themes, dark-mode, tag-badges, designs y Visual Tests** se declaran
en `main.ts` → `addons`; **MSW** además requiere `preview.ts` (loader) y `staticDirs: ['public']`
con el `mockServiceWorker.js` generado. **tag-badges** configura sus badges en `manager.ts`.

## 4. Configuración clave de Storybook

### 4.1 Resolver `process.env` en el navegador (Vite)

Storybook dev (Vite browser) no define `process`; componentes que leen
`process.env.NEXT_PUBLIC_CDN_URL` (p. ej. `@ciszunetwork/cdn`) rompen en runtime.
Solución: `viteFinal` en `main.ts` con `define` (mismo patrón que `vitest.config.mts`):

```ts
viteFinal: async (config) => {
  config.define = {
    ...config.define,
    'process.env.NEXT_PUBLIC_CDN_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_CDN_URL ?? ''
    ),
  };
  return config;
},
```

### 4.2 Tags de stories

Las stories usan `tags: ['autodocs', 'a11y', 'test']`:

- `autodocs` → documentación automática (Docs).
- `a11y` → checks de accesibilidad (Axe) en panel y tests.
- `test` → incluida en los tests de componente (default del plugin vitest).
- `new`/`beta`/`deprecated`/`version:*` → badges preconfigurados de tag-badges.

### 4.3 MSW (mocking de APIs)

- Worker: `packages/ui/.storybook/public/mockServiceWorker.js` (generado por `msw init`).
- Loader global en `preview.ts`: `loaders: [mswLoader()]`.
- Handlers por historia vía `parameters.msw`.
- Como el bundle de la browser-app resuelve `msw`/`msw-storybook-addon` vía el árbol de
  dependencias del package, MSW solo afecta a Storybook (dev/test); las webs en producción
  usan sus propios clientes de datos.

## 5. Tests de componentes (Vitest browser + Playwright)

- Config: `packages/ui/vitest.config.mts` (project `storybook`, provider `playwright` con
  chromium headless).
- Script: `pnpm --filter @ciszu/ui test:storybook`.
- Play functions con `storybook/test` (`expect`, `userEvent`, `within`, `fn`).
- Cobertura actual: **34 stories en 9 componentes** (Icon, SmartImage, Button, RichText,
  VinylDisc, ScrollSpy, FlagIcon, SocialIcon, ZoomWarning). Suites en CI: job
  `storybook-tests` de `ci.yml` instala chromium y ejecuta.
- Verificación del fix de `process`: el bundle del build de Storybook ya NO referencia
  `process.env.NEXT_PUBLIC_CDN_URL` (reemplazado por define en build-time).

## 6. Chromatic — visual y accesibilidad alojados

- CLI local: `pnpm --filter @ciszu/ui chromatic` (usa `--exit-zero-on-changes`).
- Token: `CHROMATIC_PROJECT_TOKEN` (env; en vault `services/supabase/.env`). appId
  `6a7f722e2641a24bc6249782`.
- **CI**: `.github/workflows/chromatic.yml` — Action `chromaui/action@v18`, `workingDir:
  packages/ui`, `autoAcceptChanges: main`, TurboSnap (`onlyChanged`). El secret
  `CHROMATIC_PROJECT_TOKEN` ya está configurado en el repo (14 ago 2026). Documentado en
  `PACKAGES_SYSTEM.md` §4.
- **Publicación local**: con los workflows parados por billing, la publicación también puede
  ejecutarse desde este PC inyectando el token al entorno:
  `$env:CHROMATIC_PROJECT_TOKEN = <token>` y ejecutando `sbchrom` (o
  `pnpm --filter @ciszu/ui chromatic`). Los builds publicados validan las 5 stories y quedan
  listos para revisión en la web de Chromatic (https://www.chromatic.com).
- **Disclaimer "Finish setup"**: aparece hasta que hay un build publicado vía CI/token de
  proyecto. Con los workflows suspendidos, **una publicación local (como la del build 4/5)
  resuelve el estado**; el primer push que troquea `packages/ui/**` también lo hace vía CI.
- **Visual Tests**: el addon `@chromatic-com/storybook` (5.3.0) activa la UI de visual testing
  dentro de Storybook (requiere sesión/account Chromatic) — es la puerta al test visual sin
  salir del UI.

## 7. Figma — diseño y componentes

Integración con `@storybook/addon-designs`:

- Para incrustar el diseño en la pestaña **Design** de una story, declarar el parámetro:

```ts
parameters: {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/<FILE_ID>?node-id=<FRAME_ID>',
  },
}
```

- Obtención de la URL: en Figma, clic derecho en el frame → **Copy link to selection**
  (o `Share → Copy link` con "Link to selected frame").
- **Enlace bidireccional** (ver el componente en Figma desde Chromatic y el Storybook vivo en
  Figma): plugin de Chromatic **Storybook Connect** en Figma. Requiere el Storybook publicado en
  Chromatic (URL tipo `https://<appId>-<branch>.chromatic.com`).
- No es necesaria la publicación de Chromatic para el **embed** (usa la URL pública del archivo);
  sí lo es para el enlace bidireccional del plugin.

## 8. Tailwind CSS v4

- Framework de estilos; tokens de marca vía `@theme` en CSS (neon cyan/rosa, tipografía
  Geomanist). Detalle completo: `STYLES_SYSTEM.md` y `COLOR_SYSTEM.md`.
- Los componentes de `@ciszu/ui` consumen los tokens de Tailwind de las apps consumidoras;
  no shipping de CSS dentro del paquete (ver `PACKAGES_SYSTEM.md` §4).

## 9. React 19 — convenciones de componentes

- Componentes de UI en `packages/ui/src/` con stories colocated (`*.stories.tsx`).
- TypeScript estricto (privado de la librería: TS/ESM puro, sin bundlers).
- `"use client"` solo donde aplica (componentes que usan hooks de navegación de Next), en los
  componentes consumidos por las webs.
- No añadir comentarios al código salvo que una tarea lo pida (regla de estilo del repo).

## 10. Comandos de operación (atajos del perfil / scripts)

Ver `AGENTS.md` §Quick start y `scripts/storybook.ps1`:

| Comando | Acción |
|---|---|
| `sb` | Sirve Storybook en `http://localhost:6006` |
| `sbtest` | Corres las stories como tests (Playwright/Chromium) |
| `sbwatch` | Modo watch de los tests de stories |
| `sbbuild` | Build estático en `packages/ui/storybook-static` |
| `sbchrom` | Publica el build en Chromatic (requiere token en env) |
| `checkall` | `pnpm test` + `sbtest` (chequeo pre-commit) |
| `pwcode` | Codegen de Playwright (navegador) contra una URL |

## 11. Rutina recomendada de desarrollo de un componente

1. Diseño en Figma (frame/juego de tokens).
2. Implementar en `packages/ui/src/<Nombre>.[jt]sx`.
3. Crear `Nombre.stories.tsx` con stories: `Default`, variantes y una story con
   `play` function (interacción + aserción).
4. Tags `['autodocs', 'a11y', 'test']` (+ `design` con URL Figma).
5. `sb`para revisión visual/a11y/Design; `sbtest` para los tests de componente.
6. `sbbuild` seguido de `sbchrom` (o push) para visual testing en la nube.

## 12. Seguridad y buenas prácticas

- **CSP/Security**: las webs añaden cabeceras de seguridad y CSP (`buildCsp`) en middleware;
  los addons de Storybook son **dev-only** y nunca se empaquetan en producción.
- **MSW**: usar handlers explícitos por historia; no mockear secretos ni depender de credenciales
  reales. En CI, MSW se limita a Storybook.
- **Visual Tests**: requiere cuenta/interactor Chromatic con permisos; el token del proyecto
  (vault) NO se usa como fallback en código ni se hardcodea en stories.
- **Dependencias**: no instalar addons sin verificar compatibilidad con Storybook 10 (p. ej.
  el addon de tag-badges del registro es `storybook-addon-tag-badges`, NO
  `@storybook/addon-tag-badges`, que no existe en npm).

## 13. Estado y próximos pasos

- **Logrado (14 ago 2026)**: a11y, vitest, designs (Figma), themes, dark-mode, tag-badges,
  Visual Tests (addon), MSW/worker, Chromatic (builds 4–5 publicados, secret del repo
  configurado), fix `process` en Vite, docs (addon-docs), **página MDX `Introduction`**,
  **coverage de vitest activado**, viewports globales (mobile/tablet/laptop/desktop),
  **agrupación** de stories (`Atoms`/`Molecules`), y **port de 7 components reales desde los
  proyectos** con 34 stories que pasan (interacción + accesibilidad).
- **Pendiente**: pestañas theming con `@storybook/addon-themes` aplicando a las stories
  existentes; handlers MSW de ejemplo; historia de regresión con Visual Tests; primer push de
  `packages/ui/**` disparando el workflow Chromatic en CI.

---

_Última revisión: 14 ago 2026._ Relacionado: `PACKAGES_SYSTEM.md`, `FRONTEND_SYSTEM.md`,
`STYLES_SYSTEM.md`, `COLOR_SYSTEM.md`, `FULL_STACK_SYSTEM.md`, `TESTING_SYSTEM.md`,
`BACKEND_SYSTEM.md`, `SECURITY_PROTOCOLS.md`.