# TESTING_SYSTEM — Framework de tests en Ciszu Network (2026)

Versión: 2.1.0
Actualización: 2026-08-16
Identificador: TESTING_SYSTEM_V2.1.0_2026_08_16_ciszunetwork

> Documento de decisión: qué framework usar, por qué, dónde aplicarlo y si es **sobreingeniería** para este monorepo.
> Estado: **IMPLEMENTADO (8 ago 2026)** — Fases 0-3 completadas (Vitest 81 tests + Playwright E2E smoke). Ver §8 "Estado de implementación".

## Resumen ejecutivo (TL;DR)

- **Recomendación**: **Vitest** (unit/integration) + **Playwright** (E2E) + **Testing Library** para componentes React. Es el stack estándar del ecosistema JS en 2026.
- **Costo**: 100% gratis y open source (MIT/Apache-2.0). **Sin tarjeta de crédito ni cuenta** — todo corre local con npm/pnpm y en GitHub Actions (free tier).
- **¿Sobreingeniería?**: hoy SÍ para las webs puramente informativas (ciszunetwork, ciszukoantony); NO para lógica compartida (`@ciszu/ui`, `@ciszunetwork/cdn`), el bot y el backend de muzicmania.
- **Estrategia correcta**: no instalar "por instalar", sino testear **lo que tiene lógica y riesgo**, dejando las páginas estáticas sin tests E2E.
- **Alternativa mínima sin dependencias**: `node:test` built-in (ya viene con Node, cero deps).

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
| Unit / integración de lógica | `pnpm test` (Vitest) |
| Componentes `@ciszu/ui` aislados | Storybook (`sb`) + `test:storybook` |
| Smoke E2E contra producción | `pnpm e2e` (Playwright) |

**Guardas de producción**: Cloudflare Guard y Turnstile solo bloquean en producción; en
dev local no interfieren, así que la prueba local de seguridad (CSP/turnstile) se hace de
forma básica y la validación final contra la web desplegada.

Detalle operativo completo en `DEV_CONSOLE_SYSTEM.md`, diagnóstico en `DEBUGGING_SYSTEM.md`
y reglas obligatorias en `LOCAL_TESTING_PROTOCOLS.md`.

---

## Referencias

- Vitest official: https://vitest.dev/guide/comparisons
- Playwright docs: https://playwright.dev/docs/intro
- State of JS 2024 (surveys): https://stateofjs.com
- PkgPulse guides (mar 2026): JavaScript Testing in 2026
- Artículo "JavaScript Testing in 2026: The Complete Guide" (QA skills)
- Repo actual: CI = lint (matrix 3 webs) + semgrep + `unit-tests` (Vitest); `pnpm api:test` (Bruno, prod checks); `pnpm e2e` (Playwright, local)