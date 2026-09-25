# SECURITY_PUBLIC_PROTOCOLS.md

**Versión:** 1.0
**Actualización:** 23 ago 2026
**Identificador:** SECURITY_PUBLIC_PROTOCOLS
**Definición:** Protocolo obligatorio de seguridad y validación previa a cada `git push` cuando el repositorio sea público. Garantiza cero filtración de secretos, tokens, credenciales o información sensible en el historial público de Git. Este documento es el estándar único de referencia para la operación segura del monorepo Ciszu Network en GitHub público.

---

## 1. Resumen de Estado de Seguridad (Auditoría 23 ago 2026)

| Categoría               | Estado         | Detalle                                                                                                                           |
| ----------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **.gitignore**          | ✅ Seguro      | Ignora`.env*`, `.vercel`, `services/supabase/.env`, `apis/bruno/environments/prod.yml`, `archives/`, `clones/`, binarios grandes  |
| **Secretos en código**  | ✅ Seguro      | Todas las referencias usan`process.env.VAR` — sin valores hardcodeados en archivos trackeados                                     |
| **GitHub Actions**      | ✅ Seguro      | Usan`${{ secrets.XXX }}` y `${{ vars.XXX }}` correctamente                                                                        |
| **Bruno API**           | ✅ Seguro      | Archivos`.yml` usan `{{VAR}}` (referencias), no valores reales                                                                    |
| **Documentación**       | ✅ Seguro      | Nombres de variables referenciados, sin valores                                                                                   |
| **Vercel config**       | ✅ Completado  | `vercel.json` expone `NEXT_PUBLIC_CDN_URL` (público por diseño) y Supabase project ref — **no hay secretos expuestos**             |
| **Historial Git**       | ✅ Controlado  | ~135 leaks históricos documentados (`.turbo/runs/*.json`, Cloudflare beacon). **Validado**: gitleaks diff-only en CI escanea solo commits nuevos. `git filter-repo` NO requerido (repo siempre privado hasta ahora) |
| **Self-hosted runners** | ✅ Completado  | Migrados a `ubuntu-latest` / `windows-latest` en todos los workflows (23 ago 2026). GitHub-hosted runners gratis para repo público |

---

## 2. Reglas No Negociables (Pre-Push Checklist)

> **Ejecutar ANTES de cada `git push` a `main` en repo público.**

### 2.1 Validación Automática (CI/CD)

```bash
# 1. Secretlint (hook pre-commit + CI)
pnpm secretlint "**/*" --ignore-path .gitignore

# 2. Gitleaks (diff-only, evita bloqueo por historial)
gitleaks detect --redact --log-opts="HEAD~5..HEAD"

# 3. pnpm audit (dependencias)
pnpm audit --prod --audit-level high

# 4. TypeScript + ESLint (build verify)
pnpm turbo run lint build
```

### 2.2 Validación Manual (Checklist Rápido)

- [ ] No hay archivos `.env`, `.env.local`, `.env.*.local` en staging (`git status`)
- [ ] No hay `services/supabase/.env` en staging
- [ ] No hay `apis/bruno/environments/prod.yml` (sin `.example`) en staging
- [ ] No hay credenciales en mensajes de commit
- [ ] Los workflows usan `${{ secrets.XXX }}` — **nunca** valores literales
- [ ] Los `vercel.json` solo tienen `NEXT_PUBLIC_*` (público por diseño)

---

## 3. Archivos Críticos — Qué Contienen y Dónde Viven

