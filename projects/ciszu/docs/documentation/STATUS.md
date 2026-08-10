# STATUS - CISZU NETWORK

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
| Cloudflare (standalone) | ✅ Web Analytics + Turnstile en las 4 webs |
| Seguridad | ✅ RLS 28/28 tablas, migración 16 aplicada, rate limits, robots.ts ×4 |
| Testing | ✅ Vitest (96 tests) + Playwright E2E |
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
| Documento CDN_MIGRATION_PLAN | ✅ |
| Inventario de assets | ✅ |
| Subida a Supabase Storage | ✅ (ciszu-cdn espejo del repo) |
| Migración de código | ✅ (NEXT_PUBLIC_CDN_URL ×4 proyectos) |
| Limpieza de repo | ✅ (bucket legacy eliminado, EXCLUDED_EXT) |

### Stack Tecnológico
- **Monorepo**: pnpm 10.8.1 + Turborepo
- **Web**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Desktop**: Tauri 2 (Rust + WebView2)
- **Bot**: Discord.js v14 (projects/ciszubot/discord-bot/)
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

ÚLTIMA ACTUALIZACIÓN: 2026-08-10