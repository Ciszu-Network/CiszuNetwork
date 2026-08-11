# TECH_STACK — Stack tecnológico de Ciszu Network

Inventario actual (ago 2026) de lenguajes, frameworks, sistemas operativos y herramientas de todo el ecosistema.

## Lenguajes de programación

| Lenguaje | Uso |
| -------- | --- |
| **TypeScript** | 4 webs Next.js, bot Discord.js, bot website, packages SPA (`@ciszu/ui`, `@ciszunetwork/cdn`, `@ciszunetwork/utils`, `email`, `payments`) |
| **JavaScript** (Node) | Scripts de automatización (`scripts/`), generadores IA (`tools/`), play-dl música |
| **Rust** | Launcher/desktop app de MuzicMania (Tauri + NSIS) |
| **Python** | `convert-media.py` (derivadas AVIF/WebP/Opus), `tools/legal-ai` (openpyxl), escáneres (semgrep wrapper), generadores música/video |
| **SQL (PostgreSQL)** | Migraciones, RLS, funciones RPC (schemas `muzicmania`, `ciszubot`, `ciszu`, `public`) |
| **PowerShell / cmd** | Scripts Windows (`vault.ps1`, `ciszu-ai.cmd`, `generate-pwa-icons.ps1`, `docx2pdf.ps1`) |
| **Bash** | CI/CD GitHub Actions, Docker (bot) |

## Frameworks y librerías principales

- **Next.js 15** (App Router) + **Tailwind CSS 4** + PostCSS — las 4 webs.
- **React 19** + TypeScript. Paquete UI propio `@ciszu/ui` (Icon, SmartImage, PwaRegister, InstallPdwaButton, CloudflareGuard, PostHogAnalytics).
- **Discord.js ^14.22** + `@discordjs/voice` + play-dl (bot, 72 comandos, 9 categorías).
- **Express ^5** — panel web del bot (`:5000`, `/api/stats`, `/api/votes`).
- **Supabase** (`@supabase/supabase-js`) — auth + Postgres + Storage CDN + PostgREST.
- **Tauri 2** + Rust — app de escritorio MuzicMania (NSIS).
- **Vitest + Testing Library (happy-dom)** — tests unitarios; **Playwright** — E2E.
- **Sentry** (`@sentry/nextjs` ×4 webs, `@sentry/node` en bot) — errores.
- **Turbo (pnpm workspaces)** — monorepo builds.
- **Docker** (bot multi-stage pnpm, usuario no-root).

## Sistemas operativos usados

| OS | Dónde |
| -- | ----- |
| **Windows 11 Pro** (64-bit, build 10.0.26200) | PC de desarrollo principal (Ciszuko) |
| **Windows 10/11** | Instaladores del juego Tauri en `muzicmania-source/downloads/` |
| **Linux (Alpine)** | Imagen del bot (`node:24-alpine`) en Docker |
| **Linux (Ubuntu)** | GitHub Actions runners, ZAP/semgrep por container |

## Herramientas (CLI y GUI, ver `TOOLS.md` para el análisis completo)

- **CLI/IDE**: VS Code, opencode (agente in-terminal), git 2.55, bash, `dbvr` (BD), `supabase` CLI, `zap`, `semgrep`, `trivy`, `gitleaks`, `secretlint`, `cargo-audit`, `ffmpeg`, `rg` (ripgrep 15.2.0), `fzf` 0.74.2, `agen` (age cryptography).
- **GUI**: DBeaver CE (BD), Bruno (API), Fork (Git GUI), ZAP (daemon+API), Docker Desktop, Windows Terminal, Opera GX (navegador/predeterminado + E2E), GIMP/photopea + Illustrator/Photoshop locales (diseño), OBS/video si aplica.

## Runtimes y versiones clave

- Node 24 (bot) / Node >=20 (webs/locales: Node v24.18.0), pnpm 10.8.1, PostgreSQL 18.4 local / server 17.6 remote, Rust toolchain (Tauri).

_Última revisión: 11 ago 2026._