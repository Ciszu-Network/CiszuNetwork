# STATUS_SYSTEM — Estado del Ecosistema CISZU NETWORK

Versión: 2.1.1
Actualización: 2026-08-15
Identificador: STATUS_SYSTEM_V2.1.1_2026_08_15_ciszunetwork

> **Definición**: documento operativo de estado del monorepo. Se actualiza al cerrar cada
> sesión de trabajo. Refleja la foto actual de proyectos, sistemas y scripts.

## Estado actual del monorepo

### Resumen General (v3.0.0 — ago 2026)

| Proyecto | Website | App | Docs | documentation | public/docs/ |
|---|---|---|---|---|---|
| CiszuNetwork Page | ✅ Activo | — | ✅ Completo | ✅ | ✅ |
| Ciszuko Antony Portfolio | ✅ Activo | — | ✅ Completo | ✅ | ✅ |
| MuzicMania | ✅ Activo | ✅ Tauri | ✅ Completo | ✅ | ✅ |
| CiszuBot | ✅ Activo | ✅ Discord bot v3.2.0 | ✅ Completo | ✅ | ✅ |
| CiszuGamens | — | — | ✅ Histórico | ✅ | — |
| @ciszunetwork/cdn | — | ✅ Activo | — | — | — |

### Estado real (ago 2026)

| Sistema | Estado |
|---|---|
| 4 websites en producción (Vercel) | ✅ Despliegan desde `main` (GitHub Actions) |
| CDN Supabase Storage `ciszu-cdn` | ✅ 7.353 objetos / 160.6 MB (16% de cuota; bucket legacy `ciszu-assets` eliminado 10 ago 2026) |
| Sistema de formatos (avif/webp/opus) | ✅ Implementado (8 ago 2026) + `SmartImage` en las webs |
| PDWA (manifest + sw + botón instalar) | ✅ Las 4 webs |
| Auth Supabase (MuzicMania) | ✅ REST corregido, RLS activo |
| Bot de Discord | ✅ v3.2.0, 72 comandos, Supabase conectado (heartbeat `bot_status`) |
| Caché multi-tienda | ✅ Implementado (9 ago 2026) — memoria → KV Upstash (`upstash-kv-ciszunetwork`) → Postgres `ciszu.cache` |
| Monitoreo externo | ✅ UptimeRobot 5 monitores + watcher ntfy (10 ago 2026) |
| Logging centralizado | ✅ Better Stack Telemetry conectado (15 ago 2026) — `@logtail/pino` en `@ciszunetwork/utils/logger`, envía en producción con `BETTERSTACK_TELEMETRY_TOKEN` |
| Docker Desktop | ✅ Operativo (15 ago 2026, engine 29.6.2) tras reparar WSL2 (vhdx engine y de datos corruptos) |
| Directus GUI local | ✅ `tools/directus/docker-compose.yml`, `http://localhost:8055` (admin ciszunetwork@gmail.com, 2FA, proyecto `ciszunetwork`) — credenciales en vault |
| Compilación local de webs | ⚠️ Errores conocidos sin arreglar (logos sin resolver, interacciones y body de páginas que no cargan) — ver `PROJECTS_SYSTEM` §4.1 |
| Cloudflare (standalone) | ✅ Web Analytics + Turnstile en las 4 webs (guard solo en prod; en dev local no bloquea) |
| Seguridad | ✅ RLS 28/28 tablas, migración 16 aplicada, rate limits, robots.ts ×4 |
| Storybook `@ciszu/ui` | ✅ Chromatic (builds 1–5, visual) + a11y + addon-vitest + addon-designs (Figma) + themes/dark-mode/tag-badges/Visual Tests/MSW |
| Testing | ✅ Vitest (171 unit) + Playwright E2E + Storybook (component + a11y + visual) |
| Backups BD | ⏳ Requiere PostgreSQL 17 (pg_dump ≥17) instalado |
| Ciszubot OAuth dashboard | ⏳ Pendiente registrar callback en Discord Developer Portal |

### Documentación

Multi-formato (TXT/MD/DOCX/PDF) en los 5 proyectos + `documentation/` con los sistemas.

### Scripts de Automatización
| Script | Función | Estado |
|---|---|---|
| scripts/txt2md.js | TXT → MD | ✅ |
| scripts/md2office.js | MD → DOCX | ✅ (PDF falla) |
| scripts/txt2pdf.py | MD → PDF | ✅ |
| scripts/docx2pdf.ps1 | DOCX → PDF | ⚠️ Word COM hangs |
| scripts/sync-public-docs.js | docs/ → public/docs/ | ✅ |
| scripts/upload-cdn.js | CDN upload | ✅ |
| scripts/backup-db.js | Backup BD Supabase | ✅ script, ⏳ requiere pg_dump ≥17 |
| scripts/delete-storage-bucket.js | Borrado masivo de buckets (protegido) | ✅ |

