# PROJECTS_SYSTEM — Sistema de Proyectos del Ecosistema (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
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
- **Estado:** ✅ Activo — bot v3.2.0 (72 comandos, 9 categorías), Supabase conectado
  (schema ciszubot, heartbeat `bot_status`), dashboard OAuth, Docker (node:24-alpine)
- **Panel:** Express :5000 (stats + /api/votes)
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

_Última revisión: 13 ago 2026._ Relacionado: `STATUS_SYSTEM.md`, `STATISTICS_SYSTEM.md`,
`ARCHITECTURE.md`, `WORKFLOW_SYSTEM.md`, `AGENTS.md`.
