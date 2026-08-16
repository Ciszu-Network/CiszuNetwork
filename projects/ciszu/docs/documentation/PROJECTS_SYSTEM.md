# PROJECTS_SYSTEM — Sistema de Proyectos del Ecosistema (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-16
Identificador: PROJECTS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: documento maestro de los proyectos de Ciszu Network. Fusiona la vista
> general (Projects), el estado detallado (Project State) y el historial cronológico
> (Project History) en un solo sistema. Es la fuente de verdad de qué existe, en qué
> estado está y qué se ha hecho.

---

## 1. Proyectos del ecosistema

| Proyecto | Ubicación | Tipo | URL (Vercel) | Filter pnpm |
|---|---|---|---|---|
| **CiszuNetwork Page** | `projects/ciszu/website` | Web principal Next.js 15 | ciszunetwork.vercel.app | `ciszunetwork-website` |
| **Ciszuko Antony Portfolio** | `projects/ciszukoantony/website` | Portfolio personal Next.js 15 | ciszukoantony.vercel.app | `ciszukoantony-website` |
| **MuzicMania** | `projects/muzicmania` | Juego de ritmo: web + Tauri desktop + mobile (placeholder) | muzicmania.vercel.app | `muzicmania-website` |
| **CiszuBot** | `projects/ciszubot` | Bot Discord.js + landing Next.js 15 | ciszubot.vercel.app | `ciszubot-website`, `ciszubot` |
| **CiszuGamens** | `ciszugamens/` | Comunidad gaming / Discord server (legacy) | — | — |
| **Ciszuko Antony (brand)** | `ciszukoantony/` | Identidad personal / content creator (Twitch, YouTube) | — | — |
| **@ciszunetwork/cdn** | `packages/cdn` | Resolver de assets + iconos + deliveryVariants | — | — |

### 1.1 CiszuNetwork Page

- **Filtro pnpm:** `ciszunetwork-website`
- **URL:** ciszunetwork.vercel.app
- **Framework:** Next.js 15 (App Router) + Tailwind v4
- **Estado:** ✅ Activo — despliega desde `main` (GitHub Actions → Vercel)
- **Docs:** docs/ (root) multi-formato + documentation/ completa

### 1.2 Ciszuko Antony Portfolio

- **Filtro pnpm:** `ciszukoantony-website`
- **URL:** ciszukoantony.vercel.app
- **Framework:** Next.js 15 (App Router) + Tailwind v4
- **Estado:** ✅ Activo
- **Docs:** projects/ciszukoantony/docs/ multi-formato
- **Media:** content/ (fuente maestra de logos en content/logos)

### 1.3 MuzicMania

- **Filtro pnpm:** `muzicmania-website`
- **URL:** muzicmania.vercel.app
- **Framework:** Next.js 15 + Tauri 2 (Rust)
- **Versions:** website (web), launcher (desktop, Windows), mobile (placeholder)
- **Content:** arrowskins, logos, music (genesis_neon), particleskins
- **Icons:** 5.194 SVGs en shared/icons/
- **Estado:** ✅ Activo — REST corregido (schema muzicmania), auth Supabase, scoreboard cacheado
- **Docs:** projects/muzicmania/docs/ multi-formato

### 1.4 CiszuBot

- **Filtro pnpm:** `ciszubot-website` (website), `ciszubot` (bot)
- **URL:** ciszubot.vercel.app
- **Framework:** Next.js 15 (website) + Discord.js v14 (bot, TS)
- **Estado:** ✅ Activo — bot v3.2.0 (72 comandos, 9 categorías), Drizzle ORM + Supabase conectado
  (schema ciszubot, heartbeat `bot_status`), dashboard OAuth, Docker (node:24-alpine)
- **Panel:** NestJS + Fastify :5000 (stats + /api/votes; Express eliminado en F2)
- **Docs:** projects/ciszubot/docs/ multi-formato

### 1.5 CiszuGamens