| Archivo                            | Trackeado                      | Contiene                                                                                                                                                  | Acción Requerida                                                         |
| ---------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `services/supabase/.env`           | ❌ (gitignore)                 | **TODOS los secretos maestros**: Supabase keys, Discord, Sentry, PostHog, NowPayments, Better Stack, Chromatic, Puck, Plasmic, Google, wallets, 2FA codes | **NUNCA commitear**. Solo local + vault cifrado (`.env.age`) + Bitwarden |
| `projects/*/website/.env.local`    | ❌ (gitignore)                 | Vars por proyecto:`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_*`, `SENTRY_DSN_*`, etc.             | **NUNCA commitear**. Se inyectan en Vercel via GitHub Actions secrets    |
| `apis/bruno/environments/prod.yml` | ❌ (gitignore)                 | Valores reales para tests Bruno                                                                                                                           | **NUNCA commitear**. Solo `prod.example.yml` trackeado                   |
| `.vercel/project.json`             | ⚠️ Parcial (gitignore permite) | IDs de proyecto Vercel                                                                                                                                    | Verificar que no contenga tokens                                         |
| `turbo.json`                       | ✅                             | Lista de`globalEnv` (solo **nombres** de vars)                                                                                                            | Seguro — no valores                                                      |
| `.secretlintrc.json`               | ✅                             | Patrones de detección (regex)                                                                                                                             | Seguro — solo reglas                                                     |
| `scripts/tokens_a_rotar.md`        | ✅                             | Lista de tokens a rotar (solo nombres, sin valores)                                                                                                       | Seguro — solo referencia                                                 |

---

## 4. Variables de Entorno — Clasificación por Exposición

### 4.1 Públicas por Diseño (`NEXT_PUBLIC_*`) — Seguras en Build/Client

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_CDN_URL
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_APP_ENV
```

> **Regla**: Solo estas pueden aparecer en bundle client. Nunca poner secretos reales con prefijo `NEXT_PUBLIC_`.

### 4.2 Server-Only (Nunca en Client) — Solo en `process.env` Server/Edge

```
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
SUPABASE_ACCESS_TOKEN
DISCORD_BOT_TOKEN
DISCORD_CLIENT_SECRET
SENTRY_AUTH_TOKEN
SENTRY_ORG_TOKEN
NOWPAYMENTS_API_KEY
NOWPAYMENTS_IPN_SECRET
POSTHOG_SECRET_API_KEY
POSTHOG_PERSONAL_API_KEY
BETTERSTACK_*_TOKEN
CHROMATIC_PROJECT_TOKEN
PLASMIC_SECRET_TOKEN
PLASMIC_TOKEN
PUCK_KEY / PUCK_ORG_KEY / PUCK_EDIT_TOKEN
SUBFRAME_KEY
SIMPLELOGIN_API_KEY
TANSTACK_API_KEY
VERCEL_TOKEN
```

> **Regla**: **Nunca** usar en código client (`'use client'`), nunca en `NEXT_PUBLIC_`, nunca en `vercel.json` env.

### 4.3 Infra / Vault (Solo Local + Cifrado)

```
SUPABASE_DB_PASSWORD
BITLOCKER_PASSWORD
BITLOCKER_RECOVERY_KEY
BW_MASTER_PASSWORD
BW_CLIENT_SECRET
DIRECTUS_ADMIN_PASSWORD
DIRECTUS_ADMIN_TOKEN
BETTERSTACK_BACKUP_1..10
SIMPLELOGIN_RECOVERY_CODES
```

> **Regla**: Solo en `services/supabase/.env` (vault local). **Nunca** en Vercel, GitHub, código, docs.

---

## 5. Protocolo de Rotación Inmediata (Si Hay Filtración)

> **Tiempo objetivo: < 15 min desde detección**

| Secreto                                  | Dónde Rotar                                                  | Cómo Verificar                                 |
| ---------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` / `ANON_KEY` | Supabase Dashboard → Settings → API → Regenerate             | `gitleaks detect --all` limpio                 |
| `SUPABASE_JWT_SECRET`                    | Supabase Dashboard → Settings → API → Regenerate JWT         | Re-deploy webs (auth rompe)                    |
| `SUPABASE_ACCESS_TOKEN`                  | Supabase Dashboard → Account → Access Tokens → Revoke/Create | `pnpm scripts/vercel-kv-setup.js` funciona     |
| `DISCORD_BOT_TOKEN`                      | Discord Developer Portal → Bot → Reset Token                 | Bot conecta + comandos responden               |
| `VERCEL_TOKEN`                           | Vercel Settings → Tokens → Revoke/Create                     | `gh secret set VERCEL_TOKEN` + deploy funciona |
| `SENTRY_AUTH_TOKEN` / `ORG_TOKEN`        | Sentry Settings → Auth Tokens → Revoke/Create                | `pnpm sentry-cli` auth funciona                |
| `POSTHOG_SECRET_API_KEY`                 | PostHog Project Settings → API Keys → Regenerate             | Tracking web funciona                          |
| `NOWPAYMENTS_API_KEY` / `IPN_SECRET`     | NowPayments Dashboard → Settings → API → Regenerate          | Webhooks IPN responden 200                     |
| `CHROMATIC_PROJECT_TOKEN`                | Chromatic → Project Settings → Token → Regenerate            | `pnpm --filter @ciszu/ui chromatic` pasa       |
| `PLASMIC_SECRET_TOKEN` / `TOKEN`         | Plasmic Studio → Project Settings → API Tokens → Regenerate  | Codegen funciona                               |
| `PUCK_KEY` / `ORG_KEY`                   | Puck Cloud → Settings → API Keys → Regenerate                | Editor Puck AI conecta                         |
| `BETTERSTACK_*_TOKEN`                    | Better Stack → Settings → API Tokens → Revoke/Create         | Logs ingesta + uptime funciona                 |
| `SIMPLELOGIN_API_KEY`                    | SimpleLogin → Account → API Key → Regenerate                 | Alias creación funciona                        |

