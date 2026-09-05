# FULL_STACK_SYSTEM — Stack tecnológico de Ciszu Network

Versión: 2.2.0
Actualización: 2026-09-05
Identificador: FULL_STACK_SYSTEM_V2.2.0_2026_09_05_ciszunetwork

> **Definición**: inventario actual (ago 2026) de lenguajes, frameworks, sistemas operativos,
> herramientas y servicios del ecosistema completo. Fuente única del stack; detalles de
> herramientas en `TOOLS_SYSTEM.md`.

Inventario actual (ago 2026) de lenguajes, frameworks, sistemas operativos, herramientas y servicios del ecosistema completo. Fuente única del stack; detalles de herramientas en `TOOLS_SYSTEM.md`.

## Core

- **Runtime:** Node.js 20+ (PC local: Node v24.18.0; bot en Docker: Node 24 `node:24-alpine`)
- **Package Manager:** pnpm 10.8.1 (workspaces/Turbo monorepo)
- **Language:** TypeScript (strict)
- **BD:** PostgreSQL (Supabase, server 17.6 remote; PostgreSQL 18.4 local para tooling)

## Lenguajes de programación

| Lenguaje | Uso |
| -------- | --- |
| **TypeScript** | 4 webs Next.js, bot Discord.js, bot website, packages (`@ciszu/ui`, `@ciszunetwork/cdn`, `@ciszunetwork/utils`, `email`, `payments`) |
| **JavaScript** (Node) | Scripts de automatización (`scripts/`), generadores IA (`tools/`), play-dl música |
| **Rust** | Launcher/desktop app de MuzicMania (Tauri + NSIS) |
| **Python** | `convert-media.py` (derivadas AVIF/WebP/Opus), `tools/legal-ai` (openpyxl), semgrep wrapper, generadores música/video |
| **SQL (PostgreSQL)** | Migraciones, RLS, funciones RPC (schemas `muzicmania`, `ciszubot`, `ciszu`, `public`) |
| **PowerShell / cmd** | Scripts Windows (`vault.ps1`, `ciszu-ai.cmd`, `generate-pwa-icons.ps1`, `docx2pdf.ps1`) |
| **Bash** | CI/CD GitHub Actions, Docker (bot) |

## Frameworks y librerías principales

- **Next.js 15** (App Router) + **Tailwind CSS 4** + PostCSS — las 4 webs. Fonts: Geist vía next/font.
- **React 19** + TypeScript. Paquete UI propio `@ciszu/ui` (Icon, SmartImage, PwaRegister, InstallPdwaButton, CloudflareGuard, PostHogAnalytics).
- **Discord.js ^14.22** + `@discordjs/voice` + play-dl (bot, 72 comandos, 9 categorías).
- **NestJS + Fastify** — microservicio HTTP del bot (`statsServer` migrado en F2: `GET /api/stats`,
  `POST /api/update-stats`, `POST /api/votes`, `POST /api/votes/dbl`). Express eliminado.
  Ver `BACKEND_SYSTEM.md` §19.
- **Zod** — validación de inputs en el borde, centralizada en `@ciszunetwork/utils`
  (`validation.ts`). Ver `FRONTEND_SYSTEM.md` §7.3.
- **Zustand ^5.0.14** — estado global en client (ciszunetwork y muzicmania,
  `src/store/useAppStore.ts`). Ver `FRONTEND_SYSTEM.md` §7.1.
- **Supabase** (`@supabase/supabase-js`) — auth + Postgres + Storage CDN + PostgREST (navegador).
- **Drizzle ORM** (`@ciszunetwork/db`, server-only) — capa de datos server-side de webs y bot.
  Ver `ORM_SYSTEM.md`.