- **Tipo:** Comunidad gaming / Discord server (legacy)
- **Estado:** ✅ Comunidad activa
- **Docs:** ciszugamens/docs/ multi-formato

### 1.6 @ciszunetwork/cdn

- **Tipo:** Paquete npm compartido
- **Función:** Resolver de assets e iconos + sistema de formatos (deliveryVariants)
- **Integración:** Supabase Storage (bucket: ciszu-cdn)
- **Estado:** ✅ Activo

---

## 2. Estado del ecosistema (ago 2026)

### 2.1 Sistemas

| Sistema | Estado |
|---|---|
| 4 websites en producción (Vercel) | ✅ Despliegan desde `main` (GitHub Actions) |
| CDN Supabase Storage `ciszu-cdn` | ✅ 7.353 objetos / 160.6 MB (16% de cuota; bucket legacy `ciszu-assets` eliminado 10 ago 2026) |
| Sistema de formatos (avif/webp/opus) | ✅ Implementado (8 ago 2026) + `SmartImage` en las webs |
| PWA (manifest + sw + botón instalar) | ✅ Las 4 webs |
| Auth Supabase (MuzicMania) | ✅ REST corregido, RLS activo |
| Bot de Discord | ✅ v3.2.0, 72 comandos, Supabase conectado (heartbeat `bot_status`) |
| Caché multi-tienda | ✅ Implementado (9 ago 2026) — memoria → KV Upstash (`upstash-kv-ciszunetwork`) → Postgres `ciszu.cache` |
| Monitoreo externo | ✅ UptimeRobot 5 monitores + watcher ntfy (10 ago 2026) |
| Cloudflare (standalone) | ✅ Web Analytics + Turnstile en las 4 webs |
| Seguridad | ✅ RLS 28/28 tablas, migración 16 aplicada, rate limits, robots.ts ×4 |
| Testing | ✅ Vitest (157 tests, 11 ago 2026) + Playwright E2E |
| Backups BD | ✅ PostgreSQL 18.4 instalado + primer backup OK (10 ago 2026) |
| Ciszubot OAuth dashboard | ⏳ Pendiente registrar callback en Discord Developer Portal |

### 2.2 Documentación

Multi-formato (TXT/MD/DOCX/PDF) en los 5 proyectos + `documentation/` con los sistemas
(nomenclatura `_SYSTEM`/`_PLAN`/`_PROTOCOLS`).

### 2.3 Scripts de automatización

| Script | Función | Estado |
|---|---|---|
| scripts/txt2md.js | TXT → MD | ✅ |
| scripts/md2office.js | MD → DOCX | ✅ (PDF falla) |
| scripts/txt2pdf.py | MD → PDF | ✅ |
| scripts/docx2pdf.ps1 | DOCX → PDF | ⚠️ Word COM hangs |
| scripts/sync-public-docs.js | docs/ → public/docs/ | ✅ |
| scripts/upload-cdn.js | CDN upload | ✅ |
| scripts/backup-db.js | Backup BD Supabase | ✅ (pg_dump ≥17 instalado) |
| scripts/delete-storage-bucket.js | Borrado masivo de buckets (protegido) | ✅ |
| scripts/generate-icon-registry.js | Regenera icon-registry.ts | ✅ |
| scripts/generate-material-icons-doc.js | Regenera MATERIAL_ICONS_PROTOCOLS | ✅ |

### 2.4 Stack tecnológico

- **Monorepo**: pnpm 10.8.1 + Turborepo
- **Web**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Desktop**: Tauri 2 (Rust + WebView2)
- **Bot**: Discord.js v14 (projects/ciszubot/discord-bot/)
- **CI/CD**: GitHub Actions + Vercel
- **Docs**: Pandoc 3.10 + Reportlab (Python)

---

## 3. Pendientes (vigentes — viven en su documentación de origen)

1. **Ciszubot OAuth**: registrar callback en Discord Developer Portal + `DISCORD_CLIENT_SECRET`
   en Vercel (ver AGENTS.md sección Ciszubot web).