### CDN Migration
| Paso | Estado |
|---|---|
| Documento CDN_MIGRATIONS | ✅ |
| Inventario de assets | ✅ |
| Subida a Supabase Storage | ✅ (ciszu-cdn espejo del repo) |
| Migración de código | ✅ (NEXT_PUBLIC_CDN_URL ×4 proyectos) |
| Limpieza de repo | ✅ (bucket legacy eliminado, EXCLUDED_EXT) |

### Stack Tecnológico
- **Monorepo**: pnpm 10.8.1 + Turborepo
- **Web**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage) + **Drizzle ORM** (`@ciszunetwork/db`, server-only) + Zod (borde de entrada)
- **CLientes dinámicos**: TanStack Query (ciszubot dashboard) + Storybook + Chromatic (dev-only, `@ciszu/ui`)
- **Runtime**: Node.js 24 confirmado (decisión 14 ago: Bun/Deno descartados para prod, ver `FULL_STACK_SYSTEM.md` §Runtime)
- **Desktop**: Tauri 2 (Rust + WebView2)
- **Bot**: Discord.js v14 + NestJS + Fastify (microservicio HTTP; Express eliminado)
- **CI/CD**: GitHub Actions + Vercel
- **Docs**: Pandoc 3.10 + Reportlab (Python)

### Herramientas Instaladas
- Node.js 24.18.0
- Python 3.14
- Pandoc 3.10
- Reportlab 5.0.0
- dbvr 26.1.4 + DBeaver CE
- Bruno 4.0.0
- Fork 2.16.1
- ZAP 2.17.0, semgrep, trivy, gitleaks, secretlint
- Vitest + Playwright

## Pendientes de infraestructura (bloqueos conocidos)

| Bloqueo | Detalle | Doc |
|---|---|---|
| Push a GitHub | DNS de este PC no resuelve github.com → push manual del usuario | `WORKFLOW_SYSTEM.md` |
| R2 Cloudflare | Requiere tarjeta → CDN activo = Supabase `ciszu-cdn` | `CDN_SYSTEM.md` |
| Ciszubot OAuth | Pendiente registrar callback en Discord Developer Portal | `PROJECTS_SYSTEM.md` |
| PDF engine | WeasyPrint requiere GTK DLLs no instaladas | `TOOLS_SYSTEM.md` |
| Word COM | Se cuelga al convertir DOCX→PDF automáticamente | `TOOLS_SYSTEM.md` |

## Cómo actualizar este documento

1. Ejecutar `pnpm build` / `pnpm test` para confirmar el estado real.
2. Actualizar tablas de proyectos y sistemas con lo verificado.
3. Registrar fecha en "ÚLTIMA ACTUALIZACIÓN".
4. Complementar con `PROJECTS_SYSTEM.md` (detalle) y `STATISTICS_SYSTEM.md` (cifras).

## Estado por proyecto (resumen)

| Proyecto | Estado | Notas |
|---|---|---|
| CiszuNetwork | Operativo | Despliega desde `main` a Vercel |
| CiszukoAntony | Operativo | Portfolio + música |
| MuzicMania | Operativo | Juego + app Tauri (NSIS) |
| CiszuBot | Operativo | Bot Discord + landing + estado en vivo |
| CDN Supabase | Operativo | `ciszu-cdn`, 7.353 objetos |
| CI/CD | Operativo | GitHub Actions: CI, CodeQL, DAST, deploy ×4, uptime-watch |

## Estado por sistema (resumen)

| Sistema | Estado | Referencia |
|---|---|---|
| Auth | Operativo | `AUTH_SYSTEM.md` |
| Base de datos | Operativo | `DB_SYSTEM.md` |
| Cacheo | Operativo | `CACHING_SYSTEM.md` |
| CDN | Operativo | `CDN_SYSTEM.md` |
| Correos | Operativo | `EMAILS_SYSTEM.md` |
| Pagos | Operativo | `PAYMENTS_SYSTEM.md` |
| Analítica | Operativo | `ANALYTICS_SYSTEM.md` |
| Errores (Sentry) | Operativo | `ERRORS_SYSTEM.md` |
| Monitorización | Operativo | `MONITORING_SYSTEM.md` |
| Seguridad | Operativo | `SECURITY_PROTOCOLS.md` |

## Últimas acciones verificadas (14 ago 2026)

- **F1** Drizzle ORM: `packages/db` (4 schemas + cliente pg lazy), migrado en webs (`muzicmania`,
  `ciszubot`) y bot; eliminado `@supabase/supabase-js` del bot. `ORM_SYSTEM.md` creado.
