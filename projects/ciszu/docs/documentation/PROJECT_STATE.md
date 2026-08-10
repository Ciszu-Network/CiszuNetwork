# Estado Completo del Proyecto Ciszu Network

**Última actualización:** 10 Agosto, 2026
**Propietario:** Ciszuko Antony (Francisco Garcia) — Caracas, Venezuela
**Stack Principal:** Next.js 15 + TypeScript + Tailwind CSS v4 + Supabase + Tauri 2 + pnpm + Turborepo + Vercel
**Monorepo:** pnpm workspaces (root: E:\Ciszu Network)

## 🚀 Proyectos en Detalle

### 1. CiszuNetwork Page (projects/ciszu/website)
**Filtro pnpm:** ciszunetwork-website
**URL:** ciszunetwork.vercel.app
**Framework:** Next.js 15 (App Router)
**Estado:** ✅ Activo — despliega desde `main` (GitHub Actions → Vercel)
**Docs:** docs/ (root) multi-formato + documentation/ completa

### 2. Ciszuko Antony Portfolio (projects/ciszukoantony/website)
**Filtro pnpm:** ciszukoantony-website
**URL:** ciszukoantony.vercel.app
**Framework:** Next.js 15 (App Router)
**Estado:** ✅ Activo
**Docs:** projects/ciszukoantony/docs/ multi-formato
**Media:** content/ (fuente maestra de logos en content/logos)

### 3. MuzicMania (projects/muzicmania)
**Filtro pnpm:** muzicmania-website
**URL:** muzicmania.vercel.app
**Framework:** Next.js 15 + Tauri 2 (Rust)
**Versions:** website (web), launcher (desktop, Windows), mobile (placeholder)
**Estado:** ✅ Activo — REST corregido (schema muzicmania), auth Supabase, scoreboard cacheado
**Docs:** projects/muzicmania/docs/ multi-formato
**Iconos:** sistema de iconos inline-first + CDN fallback

### 4. CiszuBot (projects/ciszubot)
**Filtro pnpm:** ciszubot-website (website), ciszubot (bot)
**URL:** ciszubot.vercel.app
**Framework:** Next.js 15 (website) + Discord.js v14 (bot)
**Estado:** ✅ Activo — bot v3.2.0 (72 comandos, 9 categorías), Supabase conectado (schema ciszubot, heartbeat bot_status), dashboard OAuth, Docker (node:24-alpine)
**Docs:** projects/ciszubot/docs/ multi-formato
**Panel:** Express :5000 (stats + /api/votes)

### 5. CiszuGamens (ciszugamens/)
**Tipo:** Comunidad gaming / Discord server (legacy)
**Estado:** ✅ Comunidad activa
**Docs:** ciszugamens/docs/ multi-formato

### 6. @ciszunetwork/cdn (packages/cdn)
**Tipo:** Paquete npm compartido
**Función:** Resolver de assets e iconos + sistema de formatos (deliveryVariants)
**Integración:** Supabase Storage (bucket: ciszu-cdn)
**Estado:** ✅ Activo

## 📊 Documentación — Estado Global

### Pipeline de Formatos
```
txt (source of truth) → md (markdown) → docx (Word) → pdf (distribution)
```

### Scripts de Conversión
| Script | Tecnología | Función | Estado |
|---|---|---|---|
| scripts/txt2md.js | Node.js | TXT → MD | ✅ |
| scripts/md2office.js | Node.js + Pandoc | MD → DOCX | ✅ |
| scripts/txt2pdf.py | Python + Reportlab | MD → PDF | ✅ |
| scripts/docx2pdf.ps1 | PowerShell + Word COM | DOCX → PDF | ⚠️ Word COM hangs |
| scripts/sync-public-docs.js | Node.js | docs/ → public/docs/ | ✅ |

### Documentos Estándar (22 tipos)
- ABOUT, ACTA, CATALOGO, CHANGELOG, CONTACT, CREDITS, DOCUMENTATION
- FAQ, FORUM, GUIDELINES, HELP, INFORMATION, LEADERBOARD, LIBRARY
- LICENSE, MOD_GUIDELINES, POLICY, README, RULES, SECURITY, STATS
- SUPPORT, TEAM, TERMS_AND_CONDITIONS

### Archivos Especiales (NO automatizar DOCX/PDF)
- GUIDELINES.docx/pdf — Composición manual
- RULES.docx/pdf — Composición manual
- ACTA.docx/pdf — Composición manual

## 🔧 Herramientas Instaladas

### Sistema
- **OS:** Windows (PowerShell 5.1)
- **Node.js:** 24.18.0
- **Python:** 3.14
- **pnpm:** 10.8.1

### BD / API / Git
- **dbvr Community** 26.1.4 + **DBeaver CE** (datasource `supabase` verificado)
- **Bruno** 4.0.0 (colecciones en apis/bruno/, `pnpm api:test`)
- **Fork** 2.16.1 (Git GUI)

### Documentación
- **Pandoc:** 3.10
- **Reportlab:** 5.0.0 (Python)

### Seguridad / QA
- ZAP 2.17.0 (DAST), semgrep, trivy, gitleaks, secretlint, Vitest + Playwright

### Git
- **Repo:** GitHub Org `Ciszu-Network/CiszuNetwork` (privado)
- **Push:** No funciona desde esta máquina (DNS bloquea github.com) — usuario push manual
- **Commits:** Solo cuando el usuario lo solicita explícitamente
- **Mensajes:** En español, descriptivos, sin emojis

## 🚧 Pendientes (vigentes — viven en su documentación de origen)

1. **Ciszubot OAuth**: registrar callback en Discord Developer Portal + `DISCORD_CLIENT_SECRET` en Vercel (ver AGENTS.md sección Ciszubot web)
2. **Tokens bot lists**: `TOP_GG_TOKEN` / `DISCORDBOTLIST_TOKEN` (código listo, sin ellos no postea)
3. **GUIDELINES/RULES/ACTA DOCX/PDF**: composición manual
4. **DNS**: push a GitHub desde esta máquina (usuario push manual)

## ✅ Completado (desde v2.0.0 → v3.0.0, ago 2026)
- [x] CDN migrado y operativo: bucket `ciszu-cdn` (7.353 objetos / 160.6 MB), bucket legacy `ciszu-assets` ELIMINADO (10 ago 2026), sistema de formatos (avif/webp/opus) + SmartImage
- [x] PDWA en las 4 webs (manifest + sw + botón instalar)
- [x] Bot Discord v3.2.0 completo (72 comandos) + migración 14 (13 tablas ciszubot) + migración 16 (endurecimiento RLS)
- [x] Dashboard OAuth de ciszubot (cookies HMAC, rate limits)
- [x] Caché multi-tienda implementado (memoria → KV Upstash `upstash-kv-ciszunetwork` → Postgres `ciszu.cache`)
- [x] Monitoreo externo: UptimeRobot (5 monitores + email + push) + watcher ntfy (cron GH Actions)
- [x] Cloudflare standalone: Web Analytics + Turnstile en las 4 webs
- [x] Seguridad: RLS 28/28 tablas, rate limits en endpoints, robots.ts ×4, secretlint/gitleaks hooks
- [x] Testing: Vitest 96 tests + Playwright E2E (4 webs)
- [x] Backups de `.env` automatizados (update-env-keys.js)
- [x] **Backup BD real funcionando**: PostgreSQL 18.4 instalado + primer backup OK (10 ago 2026)
- [x] Documentación multi-formato + documentation reestructurados