2. **Tokens bot lists**: `TOP_GG_TOKEN` / `DISCORDBOTLIST_TOKEN` (código listo, sin ellos no postea).
3. **GUIDELINES/RULES/ACTA DOCX/PDF**: composición manual.
4. **DNS**: push a GitHub desde esta máquina (usuario push manual).
5. **Keys Turnstile MuzicMania**: eliminar fallbacks hardcodeados al rotar (repo privado por ahora).

## 4. Historial cronológico (changelog del monorepo)

> Este historial absorbe `PROJECT_HISTORY.md` (eliminado 13 ago 2026). Añadir aquí los
> nuevos hitos al cierre de sesión.

### 16 de Agosto, 2026 — Navbar ciszubot con paridad total de diseño (búsqueda full-width + sidebar MENÚ/IDIOMAS)

- **Buscador full-width bajo el nav**: el panel flotante de búsqueda se reemplazó por un
  panel a ancho completo que se despliega bajo la navbar (mismo sistema que ciszu y
  muzicmania): input con icono, resultados en grilla por categorías, estado vacío con
  aviso + botón "Reiniciar búsqueda" y cierre con Escape.
- **Hamburguesa siempre visible + sidebar slide-right**: el menú móvil en el nav se
  sustituyó por un panel lateral fijo con vistas `MENÚ`/`IDIOMAS` (estilo muzicmania):
  navegación con iconos, sección de cuenta (Panel / Login con Discord) e invitación con
  el degradado neon; overlay oscuro **sin blur**.
- **Selector de idioma completo**: lista `LANGS` (es/en) con banderas SVG e indicador de
  selección, accesible desde la vista `IDIOMAS` de la sidebar; el botón pill del header
  se conserva en desktop.
- **Verificado**: `tsc --noEmit` + `next lint` en verde en las 4 webs.

### 15 de Agosto, 2026 — Self-hosted runner operativo (CISZU-PC) + CI híbrido

- **Runner instalado como servicio de Windows**: `scripts/runner-install.ps1` automatiza
  descarga, checksum (SHA256), configuración con token del vault y registro de servicio con
  `config.cmd --runasservice`. Runner **online** en GitHub (licencia/cromatics) y servicio
  `actions.runner.Ciszu-Network-CiszuNetwork.CISZU-PC` arrancado (auto retardado + reinicio
  en fallo).
- **Lección clave**: `RunnerService.exe init` falla si el binPath del servicio contiene
  espacios (error -532462766). Los runners viven en `E:\actions-runners\<runner>` (sin
  espacios), no en `.opencode\runner`. El token de registro es de un solo uso y expira: se
  regenera con `gh api repos/Ciszu-Network/CiszuNetwork/actions/runners/registration-token --method POST`.
- **CI híbrido activado**: los jobs portables de `ci.yml` y los 4 deploys corren en
  `runs-on: self-hosted` local (sin consumir minutos de la organización); semgrep, gitleaks,
  security-e2e, CodeQL, DAST y uptime-watch quedan en runners hospedados de GitHub.

### 15 de Agosto, 2026 — Pulido de frontend: footers, favicons y FAB dismiss (TODO global)

- **FAB dismiss unificado (`FabDismissHint`)**: nuevo componente compartido en `@ciszu/ui`
  (aviso al cerrar un FAB con contador de 3 s, texto de reactivación desde la página y
  botón reactivar con `restoreFabButtons`). Migrados a él `InstallPdwaButton` (PDWA) y los
  `FeedbackFab` de las 4 webs (ciszu, ciszukoa, muzicmania, ciszubot). Resuelve el TODO
  "advertencias al cerrar con X" (antes solo uno de los 2 mostraba aviso y se superponía).
- **Footers ×4**: copyrights centrados con espacio inferior, créditos "hecho con amor por
  Ciszuko Antony · respaldado por Ciszu Network" con enlaces en color, rango 2024–2026 y
  icono de copyright; enlaces nav del footer en tonos adaptados al tema (ciszubot) y
  perfil de YouTube circular en el header del footer de ciszukoa.