**Post-rotación obligatorio:**

1. Actualizar `services/supabase/.env` local
2. `pnpm scripts/update-env-keys.js <anon> <service>` (actualiza `.env.local` ×5)
3. Actualizar GitHub Actions secrets (`gh secret set`)
4. Actualizar Vercel Project Settings → Environment Variables
5. `pnpm deploy:all` (redesplegar 4 webs)
6. Registrar en `scripts/tokens_a_rotar.md` con fecha y ✅

---

## 6. Configuración GitHub Actions para Repo Público

### 6.1 Cambios Requeridos en Workflows (`.github/workflows/*.yml`)

```yaml
# ANTES (repo privado, self-hosted):
runs-on: ${{ vars.PREFERRED_RUNNER || 'self-hosted' }}

# DESPUÉS (repo público, GitHub-hosted gratis) — APLICADO 23 ago 2026:
runs-on: ${{ vars.PREFERRED_RUNNER || 'ubuntu-latest' }}
# O para Windows:
runs-on: ${{ vars.PREFERRED_RUNNER || 'windows-latest' }}
```

### 6.2 Secrets Requeridos en GitHub (Organization/Repo Settings → Secrets)

| Secret              | Descripción                | Usado En               |
| ------------------- | -------------------------- | ---------------------- |
| `VERCEL_TOKEN`      | Token Vercel (`vcp_*`)     | 4 workflows deploy     |
| `SEMGREP_APP_TOKEN` | Semgrep Cloud (SAST)       | `ci.yml` job `semgrep` |
| `CODEQL_TOKEN`      | (Opcional) CodeQL advanced | `codeql.yml`           |
| `SNYK_TOKEN`        | (Opcional) SCA adicional   | -                      |

### 6.3 Variables de Entorno (Vars) en GitHub

| Var                | Valor                      | Usado En            |
| ------------------ | -------------------------- | ------------------- |
| `PREFERRED_RUNNER` | `ubuntu-latest` (o quitar) | Todos los workflows |

---

## 7. Procedimiento de Conversión Público → Privado

### 7.1 Antes de Cambiar Visibilidad (Settings → General → Danger Zone)

```bash
# 1. Purge historial si hubo leaks previos (solo si repo fue público antes)
#    Requiere: git filter-repo --path-glob '*.env' --path-glob '*.yml' --invert-paths
#    OJO: Reescribe historial — coordinar con equipo (solo Ciszuko Antony aquí)

# 2. Verificar estado limpio actual
gitleaks detect --all --redact  # Debe dar 0 findings en HEAD
pnpm secretlint "**/*"

# 3. Confirmar .gitignore cubre todo crítico
git check-ignore services/supabase/.env
git check-ignore projects/ciszu/website/.env.local
# ... todos deben salir con código 0 (ignored)
```

