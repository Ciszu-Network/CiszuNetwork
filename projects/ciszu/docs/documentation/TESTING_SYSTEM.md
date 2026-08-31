# TESTING_SYSTEM — Framework de tests en Ciszu Network (2026)

Versión: 2.1.0
Actualización: 2026-08-16
Identificador: TESTING_SYSTEM_V2.1.0_2026_08_16_ciszunetwork

> Documento de decisión: qué framework usar, por qué, dónde aplicarlo y si es **sobreingeniería** para este monorepo.
> Estado: **IMPLEMENTADO (8 ago 2026)** — Fases 0-3 completadas (Vitest 81 tests + Playwright E2E smoke). Ver §8 "Estado de implementación".

## Resumen ejecutivo (TL;DR)

- **Recomendación**: **Next.js (build local)** como primera capa de verificación + **Vitest** (unit/integration) + **Playwright** (E2E) + **Testing Library** para componentes React. Es el stack estándar del ecosistema JS en 2026.
- **Costo**: 100% gratis y open source (MIT/Apache-2.0). **Sin tarjeta de crédito ni cuenta** — todo corre local con npm/pnpm y en GitHub Actions (free tier).
- **¿Sobreingeniería?**: hoy SÍ para las webs puramente informativas (ciszunetwork, ciszukoantony); NO para lógica compartida (`@ciszu/ui`, `@ciszunetwork/cdn`), el bot y el backend de muzicmania.
- **Estrategia correcta**: no instalar "por instalar", sino testear **lo que tiene lógica y riesgo**, dejando las páginas estáticas sin tests E2E.
- **Alternativa mínima sin dependencias**: `node:test` built-in (ya viene con Node, cero deps).

> **Next.js como framework de testeo local**: `next build` / `next dev` compilan y tipan las 4
> webs y **fallan en errores de bundling/SSR/tipos**. Es la capa 0 de verificación de todo
> cambio de frontend (gratis, ya instalada, validada en CI por Vercel) ANTES de Vitest/E2E.
> Obligatoria por `LOCAL_TESTING_PROTOCOLS.md` §3.3. Ver §9A.

---

## 1. Qué es un framework de tests y para qué sirve

Un framework de tests ejecuta **código que comprueba código**: llamas funciones, renderizas componentes o abres tu web en un navegador real, y verificas que el resultado es el esperado (valores, textos, estados, flujos). Sirve para:

1. **Prevenir regresiones**: puedes romper algo al tocar código viejo sin darte cuenta — los tests lo detectan.
2. **Documentar comportamiento**: un test describe qué debe hacer X función mejor que un comentario.
3. **Refactorizar con confianza**: los cambios de estructura no rompen funcionalidad en silencio.
4. **Atrapar bugs pronto**: el coste de encontrar un bug en desarrollo es ~10-100x menor que en producción.

No sustituye a los **Bruno API tests** (que ya hay en `apis/bruno/`) — lo complementa en otro nivel: Bruno prueba la API desplegada; los tests unitarios prueban la lógica del código fuente.

---

## 2. Investigación comparativa (estado 2026)

Fuentes: guías oficiales (vitest.dev, playwright.dev), State of JS 2024/2025, análisis PkgPulse, testdino y pkgpulse (mar 2026). Conclusiones del sector:

| Aspecto | Ganador 2026 | Por qué |
|---|---|---|
| Unit/Integración TS/ESM | **Vitest** | ↑8M descargas/semana, arranque ~0.5s (Jest ~5s), TS nativo, ESM nativo, watch 100ms |
| Componentes React | **Testing Library** + Vitest | Consultas por comportamiento de usuario, ~10M descargas |
| E2E (navegador real) | **Playwright** | 70% de share en proyectos nuevos, auto-wait (sin flakiness), Chromium+Firefox+WebKit, trace viewer, gratis |
| Legacy / no-Vite | Jest (mantener si ya existe) | Aún 18M descargas pero adopción en proyectos nuevos ≈ 0 |

### Comparativa de candidatos para ESTE repo