- **Favicon error corregido (ciszu y ciszukoa)**: el `<link rel="icon">` ya no usa el
  `/favicon.ico` cacheado con el logo antiguo.
  - ciszunetwork → isotipo con fondo transparente (`ciszu_logo_isotipo_outline_zwhite_ccolor.svg`).
  - ciszukoa → perfil circular de YouTube (`youtube_canal.png`), mismo asset que el turnstile
    (el `CloudflareGuard` ahora recibe `PROFILE_PIC` en lugar del isotipo).
  - Verificado en el HTML `.next`: los icon link apuntan al CDN en ambas webs.
- **Navbar ciszu**: hamburguesa movida antes del botón Account; toggles de tema/idioma
  fuera del header (solo en la sidebar/menú); `NAV_ITEMS` con Descargas y Feedback fuera
  de la sección "Información".
- **Navbar ciszubot**: toggles de tema/idioma al header estilo muzicmania + hamburguesa en
  móvil (con las mismas opciones dentro); botón "Invitar" con texto; nav con
  `transform-gpu will-change-transform [backface-visibility:hidden]` (fix del blur bug en
  modo claro); tema oscuro por defecto (script en `layout.tsx`, cookie `ciszubot_theme`).
- **Tema claro ciszubot**: navbar y footer migrados a tokens del tema (`bg-bg`, `bg-card`,
  `bg-surface`, `text-ink`, `text-muted`, `text-faint`, `border-border`, `bg-muted/15`);
  `text-white` solo sobre gradientes vivos (neon y `#5865F2`); footers con fondo claro
  consistente (no negro). Footer con 6 redes (Discord, GitHub, YouTube, Facebook,
  Instagram, X) + toggles theme/idioma.
- **Assets**: `FACEBOOK`, `INSTAGRAM`, `X_SOCIAL` añadidas a `src/lib/i18n.ts` de ciszubot
  (URLs canónicas de `site.ts` de ciszu).
- **Verificado**: tsc ×4, lint ×4 (ciszu, ciszukoa, muzicmania, ciszubot), builds ×4 OK.

### 15 de Agosto, 2026 — Directus endurecido + errores de compilación local documentados

- **Credenciales Directus actualizadas**: el admin se cambió a `ciszunetwork@gmail.com` /
  `admin0012` con 2FA activado y proyecto renombrado a `ciszunetwork`. Token de admin
  regenerado. Todo guardado en el vault (`DIRECTUS_*` en `services/supabase/.env` →
  `.env.age` re-cifrado, bundle cifrado renew). Los seats `ADMIN_EMAIL/ADMIN_PASSWORD` del
  compose arrancan con defaults locales; las credenciales reales viven solo en el vault.
- **Errores de compilación local documentados (sin arreglar a propósito)**: al compilar
  las webs localmente hay fallos visuales/de runtime que se dejan registrados para
  referencia posterior (ver §4.2 «Problemática local conocida»). No se tocan de momento.

### 4.1 Problemática local conocida (compilación / dev local)

> Estado: **registrado, NO corregido** (decisión tomada el 15 ago 2026). Si una tarea futura
> toca estos componentes, revisar aquí antes. No es bloqueante para producción (los deploys
> funcionan), solo afecta al entorno local.

| Síntoma | Dónde | Estado | Notas |
| --- | --- | --- | --- |
| **Logos que no se resuelven** (imagen rota / 404) en varias vistas | Webs (frontend, componente de imágenes/logos) | Sin arreglar | Probable relación con resolver CDN/`@ciszunetwork/cdn` y assets locales; revisar `CDN_SYSTEM` y `SmartImage` cuando se ataque |
| **Interacciones que no responden** (botones/click sin efecto visible) | Varias páginas | Sin arreglar | Posible evento no enlazado o hydration; revisar por página al abordarse |
| **Body que no carga** en páginas enteras (solo cabecera/fondo, contenido vacío) | Páginas completas | Sin arreglar | Coincide con el patrón de rutas que dependen de assets/interacciones rotas; revisar por ruta |