- **Tauri 2** + Rust — app de escritorio MuzicMania (NSIS), splash HTML/CSS/JS.
- **Vitest + Testing Library (happy-dom)** — tests unitarios; **Playwright** — E2E (ver `TESTING_SYSTEM.md`).
  Subárea **Storybook** (`@ciszu/ui`): `pnpm --filter @ciszu/ui test:storybook` corre las stories como tests de
  componente en un navegador real (Vitest browser mode + `@vitest/browser-playwright`); addon `@storybook/addon-vitest`
  + play functions cubren interacción y a11y sin Chromatic; en CI el job `storybook-tests` instala chromium y los
  ejecuta. Chromatic sigue para regresión visual en la nube. Ver `PACKAGES_SYSTEM.md` §4.
- **Sentry** (`@sentry/nextjs` ×4 webs, `@sentry/node` en bot) — errores (ver `ERRORS_SYSTEM.md`).
- **TanStack Query** (`@tanstack/react-query`) — datos client dinámicos (dashboard de ciszubot).
- **Storybook** (dev-only) — documenta `@ciszu/ui`. Ver `PACKAGES_SYSTEM.md` §4.
- **Chromatic** — visual testing de Storybook (build 1 publicado, 14 ago 2026) + addon a11y (Axe). Ver `PACKAGES_SYSTEM.md` §4.
- **Turbo (pnpm workspaces)** — monorepo builds.
- **Docker** (bot multi-stage pnpm, usuario no-root).

## Sistemas operativos usados

| OS | Dónde |
| -- | ----- |
| **Windows 11 Pro** (64-bit, build 10.0.26200) | PC de desarrollo principal (Ciszuko) |
| **Windows 10/11** | Instaladores del juego Tauri en `muzicmania-source/downloads/` |
| **Linux (Alpine)** | Imagen del bot (`node:24-alpine`) en Docker |
| **Linux (Ubuntu)** | GitHub Actions runners, ZAP/semgrep por container |

## Herramientas (CLI y GUI)

- **CLI/IDE**: VS Code, opencode (agente in-terminal), git 2.55, bash, `dbvr` (BD), `supabase` CLI, `zap`, `semgrep`, `trivy`, `gitleaks`, `secretlint`, `cargo-audit`, `ffmpeg`, `rg` (ripgrep 15.2.0), `fzf` 0.74.2, `agen` (age cryptography).
- **GUI dev**: DBeaver CE (BD), Bruno (API), Fork (Git GUI), ZAP (daemon+API), Docker Desktop, Windows Terminal, Opera GX (navegador/predeterminado + E2E), GIMP/photopea + Illustrator/Photoshop locales (diseño).
- **Productividad/creatividad**: Figma (diseño UI/UX), Canva (assets rápidos), Miro (whiteboards), Todoist (tareas), Slack (comunicación interna), ChatGPT (IA general), Gemini (voz + imagen).

## Backend / Servicios

- **Auth & DB:** Supabase (PostgreSQL, un solo proyecto `obwzzmbvkrcscqwptlqo`)
- **Storage:** Supabase Storage (bucket CDN `ciszu-cdn`, `avatars` para perfiles)
- **Client:** `@supabase/supabase-js`
- **Hosting:** Vercel (4 proyectos) + GitHub Actions (deploys y CI)
- **CDN:** Supabase Storage (`ciszu-cdn`) con edge resolver Cloudflare

## CI/CD y Seguridad (DevSecOps)

- **Platform:** GitHub Actions (workflows CI + 4 deploys + DAST semanal + uptime-watch)
- **Deployment:** Vercel (todas las webs)
- **SAST:** semgrep `p/security-audit`, CodeQL (js + rust en cada push)
- **DAST:** OWASP ZAP 2.17.0 (baseline semanal sobre las 4 webs)
- **Secrets:** gitleaks 8.30.1 (pre-commit + diff CI), secretlint 13.0.4 (pre-commit)
- **Supply chain:** `pnpm audit --prod`, `cargo audit`, trivy 0.72.0
- **Configs:** `.gitleaks.toml`, `.semgrepignore`, `trivy.yaml`, `.secretlintrc.json`
- **Doctrina:** `DEVSECOPS.md`, `CODE_PRINCIPLES.md`, `SECURITY_PROTOCOLS.md`

## Shared Packages