| Framework | Capa | Gratis sin tarjeta | Ideal si... | En CiszuNetwork |
|---|---|---|---|---|
| **Vitest** 3.x | Unit/Integración | ✅ MIT | Vite/ESM/TS, Next.js, packages | **Recomendado (unit/integration)** |
| **Playwright** 1.50+ | E2E/API/Component | ✅ Apache-2.0 | navegador real, flujos críticos | **Recomendado (E2E mínima)** |
| **Testing Library** | Componentes React | ✅ MIT | testear UI por comportamiento | ✅ componente sets en @ciszu/ui |
| **Jest** 30 | Unit | ✅ MIT | proyectos ya de Jest, presets | ❌ no aporta vs Vitest (más lento, ESM problemático) |
| **Cypress** 14 | E2E | ✅ free tier local | DX interactivo | ⚠️ Chrome-only gratis; Playwright lo supera (WebKit) |
| **node:test** | Unit | ✅ built-in (0 deps) | contexto mínimo sin añadir deps | ✅ plan B si YAGNI puro |

### Detalles clave observados

- **Vitest usa config de Vite/Next**: al tener Turbo idempotente y TS nativo, el setup en un monorepo es trivial: `vitest.config.ts` por workspace o uno raíz con `projects`.
- **Playwright**: autoretries + auto-wait + aislamiento de contextos por test → los tests no son "flaky". Se instala sin tarjeta (`npm i -D @playwright/test` + `npx playwright install chromium`).
- **CI**: ambas corren en GitHub Actions free tier sin problemas (ubuntu-latest, cache pnpm).
- **MSW** (Mock Service Worker) es el estándar para mocks de red — interesante para el bot y muzicmania.

---

## 3. ¿Dónde aplicaría en Ciszu Network?

Análisis por proyecto (monorepo):

| Módulo | Tipo | Vale la pena testear? | Qué testear |
|---|---|---|---|
| **packages/cdn** (`@ciszunetwork/cdn`) | Lógica pura (resolver, encodePath, forceCdn/forceLocal) | ✅ **ALTO** (unit) | `encodePath`, `assetResolver.resolve`, `resolveIcon` con/sin flags — ramas condicionales ideales para Vitest |
| **packages/ui** (`@ciszu/ui`) | Componentes React compartidos | ✅⭕ MEDIO (componentes) | Icon.tsx (inline/fallback/recall), icon-registry (duplicados, nombres válidos) |
| **packages/utils / config** | Helpers | ✅ ALTO (unit) | funciones puras — bajo nº de tests |
| **MuzicMania website** | Next + Supabase REST + auth + juego | ✅ ALTO (unit lógica) ⚠️ E2E sensible (auth) | `track_id` vs `song_id`, scores REST, `maybeSingle` (406) — lógica de fetch aislada con MSW; E2E solo si se automatiza login |
| **Ciszubot (bot Discord)** | Discord.js + economía + niveles + giveaways | ✅ ALTO (unit lógica) | `economy`, `levels`, `configService` (caché), `giveaways` (timers), `statsServer` (`/api/stats`, `/api/votes`) — funciones puras de servicios con payloads mock de Discord.js |
| **Ciszubot dashboard** | Next.js + OAuth + Supabase | ⚠️ MEDIO (E2E opcional) | login OAuth real es difícil en CI — dejar para E2E con Playwright + cookies de juego, o omitir |
| **ciszunetwork / ciszukoantony websites** | Landing informativos con fetch server-side | ❌ BAJO | puramente estáticos (`images.unoptimized`) sin lógica de negocio — tests aquí serían cobertura sin valor real |
| **Supabase SQL (funciones PL/pgSQL)** | RPC/triggers | ⚠️ (ya cubierto) | Ya se validan con Bruno (`pnpm api:test`) contra prod + Advisors en Dashboard — no duplicar |

---

## 4. ¿Es sobreingeniería? ¿Es realmente útil? ¿Es necesario AHORA?

### ¿Es sobreingeniería? — Depende del alcance:

- **SÍ sería sobreingeniería**: instalar Vitest+Playwright+Testing Library+MSW en las 4 webs y exigir cobertura E2E de todo el SPA, o tests de snapshot de páginas Landing estáticas. También lo sería para un sitio de 3 páginas con contenido casi estático.
- **NO es sobreingeniería** para: `packages/cdn` (resolver), `packages/ui` (Icon fallback), bot services (economía/giveaways con timers), MuzicMania REST (bugs reales de `track_id` ya ocurridos en jul 2026). Esa es lógica de negocio — barata de testear (unit, sin navegador) y con **bugs reales ya encontrados** en este repo (mismatch `song_id`/`track_id`, HTTP 406 `.single()`, `[!!]` mimetypes del CDN...).