> Nota de operación: no bloquear tareas productivas por esto; valoración económica de
> arreglo queda para cuando el CEO lo priorice en `TODO.md`.

### 15 de Agosto, 2026 — Docker/WSL reparado + Directus GUI local + Turnstile dev fix

- **Docker Desktop/WSL2 reparado** (corrupción del engine y del disco de datos):
  - `main/ext4.vhdx` (system del engine) no montaba con `E_ACCESSDENIED` de HCS —
    regenerado (respaldado a `.bak`).
  - `docker_data.vhdx` (21 GB, contenedores) dañado y con ACLs corruptas; ACLs
    reseteadas con `icacls /reset` (elevado) y disco regenerado (backup en
    `docker_data.vhdx.old`). Los contenedores/imágenes del bot son reconstruibles
    (Dockerfile + Supabase). Docker 29.6.2 operativo verificado con `hello-world`.
  - Nota: `wsl --unregister docker-desktop` + relanzar regen el raíz limpio.
- **Directus GUI local instalado**: `tools/directus/docker-compose.yml` con la imagen
  `directus/directus` + SQLite (volumen `./data`). Operativo en
  `http://localhost:8055` (admin@example.com / admin, primeras credenciales locales).
  `tools/directus/data/` gitignored. Directus pasa de "solo con editores" a probado
  localmente (TOOLS_EVALUATION_PLAN §4.4).
- **Turnstile ya no bloquea en dev local**: `CloudflareGuard` (`packages/ui`) solo se
  activa en producción; en `NODE_ENV=development` renderiza children directo (antes el
  overlay de verificación se quedaba para siempre en `localhost`). Override para probarlo
  puntualmente: `NEXT_PUBLIC_TURNSTILE_FORCE=1`. Tests 11/11 verdes.

### 15 de Agosto, 2026 — Better Stack logging conectado + worker Miniflare corregido

- **Cuenta Better Stack (Telemetry/Uptime) creada** y credenciales guardadas en el vault
  (`services/supabase/.env` → `.env.age`, re-cifrado age 15 ago): `BETTERSTACK_API_TOKEN`,
  `BETTERSTACK_TELEMETRY_TOKEN`, `BETTERSTACK_UPTIME_TOKEN` y `BETTERSTACK_BACKUP_1..10`
  (cupos de respaldo).
- **Logging a Better Stack implementado**: `@logtail/pino` instalado en
  `@ciszunetwork/utils` y `logger.ts` ahora añade el transporte a Telemetry en producción
  cuando existe `BETTERSTACK_TELEMETRY_TOKEN` (en dev se mantiene pino-pretty sin envío,
  para no gastar el cupo free). `TOOLS_EVALUATION_PLAN` actualizado: Better Stack pasa de
  "⚠️ Condicional" a "✅ Usar (logs)".
- **Worker Miniflare corregido**: `workers/src/index.ts` respondía 404 en `/` y
  `/favicon.ico` (solo `/health`); ahora `/` y `/favicon.ico` devuelven 200 JSON informativo.
  Verificado con `pnpm mf:dev` (200 en ambas rutas) y `mf:test` (dry-run OK).
- **`workers/.wrangler/` añadido a `.gitignore`** (estado local de Miniflare).
- **Docs**: `MONITORING_SYSTEM`, `VAULT_SYSTEM` y `TODO.md` actualizados.

### 14 de Agosto, 2026 — Evaluación de herramientas + Husky/Lint-staged + Nuqs

- **`TOOLS_EVALUATION_PLAN.md` creado** (12 candidatos, 11 secciones): veredictos sobre
  logging (Better Stack gana), bundlers (Turbopack default), validación (**zod gana** sobre
  ArkType/TypeBox), hosting (Coolify ⏸️ hasta `VPS_PLAN`), workflows (ninguno hoy), versionado
  (**Changesets** cuando toque), UI (**Radix bajo demanda**). Tabla final §10 y referencias §11.