### 7.2 Después de Cambiar a Público

1. **Habilitar GitHub Actions** (Settings → Actions → General → Allow all actions)
2. **Configurar runners GitHub-hosted** — **COMPLETADO**: workflows usan `PREFERRED_RUNNER` variable (23 ago 2026)
3. **Añadir secrets** (Sección 6.2) en Organization/Repo
4. **Deshabilitar workflows innecesarios** (uptime-watch cada 5 min → mover a cron externo o UptimeRobot)
5. **Verificar primer push**: CI pasa, deploy funciona, gitleaks 0 findings

---

## 8. Protección Adicional (Defense in Depth)

### 8.1 Branch Protection Rules (main)

```yaml
# Settings → Branches → Add rule for main
required_status_checks:
    - lint
    - unit-tests
    - storybook-tests
    - semgrep
    - audit
    - gitleaks
enforce_admins: true
require_linear_history: true
required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
```

### 8.2 Dependabot + Security Alerts

- Habilitar: Settings → Security → Dependabot alerts + auto-fix PRs
- Configurar `.github/dependabot.yml` para pnpm + GitHub Actions

### 8.3 Vigilancia Continua

- **Gitleaks**: En CI en cada push/PR (ya configurado)
- **Secretlint**: Pre-commit hook + CI (ya configurado)
- **Semgrep**: SAST diario (schedule en `ci.yml`)
- **DAST**: ZAP semanal (`.github/workflows/dast.yml`)
- **CodeQL**: Weekly + push (`.github/workflows/codeql.yml`)

---

## 9. Referencias Cruzadas

| Doc                         | Relación                                                       |
| --------------------------- | -------------------------------------------------------------- |
| `SECURITY_PROTOCOLS.md`     | Protocolos generales de seguridad (RLS, rate limit, CSP, etc.) |
| `VAULT_SYSTEM.md`           | Gestión del vault`services/supabase/.env` + cifrado age        |
| `ACTIONS_RUNNERS_SYSTEM.md` | Configuración runners (self-hosted → GitHub-hosted)            |
| `DEVSECOPS_SYSTEM.md`       | Pipeline SAST/DAST/SCA (shift-left)                            |
| `DOCUMENTATION_SYSTEM.md`   | Estándar de docs (este archivo sigue convención`_PROTOCOLS`)   |
| `WORKFLOW_SYSTEM.md`        | Operación diaria, git, commits, deploys                        |
| `CIBERSECURITY_SYSTEM.md`   | OSINT, hardening, respuesta a incidentes                       |

---

## 10. Checklist Final Pre-Publicación

- [x] `gitleaks detect --all --redact` → 0 findings en HEAD
- [x] `pnpm secretlint "**/*"` → 0 issues
- [x] `git check-ignore` confirma todos los `.env*` ignorados
- [x] `services/supabase/.env` NO en `git ls-files`
- [x] `apis/bruno/environments/prod.yml` NO en `git ls-files`
- [x] Workflows actualizados a `runs-on: ${{ vars.PREFERRED_RUNNER || 'ubuntu-latest' }}`
- [x] Secrets GitHub configurados (Sección 6.2)
- [x] Vercel projects vinculados a GitHub repo público
- [x] Branch protection `main` activada
- [x] Dependabot + Security alerts habilitados
- [x] Documentar en `PROJECT_HISTORY.md` la fecha de publicación pública
- [x] Notificar al equipo (solo Ciszuko Antony) — cambio completado

---

_Última revisión: 23 ago 2026. Autor: Ciszuko Antony (Ciszu Network)._
**Fuente de verdad:** `projects/ciszu/docs/documentation/`. Estándar: `DOCUMENTATION_SYSTEM.md`.