**Juicio**: la adición de Vitest a `packages/*` + bot services es **baja fricción / alto valor**. Playwright es un añadido posterior (E2E de luz) sin drama.

### ¿Es realmente útil aquí?

- El repo ya demostró regresiones reales que tests unitarios habrían pillado (`track_id` vs `song_id`, mimetypes CDN, `.single()` 406). Algo de cobertura de este tipo haría que no se repitan.
- Los 4 sites despliegan desde `main` automáticamente → **cada push puede romper producción sin nadie en el medio.** Un CI que corre tests de lógica + build es la red de seguridad que falta hoy.
- El capítulo más valioso es el de **`packages/*` y pozos lógicos del bot**, no el de E2E sobre landing pages.

### ¿Es necesario actualmente (ago 2026)?

| Pregunta | Respuesta honesta |
|---|---|
| ¿Arriesga producción hoy? | No — todo funciona en prod (builds 4/4 OK, Bruno 5/5 checks). |
| ¿Hay riesgo acechando? | Sí, latente: los 4 sites despliegan desde main sin tests, refactors planeados (WebP/AVIF, Redis cache), dashboard OAuth, muzicmania REST (historia de bugs). |
| ¿Cuándo se vuelve "necesario"? | Al crecer la superficie (nueva funcionalidad, refactors de `packages/cdn` con el plan AVIF/Redis), o al añadir un segundo dev. |
| Veredicto | **No urgente hoy, pero en 1-2 sprints el ROI supera el costo.** Empezar solo con unit tests de lógica (Vitest) — mirando a Playwright para E2E de flujos críticos. |

---

## 5. Plan de implementación por fases (recomendado)

> Fases independientes: cada una puede pararse sola. La **Fase 0** es la del mínimo valor-costo.

### Fase 0 — Vitest en raíz para `packages/` (≈ 1-2 horas)

1. `pnpm add -D -w vitest`
2. `vitest.config.ts` en raíz con `projects` (package por package) o `test.include: ['packages/**/*.test.ts']`
3. Tests de ejemplo (valor real):
   - `packages/cdn/src` : `encodePath` (espacios, acentos), `assetResolver.resolve` (forceCdn/forceLocal)
   - `packages/ui` : registry de iconos (sin colisiones de nombre), `Icon` smoke con happy-dom
4. Script raíz: `"test": "vitest run"` — CI job nuevo `test` (parecido al job `lint` actual).

### Fase 1 — Testing Library para `@ciszu/ui` (≈ 1-2 horas)

1. `pnpm add -D -w @testing-library/react @testing-library/jest-dom happy-dom`
2. Tests del sistema Icon: **inline vs CDN fallback vs recall local**, casos de estilo outline↔filled.
3. Opcional: ejecutar vitest con `jsdom` si algún componente necesita DOM completo.

### Fase 2 — Lógica del bot Ciszubot (≈ 3-4 horas)

1. Vitest en `projects/ciszubot/discord-bot` (workspace de bot ya TS puro — cero conflictos).
2. Mocks de `discord.js` (payloads `Message`, `Guild`, `Interaction` parciales).
3. Tests de: `economy` (wallets/transacciones), `levels` (XP + cooldown), `configService` (caché), `giveaways` (timers reanudación), `statsServer` (HTTP con fetch mock).
4. CI job para el bot (`--filter ciszubot test`).

### Fase 3 — Playwright E2E mínimo (≈ 2-3 horas) — **DIFERIBLE**

1. `pnpm add -D -w @playwright/test` + `npx playwright install chromium`.
2. `playwright.config.ts` con `webServer` (Next start en :3000) o solo contra Vercel prod (los IDs de prod).
3. **Un solo suite E2E**: `test/website/e2e/smoke.spec.ts` que recorra:
   - `ciszunetwork.vercel.app` → título + hero + logos CDN (arregla el caso de logos 404)
   - `ciszubot.vercel.app` → badge de estado en vivo + redirecciones a Dashboard → login Discord (solo assert de redireccion)
   - `muzicmania.vercel.app` → home + leaderboard