- **Husky + Lint-Staged versionados**: pre-commit migrado de local a `.husky/pre-commit`
  (lint-staged + secretlint + gitleaks, con `core.hooksPath`), `.lintstagedrc.mjs` con ESLint
  sobre `ts/tsx` de 3 webs y `@ciszu/ui`.
- **Nuqs adoptado en MuzicMania**: `nuqs` instalado, `NuqsAdapter` en el root layout, y
  `play/page.tsx` + `library/page.tsx` migrados de `useSearchParams().get('track')` a
  `useQueryState('track')`. Build verificado OK.
- **Fix de build en `@ciszu/ui`**: `ZoomWarning.tsx` y `ScrollSpy.tsx` sin directiva
  `'use client'` usando hooks — añadida (rompía `next build` de muzicmania).
- **TODO.md**: tarea de investigación marcada como completada con resumen del veredicto.

### 14 de Agosto, 2026 — Storybook completo + componentes portados a @ciszu/ui

- **Guion de Storybook completado**: addon-docs (`Introduction.mdx`), coverage de vitest
  (`@vitest/coverage-v8`, `coverage-storybook/`), viewports globales (mobile/tablet/laptop/
  desktop) en `preview.ts`, agrupación de stories (`Atoms/` y `Molecules/`).
- **7 componentes reales portados de los proyectos a `@ciszu/ui`**: `Button`, `RichText`,
  `VinylDisc`, `ScrollSpy`, `FlagIcon`, `SocialIcon` (+ `SOCIAL_COLORS`) y `ZoomWarning` — sin
  dependencias nuevas (iconos de `ZoomWarning` inline, sin `lucide-react`). Ya exportados en
  `packages/ui/src/index.ts`.
- **34 stories en 9 componentes** (antes 5 en 2): todas pasan con `pnpm --filter @ciszu/ui
  test:storybook` (34/34, 9 archivos).
- **Secret `CHROMATIC_PROJECT_TOKEN` configurado en el repo** (Ciszu-Network/CiszuNetwork)
  desde el vault (`services/supabase/.env`); el workflow `chromatic.yml` ya está listo.
- **Push realizado**: commit `c1e9f8d` a `main`.

### 1 de Agosto, 2026 — Cierre de Sesión de Seguridad y Estándares de Ingeniería

- **Builds 4/4 corregidos**: el error `ReactNode` (doble identidad de tipos) era causado por
  `@types/react` añadido al ROOT — revertido; los types de react viven solo en `packages/ui`
  y cada app.
- **DOMPurify aplicado**: `packages/ui/src/Icon.tsx` sanitiza HTML dinámico; `SocialIcon.tsx`
  reescrito sin `dangerouslySetInnerHTML` (semgrep 0 findings).
- **Errores de consola eliminados**: 7 sitios con `.single()` → `.maybeSingle()` en muzicmania
  (406 PGRST116).
- **Migración 11 aplicada** (REVOKE EXECUTE trigger functions) vía Management API con PAT nuevo.
- **PAT viejo revocado** (cierra alerta de secret scanning).
- **Schemas expuestos**: `muzicmania, ciszubot, ciszunetwork` en Dashboard.
- **Herramientas completas**: semgrep 0 findings reales, ZAP 2.17.0 instalado + DAST probado
  (0 High / 4 Medium), secretlint + gitleaks hooks activos.
- **Configs de seguridad**: `.gitleaks.toml`, `.semgrepignore`, `trivy.yaml`.
- **Documentación**: `DEVSECOPS_SYSTEM.md` y `CODE_PRINCIPLES_PROTOCOLS.md`; SECURITY.md a v3.0.0.

### 29 de Julio, 2026 — CDN Unificado y Seguridad de Base de Datos

