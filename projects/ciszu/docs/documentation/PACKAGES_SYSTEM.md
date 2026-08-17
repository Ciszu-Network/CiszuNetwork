# PACKAGES_SYSTEM — Sistema de Paquetes Compartidos (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: PACKAGES_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta los **paquetes compartidos** del monorepo (`packages/`):
> qué hace cada uno, quién lo consume, cómo se publica/usa en el workspace y las reglas para
> añadir código compartido. Complementa `FRONTEND_SYSTEM.md` y `BACKEND_SYSTEM.md`.

---

## 1. Visión general de paquetes

| Paquete | Versión | Tipo | Rol |
|---|---|---|---|
| `@ciszu/ui` | 1.0.0 | Componentes React | UI compartida (Icon, SmartImage, FabStack) |
| `@ciszunetwork/cdn` | 1.0.0 | Resolver de assets | Rutas/URLs de assets del CDN |
| `@ciszunetwork/email` | 1.0.0 | Envío de correos | Emails transaccionales (Resend) |
| `@ciszunetwork/payments` | 1.0.0 | Pagos | Rieles de pago (NOWPayments/Binance) |
| `@ciszunetwork/utils` | 1.0.0 | Utilidades | Rate limit, escapeHtml, IAST, csp |
| `@ciszunetwork/db` | 1.0.0 | Capa de datos | Schemas Drizzle (ciszubot, muzicmania, ciszunetwork, ciszu) + cliente Postgres (server-only) |

- Los paquetes viven en `packages/<nombre>/` dentro del monorepo pnpm.
- Se referencian por su nombre de workspace (`@ciszu/*`, `@ciszunetwork/*`).
- Solo explicado con detalle a nivel de API pública (`src/index.ts`/`package.json` exports).

## 2. Dónde vive cada paquete

| Paquete | Carpeta | Consumidores |
|---|---|---|
| `@ciszu/ui` | `packages/ui/` | Las 4 webs |
| `@ciszunetwork/cdn` | `packages/cdn/` | Webs + scripts |
| `@ciszunetwork/email` | `packages/email/` | Webs/API |
| `@ciszunetwork/payments` | `packages/payments/` | APIs de pago |
| `@ciszunetwork/utils` | `packages/utils/` | Todos los anteriores + webs |
| `@ciszunetwork/db` | `packages/db/` | Server-only (webs, bot, scripts) — NUNCA importar en el navegador |

## 3. Reglas de paquetes compartidos

| Regla | Descripción |
|---|---|
| **Un paquete = una responsabilidad** | SRP; no mezclar UI con lógica de pago |
| **API pública explícita** | Exportar solo lo que se consume (index) |
| **Tipado estricto** | TypeScript con tipos; build de types |
| **Versionado semver** | `x.y.z`; subir con `pnpm version` o manual |
| **Tests propios** | Suite Vitest por paquete (`packages/ui/tests`) |
| **No acoplar a una web** | El paquete no puede depender de una app |
| **Sin secrets** | Config solo vía env de la app consumidora |
| **Docs en `_SYSTEM`** | Nuevo paquete → documentar aquí antes de usar |

## 4. `@ciszu/ui` (UI compartida)

Componentes React reutilizados por las webs:

| Componente | Función |
|---|---|
| `<Icon name="..." />` | Icono SVG inline desde el registry |
| `<SmartImage ... />` | Imagen optimizada (CDN, lazy, webp) |
| `<Button variant=... />` | Botón de acción (primary/secondary/outline/neon, portado de muzicmania) |
| `<RichText parts=... />` | Párrafo con partes de texto/enlaces seguros (portado de ciszukoantony) |
| `<VinylDisc color=... />` | Vinilo decorativo SVG (portado de muzicmania) |
| `<ScrollSpy items=... />` | Navegación lateral con IntersectionObserver (portado de muzicmania) |
| `<FlagIcon code=... />` | Bandera ISO 3166-1 vía sistema de iconos (portado de muzicmania) |
| `<SocialIcon platform=... />` | Icono de red social con color de marca (portado de ciszu) |
| `<ZoomWarning />` | Aviso de zoom alto del navegador (portado de ciszu) |
| `<FabStack ... />` | Botones flotantes apilados (PDWA + reportar) |
| `<InstallPdwaButton />` | Instalación PWA por navegador |
| Guard / IAST | Protección por página (seguridad) |