4. CI job `e2e` (2 workers). **NO automatizar** auth OAuth ni lógica (flaky + caro + poco valor aquí).

### Fase 4 — (Opción) `node:test` para scripts heredados (≈ 30 min)

Si aún así se quiere algo YAGNI-max minimalista: tests con `node:test` (0 deps) para los scripts más críticos: `upload-cdn` (lógica de mimetypes). Sin deps nuevas, sin configuración.

---

## 6. Decision final (tabla punto por punto)

| Pregunta del toDo | Respuesta |
|---|---|
| ¿Cuál es el mejor framework gratuito y sin tarjeta al inicio? | **Vitest (unit/integration) + Playwright (E2E)** y **Testing Library** para componentes. 100% MIT/Apache-2.0, sin cloud, sin tarjeta. **node:test** como variante 0-deps. |
| ¿En dónde podemos usarlo? | `packages/*`, bot Discord, muzicmania (lógica REST), y eventualmente E2E smoke en las webs |
| ¿Es sobreingeniería? | Solo si se aplica de forma masiva a landing estáticas o snapshots de dashboards. Con alcance acotado (lógica) **es buen costo-beneficio**. |
| ¿Es realmente útil? | Sí: ya hubo regresiones reales (`track_id`, CDN mimes, `.single()` 406) que un Vitest habría cazado. Actualmente el CI solo hace lint. |
| ¿Es necesario ahora? | **No es urgente** (todo funciona en prod), pero el costo de empezar (Fase 0) es ~1-2 h y el valor gana al crecer la superficie. |
| ¿En qué proyectos se aplica? | Fase 0-1: `packages/cdn` + `packages/ui`. Fase 2: `ciszubot` bot. Fase 3: MuzicMania (unit lógica). E2E: 4 webs solo smoke (diferible). |

---

## 7. Notas riesgo / contrario

- **Playwright descarga browsers (~100-300 MB)**: choca con el gotcha de disco del PC (si se corre local, apuntar la caché a E: con `PLAYWRIGHT_BROWSERS_PATH`).
- **No usar snapshots de UI** (frágiles con los cambios visuales constantes en esta fase de diseño neon).
- **Vitest en un monorepo con Turbo**: usar `pnpm --filter <pkg> test` por módulo para no perder la caché de Turbo — no un mega `vitest run` en raíz que reejecute todos los packages.
- **MuzicMania REST**: simular la API de Supabase con MSW en los tests. `.single()` 406 ya está solucionado — un test lo fija.
- **No testear `next build`** (ya cubierto por los workflows de deploy) ni depender de Vercel en tests E2E (externo, fuera de nuestro control).

---

## 8. Estado de implementación (8 ago 2026) ✅

Implementado por el agente en una sesión, validando con Ciszuko Antony:

| Fase | Qué se hizo | Estado |
|---|---|---|
| **0 — Vitest para packages** | `vitest` + `vitest.config.mts` raíz. Tests de **`@ciszunetwork/cdn`** (20): `encodePath` (espacios/acentos/`%`), `assetUrl`, `getContentType`, `resolveIcon` (local/CDN/forceLocal/forceCdn), `AssetResolver`/`resolveAssetPath`, `cdnUrl`, `CDN_CONFIG`. Modos local (NODE_ENV=test) y remoto (`vi.stubEnv + VERCEL=1` + dynamic import) en archivos separados. | ✅ |
| **1 — Testing Library para `@ciszu/ui`** | 12 tests `happy-dom`: registry generado (estructura viewBox/inner, `getIcon`, `iconUtils`) + `Icon` (inline-first, fallback de estilo outline↔filled, `<img>` remoto, **recall local** al fallar el CDN, ocultación con span, `IconButton`, `IconList`). `setup.ts` con jest-dom. | ✅ |
| **2 — Lógica del bot Ciszubot** | 49 tests `node`: `levels` (xpForLevel/levelFromXp/addXp/getLevel/getTopLevels), `economy` (wallets, clamps, transacciones, formatMoney), `configService` (defaults, cache singleton, serialización JSON de arrays, invalidate, getPrefix), `giveaways` (end: excluye al bot, sin canal → solo marca ended; schedule con fake timers; start + insert), `statsServer` (HTTP real con puerto efímero: `/api/stats`, `/api/update-stats`, auth 401 del webhook DBL). Supabase mockeado con un **query-builder encadenable** (`tests/helpers/db.ts` — métodos intermedios devuelven thenable+builder; terminales resuelven `{data, error}`). | ✅ |
| **3 — Playwright E2E smoke** | `@playwright/test` + `playwright.config.ts` + `test/website/e2e/smoke.spec.ts` (4 tests contra producción): 200 de las 4 webs, héroes visibles, **0 imágenes rotas** en ciszunetwork (scrollear para lazy-load), badge de estado en vivo de ciszubot. Chromium en `.opencode/temp/playwright-browsers` (no C:, fijado en el config). | ✅ |
| **4 — (opcional) node:test para scripts** | No ejecutado — se dejó para una sesión futura si los scripts críticos cambian. | ⏸️ diferido |

