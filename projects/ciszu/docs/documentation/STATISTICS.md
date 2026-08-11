# STATISTICS — Estadísticas reales del ecosistema

Documento con las cifras verificables y actuales de Ciszu Network (ago 2026). Los datos provienen de fuentes del propio ecosistema (Supabase, Vercel, UptimeRobot, PostHog) y del repo; no son estimaciones.

## Repositorio

- **Stacks**: Next.js 15 ×4 webs + bot Discord.js (TypeScript, Node 24) + Tauri (Rust) para MuzicMania.
- **Comandos del bot**: 72 comandos en 9 categorías.
- **Migraciones de BD aplicadas**: 17 (jul–ago 2026).
- **Tests**: suite Vitest 157 tests (11 ago 2026), E2E smoke + 5 E2E de seguridad.
- **Package managers**: pnpm 10.8.1 (monorepo).

## Base de datos (Supabase)

- Proyecto único `obwzzmbvkrcscqwptlqo`, schema `ciszubot` (14 tablas: 13 + audit_log) + `muzicmania` + `ciszu` (cache/counters).
- **CDN**: bucket `ciszu-cdn` — 7.353 objetos / **160.6 MB** (10 ago 2026 tras limpieza de `ciszu-assets` 1.44 GB → 0).
- Cuota Free storage 1 GB — usada ~16 %.

## Monitorización (UptimeRobot)

- 5 monitores KEYWORD UP (ciszunetwork, ciszukoantony, muzicmania, ciszubot, supabase-bot-status).
- Heartbeat del bot cada 60 s → `ciszubot.bot_status` (online/last_seen/version/guilds).

## Seguridad

- **code scanning**: 31/31 fixed · **dependabot**: 35/36 (resta glib) · **secret scanning**: 1 abierta (PAT rotado/revocado).
- **Advisors Supabase**: security 1 warning (leaked password — límite Free), performance 0 warnings.
- **SAST/DAST**: semgrep 0 reales · ZAP 0 High/4 Medium · gitleaks diff v8.30.1 · secretlint hook pre-commit.
- **Vault**: 26 secrets cifrados con age v1.2.1, backups age + ACLs NTFS + BitLocker E: 100%.

## Rendimiento / calidad

- **Builds**: 4/4 webs OK.
- **CDN verify**: 0 mimetypes malos en 9.055 objetos (8 ago 2026; ahora 7.353).
- Migración 11 (revoke trigger functions): anon/auth EXECUTE = false en las 3.

## Métricas de negocio a capturar (pendiente, ver `ANALYTICS_POSTHOG.md`)

- Eventos/mes PostHog (Free 1M), visitas Cloudflare Web Analytics, votos top.gg/DBL (`ciszu.counters`), récords de MuzicMania (tabla `scores`), uso del bot (guilds/commands via `command_logs`). Actualizar esta sección cuando haya datos históricos.

_Última revisión: 11 ago 2026._