- Estilos con Tailwind v4 (tokens vía `@theme` de cada web).
- Tests en `packages/ui/tests` (Vitest); integración con Playwright security-e2e.
- **Storybook (dev-only, F3)**: `@storybook/react-vite` v10.5.8 con `storybook` y `build-storybook`.
  Stories en `src/**/*.stories.tsx` (34 stories en 9 componentes: Icon, SmartImage, Button,
  RichText, VinylDisc, ScrollSpy, FlagIcon, SocialIcon, ZoomWarning). Sin runtime en prod.
  Documenta el componente compartido por las 4 webs con visual regression.
  Addons: core (controls/actions/interactions/viewport vienen integrados en Storybook 9+,
  NO se instalan) + accesibilidad `@storybook/addon-a11y` 10.5.8 (WCAG/Axe) + Figma
  `@storybook/addon-designs` 11.1.4 (pestaña Design) + temas `@storybook/addon-themes` 10.5.8 +
  `storybook-dark-mode` 5.0.0 + badges de tags `storybook-addon-tag-badges` 3.1.0 +
  Visual Tests `@chromatic-com/storybook` 5.3.0 + `msw-storybook-addon` 3.0.0/msw 2.15
  (mock de APIs). Tags `['autodocs','a11y','test']` en las stories. Catálogo y detalle de cada
  addon en `UI_COMPONENTS_SYSTEM.md §3`.
- **Interaction/local testing (F4)**: `@storybook/addon-vitest` 10.5.8 + `@vitest/browser-playwright`
  convierten las stories en tests de componente que corren en un navegador real (chromium) **sin**
  depender de Chromatic. Play functions con `storybook/test` (`expect`, `userEvent`, `fn`) en
  las stories de los 9 componentes (Icon, SmartImage, Button, RichText, VinylDisc, ScrollSpy,
  FlagIcon, SocialIcon, ZoomWarning). Tag `'test'` en las stories para
  incluirlas (default del plugin). Config: `packages/ui/vitest.config.mts` (project `storybook`).
  Script local: `pnpm --filter @ciszu/ui test:storybook`. **CI**: job `storybook-tests` en
  `.github/workflows/ci.yml` instala chromium y los ejecuta.
- **Chromatic (dev-only, F4)**: CLI `chromatic` 18.2 + token `CHROMATIC_PROJECT_TOKEN` (vault) para
  visual + accessibility testing alojado. Builds 1–5 publicados (14 ago 2026; 5 stories/2
  componentes). appId `6a7f722e2641a24bc6249782`.
  Script local: `pnpm --filter @ciszu/ui chromatic` (usa `--exit-zero-on-changes`: no falla en
  CI por cambios detectados; el review se hace en la web de Chromatic).
  **CI**: `.github/workflows/chromatic.yml` — GitHub Action `chromaui/action@v18`, se ejecuta en
  cada push que toque `packages/ui/**`, monorepo (`workingDir: packages/ui`), `autoAcceptChanges:
  main` (baselines limpios con squash/rebase) y TurboSnap (`onlyChanged`) para solo re-capturar
  stories afectadas.
- **Ecosistema documentado (futuro, no instalado)**: integración de diseño con **Zeroheight /
  Notion** (documentar stories a equipos) como evolución posterior; alternativas evaluadas y
  descartadas: **Histoire / Ladle** (menor ecosistema y menor integración con Chromatic/testing que
  Storybook).