- **F2** Bot: `statsServer` Express migrado a **NestJS + Fastify**; dependencia `express` eliminada.
- **F3** Herramientas client: Zod (`parseJsonBody`) en todas las API routes que mutan; Storybook
  dev-only en `@ciszu/ui` (v10.5.8); TanStack Query en `ciszubot-website` (dashboard).
- **F4 (14 ago)** Chromatic: Storybook de `@ciszu/ui` publicado (build 1, 5 stories/2 componentes);
  `CHROMATIC_PROJECT_TOKEN` en vault. Decisión runtime documentada (Node 24; Bun/Deno descartados).
  Vault +2 secrets (`TANSTACK_API_KEY`, `CHROMATIC_PROJECT_TOKEN`) re-cifrado y verificado.
- **F5 (14 ago)** Guion de Storybook completado: addon-docs (`Introduction.mdx`), coverage v8,
  viewports, agrupación `Atoms`/`Molecules`. **7 componentes portados** de los proyectos a
  `@ciszu/ui` (Button, RichText, VinylDisc, ScrollSpy, FlagIcon, SocialIcon, ZoomWarning) →
  **34 stories en 9 componentes**. `CHROMATIC_PROJECT_TOKEN` fijado como secret del repo.
  Commit `c1e9f8d` pusheado a `main`.
- Verificación: lint global ✅, 171 tests ✅, builds webs+bot ✅, build-storybook ✅, test:storybook
  (34/34) ✅.
- Frontend: fases 1–11 del to-do frontend completadas y verificadas (ver `TODO.md`).
- CDN limpio (7.353 objetos) y tests en 171.

## Leyenda de estados

- **Operativo**: funciona en producción y verificado.
- **En construcción**: código activo pero incompleto o sin desplegar.
- **Pendiente**: planificado, no iniciado (referencia `*_PLAN.md`).
- **Bloqueado**: requiere algo externo (tarjeta, cuenta, decisión).
- **No aplica**: descartado o innecesario.

## Indicadores de salud del ecosistema

| Indicador | Objetivo | Fuente |
|---|---|---|
| Builds | 4/4 OK en cada push | GitHub Actions / Vercel |
| Tests | Verde con `pnpm test` | Vitest (157 al 11 ago 2026) |
| Uptime webs + bot | ≥ 99 % | UptimeRobot (5 monitores KEYWORD UP) |
| CDN | Bajo la cuota Free (≈16 % hoy) | Supabase Storage |
| Errores runtime | 0 críticos sin explicar | Sentry (org `ciszu-network`) |
| Advisors Supabase | 0 warnings pendientes | Dashboard Supabase |

## Procedimiento de actualización del documento

Este doc es una **foto del estado** del ecosistema; al cerrar sesión:

1. `pnpm build` y `pnpm test` para confirmar el estado real (no la memoria).
2. Pasar el checklist de la sección "Cómo actualizar este documento".
3. Actualizar solo celdas que han cambiado realmente; fechar los cambios nuevos.
4. Completar con `PROJECTS_SYSTEM.md` (historia) y `STATISTICS_SYSTEM.md` (cifras).

## Rutinas de mantenimiento del ecosistema

| Rutina | Frecuencia | Qué revisar |
|---|---|---|
| Backup BD | Semanal | `backup-db.js` (requiere pg_dump ≥17), ruta `archives/backups/db` |
| Limpieza CDN | Mensual / tras uploads | `upload-cdn.js --prune`, mimetypes |
| Revisión de dependencias | Semanal | `pnpm audit --prod`, Dependabot, `cargo audit` |
| DAST | Semanal (lunes) | ZAP baseline ×4 webs (`dast.yml`) |
| Revisión de docs | Fin de sesión | Cobertura ≥200 líneas + refs sin rotas |

## Recuperación ante incidencias

1. **Identificar** el síntoma: uptime abajo (ntfy), error en Sentry, 5xx en Vercel, alerta de monitor.
2. **Aislar**: curl a producción, `dbvr` a BD o logs de la función afectada.
3. **Corregir**: fix en `main` → deploy; rotar el secreto si hubo filtración (ver `DEVSECOPS_SYSTEM.md`).
4. **Registrar** la incidencia: `ERRORS_SYSTEM.md` + historial del proyecto.
5. **Aprender**: actualizar pendientes aquí y en `SECURITY_PROTOCOLS.md` si toca.

## Historial de estados (registro breve)