- **@ciszunetwork/cdn** — Asset resolver (icons, multimedia, sistema de formatos)
- **@ciszu/ui** — Componentes UI compartidos
- **@ciszunetwork/utils** — Caché, rate limiting, IAST, CSP
- **@ciszunetwork/email** — Emails (Resend)
- **@ciszunetwork/payments** — Pagos (NOWPayments)

## Tooling

- **Pandoc 3.10** — conversión de documentos (md → docx)
- **Python/pip** — PDF (reportlab), weasyprint (GTK), openpyxl
- **Windows** — plataforma principal de desarrollo
- **Runtimes:** Node 24 (bot) / Node >=20 (webs), pnpm 10.8.1, PostgreSQL 18.4 local / 17.6 remote, Rust toolchain (Tauri)

## Mapa de stack por proyecto (resumen)

| Proyecto | Stack |
|---|---|
| ciszunetwork-website | Next 15 + Tailwind 4 + Zustand + Supabase + Sentry + Turnstile |
| ciszukoantony-website | Next 15 + Tailwind 4 + Supabase + Sentry + Turnstile |
| muzicmania-website | Next 15 + Tailwind 4 + Zustand + Supabase + Sentry + Tauri 2 + PWA |
| ciszubot-website | Next 15 + Tailwind 4 + Supabase + Sentry + Turnstile + TanStack Query |
| ciszugamens-website | Next 15 + Tailwind 4 + Supabase (CDN) + Sentry + Turnstile |
| ciszubot (bot) | Node 24 + Discord.js 14 + NestJS + Fastify (stats microservice, F2) + Drizzle + Docker |
| packages/* | TS + Vitest (ui, cdn, utils, email, payments, config) |

## Versiones clave (pinning)

| Componente | Versión |
|---|---|
| Node.js (PC local) | 24.18.0 |
| Node.js (bot Docker) | 24 alpine |
| pnpm | 10.8.1 |
| Next.js | 15.x |
| React | 19 |
| Tailwind CSS | 4 |
| Zustand | ^5.0.14 |
| Zod | ^4.4.3 (en `@ciszunetwork/utils`) |
| Discord.js | ^14.22 |
| NestJS + Fastify | microservicio HTTP del bot (`statsServer`, F2 — Express eliminado) |
| Tauri | 2 |
| @sentry/nextjs / @sentry/node | 10.69.0 |
| PostgreSQL (Supabase) | 17.6 |
| PostgreSQL (local tooling) | 18.4 |

## ¿Qué NO está en el stack?

| Tecnología | Motivo |
|---|---|
| **Redis (self-hosted)** | Sustituido por caché multi-tienda (KV + Postgres) |
| **Electron** | Sustituido por Tauri (peso/RAM) |
| **Brevo/SendGrid** | Email → Supabase hoy, Resend en Fase B |
| **PostHog para errores** | Solo analítica de producto; errores → Sentry |
| **Clerk (auth)** | Supabase Auth decidido (ver `AUTH_SYSTEM.md`) |
| **Sass/SCSS** | Tailwind 4 lo cubre |
| **ORM (Prisma/Drizzle)** | **Drizzle decidido** como capa server-side (`packages/db/`); navegador sigue con Supabase/RLS (ver `ORM_SYSTEM.md` / `BACKEND_SYSTEM.md` §18) |
| **tRPC / GraphQL** | No instalados: solapan con RSC + Server Actions + PostgREST. Opción futura con disparador (API pública/multi-cliente/servicio standalone) |
| **Storybook** | Dev-only, se añadirá para documentar `@ciszu/ui` (no runtime) |
| **TanStack Query** | Incremental: solo cuando exista feature de datos client dinámico |
| **Bun / Deno** | Ver decisión de runtime §Runtime (Node 24 confirmado; no aptos para Next/Vercel) |

## Criterios de elección de tecnología

| Decisión | Alternativa descartada | Por qué esta |
|---|---|---|
| Next.js 15 + App Router | Pages Router / Vite SSR | RSC, layouts, deploys optimizados en Vercel |
| React 19 | React 18 | Versión por defecto de Next 15 |
| Zustand | Context API / Redux | Estado global ligero, selectores minimizan renders |
| Tailwind 4 | Sass/SCSS, CSS Modules | Utilities `@theme`, sin usar `tailwind.config.ts` |
| Supabase | Backend propio | BaaS con auth + BD + Storage en un solo proyecto |
| pnpm + Turbo | npm/yarn | Workspaces + build cache de Turbo |
| Tauri (Rust) | Electron | Menor RAM, menor tamaño de binario (NSIS) |
| Vitest | Jest | Nativo ESM, integrado con happy-dom para UI |

## Decisión de runtime: Node.js vs Bun vs Deno (14 ago 2026)

Evaluación con criterio AGENTS: **mantener Node.js en todo el ecosistema.** Nada se migra.

| Criterio | **Node.js (elegido)** | Bun | Deno |
|---|---|---|---|
| **Soporte Next.js 15 en Vercel** | Oficial (Node 24) | Beta (`bunVersion` en vercel.json) | No recomendado |
| **LTS / ciclo** | Node 24 "Krypton" (LTS hasta abr 2028), type-stripping estable desde 24.12 | Sin LTS formal | 2.8/2.9, compat objetivo Node 26 |
| **Compatibilidad npm** | 100 % | ~95-98 %; addons `.node` no funcionan | `npm:` imports, pnpm workspaces desde 2.9 |
| **Motores webs (Vercel)** | Node runtime de Vercel | JavaScriptCore (V8 distinto) | V8 |
| **Windows** | Soportado | Estable desde 1.3 | Soportado |
| **Agrega valor aquí** | — | Posible en scripts/tooling local (no requerido) | Posible en scripts (no requerido) |

**Decisión**: Node 24 queda como runtime único (local, bot Docker `node:24-alpine`, webs Vercel).
Bun/Deno descartados para producción (soporte Next/Vercel inmaduro). No se introducen nuevos
runtimes salvo que un problema real lo exija (YAGNI). Gotcha conocido: el binario Bun de opencode
no importa CJS desde plugins TUI → usar ESM puro (ver `OPENCODE_SYSTEM.md`).

### Piloto Bun (14 ago 2026, verificado)

Bun 1.3.14 instalado en `C:\Users\fplay\.bun\bin\bun.exe` como **herramienta local opcional**,
NO como runtime de producción. Resultado del piloto:

- Script CJS con builtins de Node (`scripts/txt2md.js`): salida idéntica a `node` ✅.
- Ejecución directa de `.ts` (type-stripping nativo, sin ts-node): OK ✅.
- Env vars y `bun run`: funcionan igual que Node.

**Conclusión**: válido como *runner* ocasional de scripts/tooling local (arranque rápido), pero
**no sustituye a Node** en webs/bot (divergencia con Vercel/Docker) ni se promueve a ningún
flujo de producción. Si se usa en `scripts/`, primero verificar el script; no añadir al PATH
global por defecto. Ver también `TOOLS_SYSTEM.md`.

## Gestión de versiones y actualizaciones

- Enfoque **pinning intencional**: las versiones clave están en la tabla "Versiones clave"; actualizar con
  criterio, nunca a ciegas (un `pnpm up -i` descontrolado rompe el monorepo).
- Antes de subir una dependencia: leer el changelog, revisar breaking changes y verificar que
  `pnpm lint`, `pnpm test` y `pnpm build` pasan en local y en CI.
- Node: mínimo 20 en webs (requisito de Next 15), 24 en el bot (Docker `node:24-alpine`).
- pnpm: v10 mantiene el `pnpm-lock.yaml` estable; cambios de lockfile se revisan en PR.
- Ruta de actualización segura: actualizar primero `packages/*` (contratos TS), luego las apps que los consumen.

## Soporte de navegadores y dispositivos

- Objetivo: **navegadores modernos evergreen** (últimos 2 años de Chrome/Edge/Firefox/Safari), sin IE.
- PWA instalable en Android y Windows; hereda el manifest + service worker de las 4 webs.
- Escritorio MuzicMania: Windows 10/11 x64 (instalador NSIS vía Tauri), WebView2.
- Dev local y E2E en Opera GX (navegador predeterminado del PC).

## Entornos y variables de entorno

| Entorno | Variables | Señal |
|---|---|---|
| Development | `.env.local` local | `NODE_ENV=development` |
| Preview | Vercel preview | env vars por proyecto (target preview) |
| Production | Vercel production + vault | env vars (target production) |

- Secretos solo `process.env.X` server-side; `NEXT_PUBLIC_` solo para URLs y datos públicos por diseño
  (ver `SECURITY_PROTOCOLS.md`).
- Las credenciales viven en el vault (`VAULT_SYSTEM.md`), nunca en código ni en fallbacks.

## FAQ de stack

| Pregunta | Respuesta |
|---|---|
| ¿Node 24 local afecta a las webs? | No: las webs corren en Vercel con Node ≥20; el 24 local es tooling |
| ¿Por qué PostgreSQL 18 local y 17 remoto? | Tooling (dbvr) más nuevo; Supabase Free usa 17.6 |
| ¿Puedo usar otra librería CSS? | No: Tailwind 4 es el estándar; CSS modules puntual si hace falta |
| ¿Cuándo usar `@ciszu/ui` vs un paquete lógico? | UI compartida → `@ciszu/ui`; lógica/negocio → el paquete que toque |
| ¿Dónde ver errores en runtime? | Sentry (org `ciszu-network`), logs de Vercel filtrando `[IAST]` |

## Checklist para introducir tecnología nueva

- [ ] ¿Resuelve un problema real? (YAGNI/KISS — ver `CODE_PRINCIPLES.md`).
- [ ] ¿Existe alternativa en el stack actual? Documentar la diferencia antes de instalarla.
- [ ] Instalar solo tras aprobación y ejecutar `pnpm audit --prod`.
- [ ] Si reemplaza algo existente, mover la fila a "¿Qué NO está en el stack?" con el motivo.
- [ ] Verificar build, lint, tests, y actualizar este documento con la nueva versión.

## Mantenimiento del stack (tareas periódicas)

- **Dependencias**: correr `pnpm audit --prod` y revisar Dependabot al inicio de cada semana; actualizar
  solo lo roto o con CVE crítica salvo petición expresa (ver `DEVSECOPS_SYSTEM.md`).
- **Runtime**: revisar versiones de Node/pnpm anunciadas (LTS) y planear saltos con criterio.
- **Docs**: mantener al día la tabla "Versiones clave" al cambiar cualquier componente.
- **Debas**: cuando se sustituye una tecnología (ej. Redis → caché multi-tienda), mover la fila a
  "¿Qué NO está en el stack?" y registrar el motivo.

## Stack por capa de responsabilidad

| Capa | Tecnología |
|---|---|
| UI / presentación | React 19, Tailwind 4, `@ciszu/ui`, PWA |
| Estado client (UI) | Zustand v5 (`src/store/useAppStore.ts`) |
| Lógica de servidor | Next.js App Router (rutas API), middleware (cabeceras + CSP + IAST) |
| Datos | PostgreSQL 17.6 (Supabase), RLS, PostgREST |
| Caché | Memoria → Upstash KV → Postgres `ciszu.cache` |
| Autenticación | Supabase Auth (ver `AUTH_SYSTEM.md`) |
| Errores / analítica | Sentry, PostHog, Cloudflare Web Analytics |
| Entrega | Vercel + GitHub Actions + Docker (bot) |

_Última revisión: 5 sep 2026._ Relacionados: `BACKEND_SYSTEM.md` · `FRONTEND_SYSTEM.md` ·
`PACKAGES_SYSTEM.md` · `ORM_SYSTEM.md` · `VAULT_SYSTEM.md` · `TOOLS_SYSTEM.md` ·
`ONLINE_SERVICES_SYSTEM.md` · `MODELS_LLM_SYSTEM.md` · `UI_COMPONENTS_SYSTEM.md`.