- **Figma (F4)**: addon `@storybook/addon-designs` 11.1.4 (dev-only, oficial) incrusta diseños de
  Figma en la pestaña **Design** de cada story (`parameters.design = { type: 'figma', url }`).
  Declarado en `packages/ui/.storybook/main.ts` → `addons` y ejemplificado en `Icon.stories.tsx`
  (Button) y `SmartImage.stories.tsx` (meta). URLs con `FILE_ID`/`node-id` de Figma
  (`https://www.figma.com/file/<FILE_ID>?node-id=<FRAME>`). Ver `PACKAGES_SYSTEM` §4 para requisito
  de publicación en Chromatic (el embed no la necesita; el enlace bidireccional del plugin "Storybook
  Connect" en Figma sí).

## 5. `@ciszunetwork/cdn` (assets)

- Resolver de assets: `assetResolver` para rutas/URLs de `ciszu-cdn`.
- Los webs sirven imágenes/skins/audio desde el bucket sin duplicar en `public/`.
- Detalle de formatos: `MEDIA_FORMATS_SYSTEM.md`; detalle del CDN: `CDN_SYSTEM.md`.

## 6. `@ciszunetwork/utils` (utilidades)

| Utilidad | Función |
|---|---|
| `createRateLimiter` | Rate limit en endpoints POST |
| `createIast` | Sensor IAST (seguridad runtime) |
| `buildCsp` | Cabecera CSP (en dev añade `unsafe-eval` + CDN local `localhost:8788`) |
| `escapeHtml` | Escape para prevenir XSS |
| `z` (re-export), `parseJsonBody`, `firstZodMessage` | Validación Zod del borde entrada (mutantes) |

- Usada por webs, bot y el resto de paquetes.
- **Regla F3**: todo API route que mute o consuma un servicio externo valida su body con
  `parseJsonBody(request, schema)` + `firstZodMessage`, devolviendo 400 en error.

## 7. `@ciszunetwork/email` (correos)

- Envío de emails transaccionales (proveedor Resend; ver `EMAILS_SYSTEM.md`).
- Uso server-only: los secrets vienen de env de la app.

## 8. `@ciszunetwork/payments` (pagos)

- Rieles de pago (NOWPayments/Binance) para donaciones/suscripciones.
- Verificación server-side (IPN/webhooks) + rate limit.
- Detalle: `PAYMENTS_SYSTEM.md`.

## 8.1 `@ciszunetwork/db` (capa de datos)

- Schemas Drizzle ORM fieles a los esquemas reales `ciszubot`, `muzicmania`,
  `ciszunetwork` y `ciszu` (verificados contra la BD por `dbvr`).
- Cliente Postgres server-only vía `pg` (`src/client.ts`): `db`, `createDb()`.
- Regla de oro: **el navegador NUNCA importa este paquete**. El cliente usa
  `@supabase/supabase-js` + PostgREST + RLS; Drizzle es exclusivo de server.

## 9. Cómo añadir código compartido

1. ¿Lo usan 2+ apps o es lógica de dominio? → paquete.
2. Crear `packages/<nombre>/` con `package.json` (workspace).
3. Definir API pública en el index; tipado estricto.
4. Añadir la dependencia del workspace a cada consumidor:
   ```bash
   pnpm --filter ciszunetwork-website add @ciszunetwork/utils@workspace:*
   ```
5. Añadir tests con Vitest.
6. Documentar aquí + en `FULL_STACK_SYSTEM.md`.
7. Verificar con `pnpm build` (los types de packages resuelven desde el paquete).

## 10. Cómo actualizar un paquete (impacto en las 4 webs)

- Un cambio en `packages/**` dispara el **deploy de las 4 webs** (workflow deci.yml de
  cada app vigila `packages/`).
- Antes de tocar un paquete compartido: revisar builds de las 4 + tests.
- Si el cambio rompe API pública: subir major (`x+1.0.0`) y actualizar consumidores.

## 11. Estructura de un paquete

```
packages/<nombre>/
├── package.json      # name workspace, exports, types
├── tsconfig.json     # compilación de types
├── src/
│   ├── index.ts      # API pública
│   └── ...
└── tests/            # suite Vitest
```

## 12. Troubleshooting de paquetes

| Síntoma | Causa/Solución |
|---|---|
| Types no se resuelven en build | `pnpm install` (types viven en el paquete, no en root) |
| Componente no aparece en web | Rebuild de la app / dev server reiniciado |
| Cambio de paquete rompe otra web | Revisar consumidores + build de las 4 webs |
| Paquete con secreto | Mover a env de la app; los paquetes no llevan secrets |

## 13. Conceptos (contexto informático)

| Concepto | Definición |
|---|---|
| **Paquete/workspace** | pieza de código reutilizable publicada localmente |
| **Monorepo** | Repositorio con varios paquetes |
| **`workspace:*`** | Referencia local a un paquete del monorepo |
| **API pública** | Exports consumibles del paquete |
| **Semver** | `major.minor.patch` |
| **SRP** | Single Responsibility Principle (una responsabilidad) |
| **DRY** | Don't Repeat Yourself (no duplicar) también aplica aquí |
| **Bundle** | Agrupación de módulos para el navegador |
| **Tree-shaking** | Eliminar código no usado en el bundle |
| **Peer dependency** | Dependencia esperada del consumidor (no incluida) |
| **Module Federation** | Compartir módulos en runtime (no usado) |
| **Lerna/Changesets** | Herramientas de versionado de monorepos (alternativa) |
| **Publicar (publish)** | Subir el paquete a un registry (npm) |
| **Interno (internal)** | Paquete usado solo dentro del workspace, no publicado |

## 14. ¿Por qué no publicar en npm (hoy)?

- Los paquetes son **internos al monorepo** y se referencian con `workspace:*`.
- El CDN, la UI y las utilidades solo las consumen las apps de ciszu.
- Publicar en npm añadiría gestión de versions/registro sin beneficio actual.
- Si en el futuro se reutiliza fuera del workspace (terceros), se publica (semver real).

## 15. Preguntas frecuentes

**¿`@ciszu/ui` es lo mismo que `@ciszunetwork/ui`?** No: la UI vive en `@ciszu/ui`;
`@ciszunetwork/*` son los paquetes de infraestructura (cdn, utils, email, payments).

**¿Un cambio de un paquete rompe las 4 webs?** Puede romper builds/tests de las 4, por eso
se revisan las 4 antes de mergear (`pnpm build` global).

**¿Puedo poner código de una web dentro de un paquete?** No: el paquete no puede depender de
una app (dependencia inversa al archivo de dependencias del monorepo).

**¿Los tests de paquetes corren en CI?** Sí: `ci.yml` corre Vitest sobre todo el workspace.

**¿Cómo versiono un paquete?** Subir el campo `version` en `packages/<x>/package.json`
(manualmente o con una tool de changesets); los consumidores usan `workspace:*` y no
requieren cambios.

## 16. Checklist de revisión al tocar un paquete

- [ ] ¿La API pública cambió? → avisar a todos los consumidores.
- [ ] ¿Rompe types/semantica? → subir versión (major si rompe, minor si añade).
- [ ] Tests del paquete actualizados y verdes.
- [ ] Build global (`pnpm build`) de las 4 webs OK.
- [ ] Docs actualizados (este doc + `FULL_STACK_SYSTEM.md`).
- [ ] Sin secrets en el paquete (config vía env de la app).

## 17. Resumen ejecutivo

- Los paquetes compartidos (`@ciszu/ui`, `@ciszunetwork/*`) centralizan UI, assets,
  utilidades, correos y pagos — evitando duplicación entre las 4 webs.
- Regla OTRA VEZ clara: **un cambio en `packages/` afecta a todo** → builds de las 4 webs.
- Son **internos** (workspace), no publicados en npm (hoy).
- Nuevo paquete: crear → API pública → tests → documentar → verificar.

## 18. Mapa de dependencias entre paquetes

```
packages/
├── ui        → React 19, Tailwind v4 (tokens por web)
│               usa: @ciszunetwork/utils (IAST, escapeHtml), @ciszunetwork/cdn (assets)
├── cdn       → resolver de assets (ciszu-cdn / Supabase Storage)
├── utils     → rate limit, csp, iast, escapeHtml  (sin dependencias internas)
├── email     → Resend (server-only)               usa: @ciszunetwork/utils
├── payments  → NOWPayments/Binance (server-only)  usa: @ciszunetwork/utils
└── db        → Drizzle + pg (server-only)         usa: (sin deps internas)

Webs (ciszunetwork, ciszukoantony, muzicmania, ciszubot)
  → @ciszu/ui, @ciszunetwork/{cdn,utils,email,payments}
Bot, webs y scripts (server)
  → @ciszunetwork/db
```

## 19. Política de dependencias externas

| Regla | Descripción |
|---|---|
| **Minimizar** | Toda dependencia externa es superficie de ataque y peso de build |
| **Aprobación** | Nueva dependencia externa → aprobación y documentación previa |
| **Audit** | `pnpm audit` en CI detecta vulnerabilidades |
| **Peer deps** | React/Next como peer cuando el paquete es UI |
| **Sin bundlers** | El paquete exporta TS/ESM; el bundler de la app resuelve |

_Última revisión: 13 ago 2026._ Relacionado: `FRONTEND_SYSTEM.md`, `BACKEND_SYSTEM.md`,
`FULL_STACK_SYSTEM.md`, `CDN_SYSTEM.md`, `EMAILS_SYSTEM.md`, `PAYMENTS_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `TESTING_SYSTEM.md`.