| Fecha | Cambio relevante |
|---|---|
| 2026-08-15 | Pulido frontend TODO global: `FabDismissHint` compartido (`@ciszu/ui`) con contador de 3 s + reactivación, migrados `InstallPdwaButton` y `FeedbackFab` ×4. Footers ×4 con copyright centrado (2024–2026), créditos "hecho con amor por Ciszuko Antony · respaldado por Ciszu Network" en color y perfil YouTube circular (ciszukoa). Favicon error corregido: ciszunetwork usa isotipo transparente y ciszukoa el perfil circular de YouTube (igual en el turnstile `CloudflareGuard`). Navbar ciszu: hamburguesa antes de Account, toggles fuera del header, Descargas/Feedback fuera de "Información". Navbar ciszubot: toggles tema/idioma al header + hamburguesa móvil, botón "Invitar" con texto, fix blur modo claro, dark default, 6 redes en footer. Tema claro ciszubot a tokens (`bg-bg/bg-card/bg-surface/text-ink/text-muted/text-faint/border-border`). tsc/lint/builds ×4 verdes |
| 2026-08-14 | F6 Evaluación de 12 herramientas documentada en `TOOLS_EVALUATION_PLAN.md` (zod gana sobre ArkType/TypeBox; Coolify ⏸️ hasta VPS_PLAN). Implementado: Husky + Lint-Staged versionados (pre-commit extiende secretlint/gitleaks) y **Nuqs** en muzicmania (`play`/`library` → `useQueryState('track')`, `NuqsAdapter` en layout). Fix `'use client'` en `ZoomWarning` y `ScrollSpy` de `@ciszu/ui` (rompía build). TODO #investigación completada |
| 2026-08-14 | F5 Storybook completo: addon-docs + `Introduction.mdx`, coverage v8, viewports, agrupación; +7 componentes portados a `@ciszu/ui` (Button, RichText, VinylDisc, ScrollSpy, FlagIcon, SocialIcon, ZoomWarning) → 34 stories/9 componentes, test:storybook 34/34; `CHROMATIC_PROJECT_TOKEN` como secret del repo; commit `c1e9f8d` pusheado |
| 2026-08-14 | F1 Drizzle, F2 NestJS+Fastify, F3 Zod/Storybook/TanStack Query, F4 Chromatic (build 1) + decisión runtime Node 24; vault +2 secrets (TanStack, Chromatic); tests 171; lint/builds verdes. Storybook: addon-vitest (interacción/regresión local con Playwright) + a11y, play functions en stories, job `storybook-tests` en CI; piloto Bun: CJS/TS nativo OK, descartado para Next/Vercel (ver FULL_STACK §Runtime). Figma: `@storybook/addon-designs` 11.1.4 (integración Storybook↔Figma vía pestaña Design + plugin "Storybook Connect"); comandos opencode (storybook/vitest/playwright/test/ciszu) + perfil PowerShell (`sb*`/`pw*`/`checkall`/`ciszuh`) probados sin colisiones. Storybook: +themes, dark-mode, tag-badges, Visual Tests (`@chromatic-com/storybook`) y MSW (`msw-storybook-addon` + worker); fix `process` en Vite (define de NEXT_PUBLIC_CDN_URL en main.ts); Chromatic builds 4–5 publicados localmente (billing suspendido); doc `UI_COMPONENTS_SYSTEM.md` creada |
| 2026-08-13 | Docs ampliados a estándar; frontend fases 1–11 completas; CDN 7.353 objetos; tests 157 |
| 2026-08-12 | Pagos: infra NOWPayments lista, monetización pendiente hasta 18 |
| 2026-08-11 | Cuenta NOWPayments creada; suite Vitest a 157 |
| 2026-08-10 | CDN legacy eliminado; migración 16 aplicada; monitoreo externo activo |

- Convención: añadir una fila por sesión con el hecho más relevante; no borrar histórico.
- El detalle sucesivo se vuelca en `PROJECTS_SYSTEM.md` y `STATISTICS_SYSTEM.md`.

## FAQ de estado

| Pregunta | Respuesta |
|---|---|
| ¿Qué significa "Operativo"? | Ver leyenda: funciona en producción y verificado |
| ¿Cuándo es "Bloqueado"? | Requiere algo externo (tarjeta, cuenta, decisión) |
| ¿Dónde está el detalle por proyecto? | `PROJECTS_SYSTEM.md` |
| ¿Dónde están las cifras? | `STATISTICS_SYSTEM.md` |
| ¿Este doc reemplaza a `STATUS.md`? | No: `STATUS_SYSTEM.md` es el operativo de la carpeta |

## Checklist de estado operativo (cierre de sesión)

- [ ] `pnpm build` + `pnpm test` verdes (cifras reales).
- [ ] Tablas de proyectos/sistemas al día con lo verificado.
- [ ] Nuevas incidencias registradas en su `*_SYSTEM.md`.
- [ ] `ÚLTIMA ACTUALIZACIÓN` fechada y `PROJECTS_SYSTEM.md` con historia.

_Última revisión: 15 ago 2026._ Relacionado: `PROJECTS_SYSTEM.md`, `STATISTICS_SYSTEM.md`,
`WORKFLOW_SYSTEM.md`, `ARCHITECTURE.md`, `FULL_STACK_SYSTEM.md`.

ÚLTIMA ACTUALIZACIÓN: 2026-08-15