**Comandos**:
```bash
pnpm test         # Vitest: 9 archivos / 81 tests (cdn + ui + bot)
pnpm test:watch   # modo watch
pnpm test:ui      # panel VISUAL en el navegador (http://localhost:51204/__vitest__/)
pnpm e2e          # Playwright: 4 smoke tests contra producción
```
> ⚠️ `pnpm e2e` local usa `PLAYWRIGHT_BROWSERS_PATH` fijado en el config a `E:\Ciszu Network\.opencode\temp\playwright-browsers` (ya no hace falta exportarlo).

**CI** (`.github/workflows/ci.yml`): nuevo job `unit-tests` (pnpm install + `pnpm test`) en ubuntu-latest. El E2E se queda local para no depender de producción desde CI.

**Notas de implementación**:
- `vitest.config.mts` (raíz): `configLoader` nativo exige `.mts`; si se usa `vitest.config.ts` aparece un warning (ESM en CJS). `setupFiles` globales: `packages/ui/tests/setup.ts` (jest-dom/vitest) y `projects/ciszubot/discord-bot/tests/setup.ts` (`LOG_LEVEL=error` para silenciar el logger).
- El **tsconfig raíz** (`tsconfig.json`) se creó VACÍO (`include: []`) como base para vitest/esbuild del monorepo — las apps/paquetes siguen usando sus propios tsconfig. NO añadir rutas ahí.

---

## 9. Pruebas en local de las webs (dev console)

Una parte del "testing" es la **prueba visual y funcional en local** de las 4 webs sin
desplegar. Se resuelve con la consola de desarrollo (`test/website/debug/dev_console.ps1`)
que encuadra `next dev` por web con puerto fijo:

| Web | Puerto | Filtro pnpm |
| --- | --- | --- |
| Ciszu Network | 3000 | `ciszunetwork-website` |
| Ciszuko Antony | 3001 | `ciszukoantony-website` |
| CiszuBot | 3002 | `ciszubot-website` |
| MuzicMania | 3003 | `muzicmania-website` |

**Comandos rápidos**:

```bash
pnpm dev:console       # TUI interactiva (flechas) de la consola
pnpm dev:all           # encender las 4 webs (puertos 3000-3003)
pnpm dev:stop          # detener las 4 webs
pnpm dev:status        # estado de puertos ([ON]/[OFF])
pnpm dev:log -- <web>  # log en vivo de una web (network|antony|ciszubot|muzic)
```

**Equivalentes PowerShell**: `devcon`, `devall`, `devstop`, `devstatus`, `devlog <web>`.