- **@ciszunetwork/cdn**: completado con `resolveIcon()` y `AssetResolver` (resolución híbrida CDN/local).
- **Integración en 4 websites**: todas importan `@ciszunetwork/cdn` y usan `resolveIcon()`.
- **upload-cdn.js reescrito**: subida inteligente con diff-check (compara tamaño local vs objeto).
- **backup-db.js reescrito**: Management API de Supabase + pg_dump. Script `pnpm db:backup`.
- **Seguridad DB**: 27 advertencias Security Advisor corregidas (SECURITY INVOKER, permisos
  anon revocados, initplan wrapping, policies mergeadas).
- **Protección XSS**: `escapeHtml()` en formularios de búsqueda y autenticación.
- **Protección SQLi**: validación regex en scripts que construyen SQL dinámico.
- **Migraciones 08-10**: fixes de seguridad y performance advisors.
- **Bucket unificado**: `ciszu-assets`→`ciszu-cdn` en scripts y referencias.

### 28 de Julio, 2026 — Documentación Masiva del Monorepo

- **Reestructuración completa de documentación**: todos los proyectos con docs reales en todos
  los formatos (txt, md, docx, pdf).
- **Pipeline de formatos**: `txt → md → docx → pdf` con scripts automatizados.
- **documentation reescritos**: todos los directorios `documentation/` siguiendo el modelo de
  MuzicMania.
- **public/docs/ creado**: cada website con su carpeta de documentación descargable.
- **Proyectos documentados**: CiszuNetwork, Ciszuko Antony, MuzicMania, CiszuBot, CiszuGamens.
- **Scripts creados**: `txt2md.js`, `md2office.js`, `txt2pdf.py`, `docx2pdf.ps1`, `sync-public-docs.js`.
- **Correcciones**: eliminados archivos temporales; reemplazados junctions rotos; contenido de
  MuzicMania sustituido en ciszugamens/docs.

### 13 de Agosto, 2026 — Reestructuración de Documentation (nomenclatura)

- Fusiones: `CDN_MIGRATIONS`+`CLOUDFLARE_SYSTEM`→`CDN_SYSTEM`, `PROJECTS`+`PROJECT_HISTORY`+
  `PROJECT_STATE`→`PROJECTS_SYSTEM`, `ANALYTICS_POSTHOG`→`ANALYTICS_SYSTEM` (sistema global,
  PostHog = herramienta).
- Renombrados a convención: `ART_PROTOCOLS`, `CODE_PRINCIPLES_PROTOCOLS`, `CONTACTS_PROTOCOLS`,
  `DEVSECOPS_SYSTEM`, `TAX_PLAN`, `MATERIAL_ICONS_PROTOCOLS`, `ONLINE_SERVICES_SYSTEM`,
  `TRADEMARK_PLAN`, `STATISTICS_SYSTEM`, `STATUS_SYSTEM`.
- Eliminado: `MIGRATION_HANDOVER.md` (redundante con AGENTS.md + WORKFLOW_SYSTEM).
- Creados: `COLOR_SYSTEM`, `IT_GLOSSARY_PROTOCOLS`, `FRAMEWORKS_SYSTEM`, `INSTALLERS_SYSTEM`,
  `STYLES_SYSTEM`, `BACKEND_SYSTEM`.

---

## 5. Cómo actualizar este documento

1. **Estado (§2)**: al cambiar un sistema, actualizar su fila en la tabla 2.1.
2. **Historial (§4)**: al cerrar sesión, añadir un bloque con fecha y cambios al INICIO.
3. **Pendientes (§3)**: mover a historial cuando se resuelva, añadir nuevos bloqueos.
4. Marcar "Última actualización" y actualizar `STATUS_SYSTEM.md` y `STATISTICS_SYSTEM.md`.

_Última revisión: 16 ago 2026._ Relacionado: `STATUS_SYSTEM.md`, `STATISTICS_SYSTEM.md`,
`ARCHITECTURE.md`, `WORKFLOW_SYSTEM.md`, `AGENTS.md`.