**Modo CLI directo** (para el agente/automatización):

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File test/website/debug/dev_console.ps1 -Action start -Web network
powershell -NoProfile -ExecutionPolicy Bypass -File test/website/debug/dev_console.ps1 -Action status
powershell -NoProfile -ExecutionPolicy Bypass -File test/website/debug/dev_console.ps1 -Action log -Web ciszubot
```

**Relación con el resto del sistema de tests**:

| Necesidad | Herramienta |
| --- | --- |
| Prueba visual/funcional local (frontend) | Consola dev (`devcon`/`pnpm dev:all`) |
| **Verificación de compilación/bundling local** | **`next build` / `pnpm <web>:build`** — capa 0, la compilación ES un test |
| Unit / integración de lógica | `pnpm test` (Vitest) |
| Componentes `@ciszu/ui` aislados | Storybook (`sb`) + `test:storybook` |
| Smoke E2E contra producción | `pnpm e2e` (Playwright) |

**Guardas de producción**: Cloudflare Guard y Turnstile solo bloquean en producción; en
dev local no interfieren, así que la prueba local de seguridad (CSP/turnstile) se hace de
forma básica y la validación final contra la web desplegada.

**Skills del agente aplicables** (catálogo en `MODELS_SKILLS_SYSTEM.md`): `test-driven-development`
(tests antes del código de implementación), `verification-before-completion` (evidencia real
—build/lint/test verdes— antes de afirmar "listo"), `webapp-testing` (Playwright para
verificar UI local, screenshots y logs), `systematic-debugging` (causa raíz en fallos de
test). Opcionales y bajo demanda; no sustituyen los comandos de este doc.

Detalle operativo completo en `DEV_CONSOLE_SYSTEM.md`, diagnóstico en `DEBUGGING_SYSTEM.md`
y reglas obligatorias en `LOCAL_TESTING_PROTOCOLS.md`.

---

## 9A. Next.js como framework de testeo local (la capa 0)

Como usamos Next.js para compilar en local, `next build` **es también un framework de
testeo**: valida que la aplicación compila, tipa en runtime de páginas y no rompe rutas.
Los workflows de Vercel corren `next build` al desplegar, pero verificar antes del push
evita deploys rotos (y fallos en cadena porque `packages/**` re-despliega las 4 webs).

**Dónde encaja en la pirámide de tests:**

```
Línea de verificación local (por capa, barata → cara):
1. next build / next dev   ← compilación + tipos (sin navegador)  [capa 0]
2. pnpm test (Vitest)      ← lógica unit/integration              [capa 1]
3. Storybook territories   ← componentes @ciszu/ui aislados        [capa 1.5]
4. pnpm e2e (Playwright)   ← navegador real contra producción      [capa 2]
```

- **Qué atrapa**: imports inexistentes, tipos erróneos en páginas/componentes server,
  mezcla client/server mal declarada, rutas dinámicas inválidas, errores de build de
  Turbowrap/Tailwind.
- **Qué NO atrapa**: comportamiento lógico (eso es Vitest), interacción visual real (eso es
  Playwright / dev local en el navegador).
- **Cuándo correrlo**:
  - Siempre que la tarea toque frontend o `packages/**` (un cambio ahí re-despliega las 4 webs).
  - Antes del push de cualquier feature: `pnpm build` (turbo, todas las apps) o
    `pnpm --filter <web> build` para una sola web.
- **Comando**: `pnpm --filter <web> build` (p. ej. `ciszunetwork-website`) o `pnpm build` (todas).
- **Regla**: no reportar una tarea de frontend como terminada sin que la web compile en local
  (`next build` OK o `[ON]` en la consola dev). Ver `LOCAL_TESTING_PROTOCOLS.md` §3.3.

---

## Referencias

- Vitest official: https://vitest.dev/guide/comparisons
- Playwright docs: https://playwright.dev/docs/intro
- State of JS 2024 (surveys): https://stateofjs.com
- PkgPulse guides (mar 2026): JavaScript Testing in 2026
- Artículo "JavaScript Testing in 2026: The Complete Guide" (QA skills)
- Repo actual: CI = lint (matrix 3 webs) + semgrep + `unit-tests` (Vitest); `pnpm api:test` (Bruno, prod checks); `pnpm e2e` (Playwright, local)

---

## 10. FULL_TESTING — Roles y especializaciones de QA (Ecosistema Ciszu)

> **Definición**: roles operativos de testing/QA definidos para el ecosistema Ciszu Network. Cada rol tiene responsabilidades, herramientas, métricas y entregables claros. Se usan en combinación según la fase del proyecto y el tipo de release.

---

### 10.1 BETA FIELD TESTER AND TASTER (Tester de campo y degustación)

**Objetivo**: validar la experiencia real de usuario en condiciones de producción (o staging real) antes de releases mayores.

| Responsabilidad | Descripción |
|---|---|
| **Prueba de usabilidad real** | Navegar, jugar, interactuar como usuario final sin guiones; reportar fricciones, confusión, tiempos de carga percibidos |
| **Compatibilidad de hardware** | Probar en dispositivos variados (móvil, tablet, desktop, navegadores: Chrome, Firefox, Safari, Edge) |
| **Condiciones de red** | Probar en 3G/4G/5G, WiFi inestable, offline-first (PWA), throttle CPU/Network (DevTools) |
| **Accesibilidad real** | Navegación solo teclado, lectores de pantalla (NVDA/VoiceOver), contraste real, zoom 200% |
| **Degustación de features** | "Probar el sabor" de nuevas mecánicas (juego, UI, flujo) — feedback cualitativo: ¿divierte? ¿frustra? ¿claro? |

**Herramientas**: Dispositivos físicos + BrowserStack (si budget) + DevTools throttle + NVDA/VoiceOver + checklist WCAG 2.1 AA.

**Entregable**: Informe "Field Report" (markdown en `test/field-reports/`) con: hallazgos críticos, UX issues, sugerencias, puntuación subjetiva (1-10) por dimensión.

**Cuándo**: Pre-release mayor (vX.Y.0), features experimentales, redesigns UX.

---

### 10.2 UX/UI AND BUGS RESEARCHER (Investigador de UX/UI y Bugs)

**Objetivo**: investigación sistemática de problemas de interfaz, flujos rotos, inconsistencias visuales y bugs funcionales.

| Responsabilidad | Descripción |
|---|---|
| **Auditoría visual sistemática** | Recorrer todas las páginas/estados (loading, error, empty, success) con checklist visual: tokens, spacing, tipografía, responsive breakpoints |
| **Regression testing visual** | Comparar capturas antes/después (Percy/Chromatic o manual) — detectar drifts de tokens, Tailwind, CSS |
| **Bug triage & reproduction** | Reproducir issues reportados (GitHub, Discord, usuarios), aislar pasos mínimos, clasificar severidad (P0-P3) |
| **Root cause analysis** | Rastrear bug hasta raíz (código, types, API, CSP, CDN, cache) — documentar en issue con pasos mínimos + logs |
| **Heuristic evaluation** | Aplicar heurísticas de Nielsen (visibilidad, match mundo real, control usuario, consistencia, prevención error, reconocimiento vs recall, flexibilidad, estética, ayuda error, ayuda documentación) |

**Herramientas**: DevTools (Elements, Console, Network, Lighthouse), Percy/Chromatic (visual), GitHub Issues, Playwright traces, Sentry.

**Entregable**: Bug reports en GitHub (template estructurado: pasos, esperado, actual, severidad, logs, capturas, bisect commit) + "UX Audit Report" trimestral.

**Cuándo**: Cada sprint (bug triage semanal), pre-release (auditoría visual completa), post-incidente (root cause).

---

### 10.3 SEARCH ENGINE OPTIMIZATION IMPROVEMENT (Mejora SEO)

**Objetivo**: maximizar visibilidad orgánica, Core Web Vitals y indexing de todas las webs del ecosistema.

| Responsabilidad | Descripción |
|---|---|
| **Technical SEO audit** | Screaming Frog (CLI) + scripts `seo-*` → crawl completo: status codes, redirects, canonical, hreflang, sitemap, robots.txt, meta tags, structured data (JSON-LD) |
| **Core Web Vitals optimization** | LCP < 2.5s, CLS < 0.1, TBT < 200ms, INP < 200ms — optimizar: imágenes (WebP/AVIF, sizes), fonts (preload, subset), JS (code-splitting, defer), CSS (critical), server (TTFB, caching) |
| **Content & Keyword strategy** | Keyword research (Ahrefs/SEMrush free tier + Google Search Console queries) → content briefs para blog técnico, landing pages, docs públicas |
| **Indexing & Coverage** | Search Console: coverage report, URL inspection, sitemap submission, removals, enhancements (breadcrumbs, FAQ, how-to, video) |
| **Structured data (Schema.org)** | JSON-LD válido: Organization, WebSite, WebPage, BlogPosting, VideoObject, Game (MuzicMania), SoftwareApplication (CiszuBot), Event (torneos) — validar con Rich Results Test |
| **Internationalization** | hreflang correcto (es-VE, es, en), alternates, x-default — si se añade multi-idioma |

**Herramientas**: Screaming Frog CLI (`seo-crawl`), Google Search Console, Ahrefs/SEMrush (free tier), Lighthouse CI, Rich Results Test, Schema Markup Validator, PageSpeed Insights.

**Entregable**: "SEO Audit Report" mensual (markdown en `test/seo-reports/`) + tareas priorizadas en GitHub + dashboard Looker Studio (GA4 + Search Console).

**Cuándo**: Mensual (auditoría completa), pre/post deploy mayor (regression CWV), tras cambio de contenido/estructura.

---

### 10.4 QUALITY CONTROL INSPECTOR (Inspector de Control de Calidad)

**Objetivo**: guardián de los "quality gates" — asegurar que nada roto, inseguro o fuera de estándar llegue a main/producción.

| Responsabilidad | Descripción |
|---|---|
| **Quality Gates enforcement** | Hacer cumplir: `pnpm lint` (0 errors), `pnpm exec tsc --noEmit` (0 errors), `pnpm test` (Vitest pass), `pnpm build` (todas las apps), `pnpm e2e` (smoke pass), `pnpm audit --prod` (0 high/critical), `securityheaders.com` A+ |
| **Release sign-off** | Checklist pre-merge/release: todos los gates verdes + changelog actualizado + version bump + docs sincronizadas + secrets rotados si aplica |
| **Dependency health** | `pnpm audit --prod`, `pnpm outdated`, `license-checker` (solo MIT/Apache/BSD), `depcheck` (no unused deps) — alertar si CVE crítico |
| **Security posture** | `securityheaders.com` A+, CSP estricto, CSP nonce en inline scripts, HSTS, Referrer-Policy, Permissions-Policy, no secrets en build output |
| **Documentation drift** | Verificar que docs reflejan código actual (cross-refs, snippets, changelog, API docs) — `pnpm docs:verify` script |

**Herramientas**: GitHub Actions (quality gates), Dependabot/Snyk (deps), `securityheaders.com`, `pnpm audit`, `license-checker`, `depcheck`, scripts custom (`pnpm docs:verify`).

**Entregable**: "QC Report" por release (pass/fail por gate, excepciones documentadas con due date) + bloqueo de merge si gate crítico falla.

**Cuándo**: Cada PR (CI), pre-merge a main, pre-release tag, auditoría mensual de dependencias.

---

### 10.5 Matriz de roles por fase de release

| Fase | Beta Field Tester | UX/UI & Bugs Researcher | SEO Improvement | QC Inspector |
|---|---|---|---|---|
| **Feature branch** | — | Code review + visual diff | — | CI gates (auto) |
| **Staging/Preview** | ✅ (2-3 testers) | ✅ Audit visual + bug hunt | CWV check | ✅ Gates obligatorios |
| **Pre-release (RC)** | ✅ Field test real | ✅ Heuristic eval + bug triage | SEO audit completo | ✅ Sign-off obligatorio |
| **Post-release (24-48h)** | Monitor real users | Monitor Sentry + feedback | Search Console check | Monitor gates + rollback ready |
| **Mantenimiento** | Trimestral | Semanal (bug triage) | Mensual | Mensual (deps, security) |

---

### 10.6 Integración con CI/CD

```yaml
# .github/workflows/ci.yml (extracto)
jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Typecheck
        run: pnpm exec tsc --noEmit
      - name: Unit tests (Vitest)
        run: pnpm test
      - name: Build all apps
        run: pnpm build
      - name: Security audit
        run: pnpm audit --prod
      - name: License check
        run: pnpm exec license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;BSD-2-Clause;ISC'
      - name: Security headers check
        run: |
          curl -s https://securityheaders.com/?q=${{ secrets.VERCEL_URL }} | grep -q "A+" || exit 1
```

**Regla**: ningun merge a `main` sin que todos los quality gates pasen (`QC Inspector` aprueba). El `QC Inspector` (rol) puede ser automatizado (CI) + revisión humana para releases.

---

_Última revisión: 30 ago 2026._