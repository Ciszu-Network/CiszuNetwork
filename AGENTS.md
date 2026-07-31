# Ciszu Network Monorepo — AGENTS.md

## Visión general del proyecto

**Ciszu Network** es el ecosistema digital de **CiszukoAntony** (Ciszuko): un monorepo con 4 sitios web (Next.js 15 + Tailwind 4), un bot de Discord (Discord.js), un juego de música (MuzicMania — web + app Tauri), paquetes compartidos (`@ciszu/ui`, `@ciszunetwork/cdn`) y un CDN de assets sobre Supabase Storage.

| Proyecto | URL (Vercel) | Descripción |
|---|---|---|
| **CiszuNetwork** | `ciszunetwork.vercel.app` | Web principal — presentación de la marca, redes y ecosistema |
| **CiszukoAntony** | `ciszukoantony.vercel.app` | Portfolio personal (logos, medios, música) |
| **MuzicMania** | `muzicmania.vercel.app` | Juego de ritmo/música — scores en Supabase (schema `muzicmania`), auth de Supabase, app de escritorio Tauri + NSIS |
| **Ciszubot** | `ciszubot.vercel.app` | Landing page del bot de Discord (`apps/ciszubot/discord/`, vanilla JS) |

Infraestructura: **Supabase** (un solo proyecto `obwzzmbvkrcscqwptlqo` — auth, Postgres, Storage CDN `ciszu-cdn`) + **Vercel** (4 proyectos, deploys vía GitHub Actions) + **GitHub** (repo privado `Ciszu-Network/CiszuNetwork`). Identidad visual: neon cyan/rosa, fuente Geomanist.

**Estado actual (jul 2026)**: los 4 sitios despliegan desde `main` y funcionan en producción (imágenes directas CDN, `images.unoptimized`, REST de muzicmania corregido). La sesión de seguridad cerró: code scanning 31/31 fixed, dependabot 35/36 (resta glib), secret scanning 1 abierta (PAT sbp_ redactado del repo). Pendientes activos: aplicar migración 11 (requiere PAT nuevo del usuario), rotar tokens (lista abajo), escaneo semgrep completo, instalar ZAP. Detalles en la sección "Herramientas de seguridad instaladas".

## Quick start
```bash
pnpm install              # install all workspaces
pnpm dev                  # turbo: all apps
pnpm build                # turbo: all apps
pnpm lint                 # turbo: lint all apps
pnpm --filter <name> dev  # single app
```

Package manager: **pnpm v10.8.1**, Node >=20.

## Workspaces & entry points

| pnpm filter name | Location | What |
|---|---|---|
| `ciszunetwork-page` | `apps/website/` | Next.js — main CiszuNetwork page |
| `ciszuko-network` | `apps/ciszukoantony/website/` | Next.js — portfolio |
| `muzicmania-next` | `apps/muzicmania/website/` | Next.js + Tauri — music game |
| `ciszubot-web` | `apps/ciszubot/website/` | Next.js — bot landing page |
| `ciszubot` | `apps/ciszubot/discord/` | Discord.js bot (vanilla JS, `node index.js`) |
| `@ciszunetwork/cdn` | `packages/cdn/` | Asset resolver (see below) |

All websites are Next.js 15 with Tailwind 4 + PostCSS. They use `eslint` (no Prettier config found).

## CDN strategy (Ciszu CDN — mirror del repo)

El CDN es un **espejo** del repositorio. Las rutas en Supabase Storage (`ciszu-cdn`, migrado desde `ciszu-assets`) reflejan 1:1 las rutas reales del repo. No hay carpeta `assets/` staging — el upload lee directamente de los directorios originales.

- **Upload**: `pnpm cdn:upload` (`scripts/upload-cdn.js`) — escanea 8 fuentes (`shared/icons/svg/`, `content/`, `docs/`, `ciszukoantony/content/`, `apps/*/content/`) y sube con la misma ruta relativa a `ciszu-cdn`.
  - ⚠️ **Upload manual de archivos sueltos**: las `sb_secret_*` keys NO funcionan para PUT directo al storage ("Invalid Compact JWS"). Usar el CLI: `supabase --experimental storage cp <archivo> ss:///ciszu-cdn/<ruta-repo>` con `SUPABASE_ACCESS_TOKEN` (vault) y proyecto ya linkeado (`supabase link --project-ref obwzzmbvkrcscqwptlqo`).
- **Offline fallback**: `scripts/copy-assets.js` se ejecuta como `prebuild` en cada website. Copia assets críticos a `public/` con las mismas rutas espejo. `--all` copia todo.
  - Path depth: `apps/website/` → `../../scripts/copy-assets.js`, `apps/*/website/` → `../../../scripts/copy-assets.js`
  - **Mirrors**: `apps/<name>/content` → `public/apps/<name>/content/` y la media maestra `ciszukoantony/content` → `public/ciszukoantony/content/` (necesario para el resolver local de logos). Los outputs del prebuild en `public/` de las webs puras están en `.gitignore` (solo muzicmania/Tauri trackea sus mirrors).
- **Asset resolver**: `packages/cdn/index.ts` — `resolveIcon(name, style, format)` para icons, `assetResolver.resolve(path)` para assets arbitrarios. Usa `NEXT_PUBLIC_CDN_URL` como base (ya incluye el bucket: `.../object/public/ciszu-cdn`).
- ⚠️ **`NEXT_PUBLIC_CDN_URL` por proyecto Vercel**: en jul 2026 los proyectos `muzicmania`, `ciszunetworkpage` y `ciszukoantonypage` tenían el valor apuntando al bucket VIEJO `ciszu-assets` (renombrado → URLs 404). Fueron recreadas (DELETE+POST vía API, target production) apuntando a `ciszu-cdn`. Al cambiar env vars en Vercel hace falta un nuevo build/deploy (los redeploys vía API `POST /v16/deployments/{id}/redeploy` NO existen — disparar workflows con un push de `packages/**` o `apps/**`).

### Rutas de logos (fuente maestra)

Los logos viven en `ciszukoantony/content/logos/` (raíz) y su mirror `apps/ciszukoantony/content/logos/`. **En el bucket SOLO existen bajo `ciszukoantony/content/...`** (200) — las rutas `apps/ciszukoantony/content/logos/...` devuelven 400. Usar siempre:

```ts
assetResolver.resolve('ciszukoantony/content/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg')
```

### Sistema de iconos (inline-first + CDN fallback)

- `packages/ui/src/Icon.tsx` — componente compartido `Icon`: renderiza SVG inline (coloreable, sin red) si el nombre está en el registro; si no, `<img>` al CDN dinámico con **recall local** en caso de error (onError → ruta local → oculto).
- `packages/ui/src/generated/icon-registry.ts` — **archivo GENERADO** desde el catálogo canónico `shared/icons/svg/{outline,filled}/`. Regenerar con `node scripts/generate-icon-registry.js` (lista curada en el script; añadir nombres nuevos ahí).
- Las 4 apps dependen de `@ciszu/ui` y sus `hooks/useIcon.tsx`/`utils/icons.ts` delegan en el componente compartido.
- **Política**: iconos UI estáticos → inline en bundle (registry); iconos dinámicos/desconocidos → CDN con recall; medios (logos, música, covers) → `assetResolver.resolve()`.

Supabase Storage (`ciszu-cdn` bucket, `avatars` bucket) es para CDN y user-generated content. `avatars` es bucket por defecto de Supabase para fotos de perfil (`auth.users`).

### Sistema mixto local + CDN

El `AssetResolver` (`packages/cdn/index.ts`) usa estrategia híbrida vía `forceCdn`/`forceLocal`:

| Entorno | forceCdn | forceLocal | Resultado |
|---|---|---|---|
| Tauri | — | — | `tauri://localhost/...` (local) |
| Tauri | ✓ | — | CDN |
| Desarrollo | — | — | Ruta relativa `/...` (local) |
| Desarrollo | — | ✓ | Ruta relativa `/...` |
| Producción | — | — | CDN |
| Producción | ✓ | — | CDN |
| Producción | — | ✓ | Ruta relativa `/...` (desde public/) |

Uso:
```ts
resolveIcon('home')                                   // CDN en prod, local en dev
resolveIcon('home', 'outline', 'svg', { forceCdn: true })  // forzar CDN
resolveIcon('home', 'outline', 'svg', { forceLocal: true }) // forzar local
```

- No hay carpeta `assets/` staging — las fuentes originales son la verdad única (`shared/icons/svg/`, `content/`, etc.)
- `copy-assets.js` copia solo críticos por defecto, o todos con `--all`
- Binarios grandes (`.mp4`, `.gif`, `.exe`, etc.) excluidos de git globalmente
- **Cloudflare R2** configurado como alternativa futura pero **INACTIVO** (requiere tarjeta/paypal). Credenciales comentadas en el vault.

## Supabase

Single project: `obwzzmbvkrcscqwptlqo.supabase.co`
- Credentials in `services/supabase/.env`
- Muzicmania uses `@supabase/supabase-js` for auth + DB
- Storage buckets: `ciszu-cdn` (public, 50 MB limit, renamed from ciszu-assets) for CDN + user content, `avatars` for profile pics
- Old `services/supabase/supabase/` (config.toml, migrations, ia_docs) was **permanently deleted** — re-run `supabase pull` against the remote project to recover
- CDN: `ciszu-cdn` bucket via Supabase Storage (`NEXT_PUBLIC_CDN_URL`)
- **DB bugfixes** (aplicados vía Management API SQL, jul 2026):
  - `check_username_available` → SECURITY INVOKER + explícito `muzicmania.profiles` (antes: SECDEF sin search_path)
  - `get_email_by_username` → search_path + `muzicmania.profiles` + REVOKE anon (devuelve 401)
  - `handle_account_deletion`, `is_account_recoverable(TEXT)` → search_path + `muzicmania.profiles`
  - `handle_new_user` → eliminada referencia a `public.profiles` (tabla movida a muzicmania — bug crítico que rompía registro)
  - `muzicmania.submit_game_score` → eliminada referencia a `public.profiles` (bug crítico que rompía envío de scores)
  - (Pendiente: leaked password + MFA — dashboard settings, no SQL)
  - (Pendiente: exponer schemas en Dashboard → Settings → API → Exposed schemas: agregar `muzicmania, ciszubot, ciszunetwork`)

## CI/CD (GitHub Actions)

All workflows run on `push: [main, master]`:

- **CI** (`.github/workflows/ci.yml`) — lint only, matrix over `[website, ciszukoantony, muzicmania]`
- **4 deploy workflows** — each triggers on matching `apps/<name>/**` + `content/**` + `scripts/copy-assets.js` changes
  - Pattern: `vercel link --yes --project <name>` → `vercel --prod --yes --archive=tgz`, ambos **desde la raíz del repo** (`working-directory: .`)
  - ⚠️ NUNCA usar `vercel pull/build/deploy --prebuilt` dentro de `apps/*/website`: con `rootDirectory` fijado en el proyecto, el CLI duplica la ruta y produce deployments READY pero vacíos (404 en el alias)
  - Deploy desde la raíz requiere el `.vercelignore` raíz (excluye node_modules, .next, content, binarios)
  - Vercel tokens son GH secrets (`VERCEL_TOKEN`)
  - Proyectos Vercel: `ciszunetworkpage` → `apps/website`, `ciszukoantonypage` → `apps/ciszukoantony/website`, `ciszubot` → `apps/ciszubot/website`, `muzicmania` → `apps/muzicmania/website`
- Discord bot (`deploy-bot.yml`) deploys su website, no el bot en sí

## Git conventions

- `.gitignore` excludes: all `*.gif`, large binaries (`*.exe`, `*.mp4`, `*.mp3`, etc.), `content/**/*`, CDN video subdirs, legacy `CiszuGamens/`
- Commit messages are in Spanish (descriptive, one line)
- No commit/push without explicit user request
- Git push fails from this machine (DNS cannot resolve github.com) — user pushes manually

## muzicmania-source (recovery from Vercel)

`muzicmania-source/` contiene ~14,852 archivos (201 MB) extraídos del deployment de Vercel.

### Qué se recuperó (solo `public/`)
- **`icons/png/` y `icons/svg-src/`** — Sistema completo de iconos
- **`arrowskins/`** — 384 SVGs en 24 variantes
- **`logos/`** — gif/imagen/video (logotipos, isotipos, taglines)
- **`music/`** — Álbum genesis_neon con sus subálbumes
- **`downloads/`** — 2 instaladores EXE (Windows 10/11, v2.0.1)
- **`docs/`** — Documentación en MD/PDF/DOCX/7z/RAR/ZIP
- **`fonts/`**, **`images/`**, **`particleskins/`** — Varios assets menores

### Qué NO se recuperó (solo existía en GitHub)
- **`src/`** — Código fuente TypeScript/React (componentes, hooks, stores, servicios, páginas)
- **Configs** — `next.config.ts`, `tsconfig.json`, `tailwind.config.mjs`, `postcss.config.mjs`, `eslint.config.mjs`
- **`scripts/`** — Scripts de build Tauri, patch NSIS, download flags
- **`supabase/`** — Consola de debug, migraciones
- **`components/`**, **`hooks/`**, **`lib/`**, **`utils/`**, **`config/`**, **`data/`**, **`types/`**, **`services/`**, **`store/`**

Vercel solo preserva build output + `public/`. Para recuperar source se necesita el repo de GitHub original.

## ⚠️ Seguridad — Credenciales

**Este repositorio es PRIVADO.** Si alguna vez se vuelve público, hay credenciales comprometidas en el historial de git que deben ser rotadas inmediatamente.

Archivos que NUNCA deben trackearse en git (ya en `.gitignore`):
- `documents/md/credentials.md` — contenido sensible (fue purgado del historial vía filter-branch)
- `docs/md/VERCEL_ENV_VARS.md` — documenta secrets en texto plano (eliminado del disco)
- `services/supabase/docs/md/PRIVATE_DOCS.md` — **redactado** (jul 2026) tras alerta de secret scanning: contenía password del dashboard, PAT, service_role, anon key y JWT secret en texto plano. Las credenciales reales viven SOLO en `services/supabase/.env` (gitignored). No volver a pegar secrets en docs.

Si el repo cambia a público:
1. Rotar TODAS las credenciales (Supabase keys, Discord token, Vercel token, Cloudflare R2)
2. Purgar historial con `git filter-branch` o BFG Repo-Cleaner
3. Verificar que no queden secrets en `git log --all -p | grep -i "sb_\|vcp_\|ghp_\|token\|secret\|key"`

## Gotchas

- **`images.unoptimized: true` en las 4 apps** (jul 2026): el optimizador de imágenes de Vercel devolvía 400 (`INVALID_IMAGE_OPTIMIZE_REQUEST`) para TODO (local y remoto) por el límite mensual del plan Hobby. Con `unoptimized` next/image sirve el src directo (sin `/_next/image`).
- **muzicmania REST**: las tablas viven en el schema `muzicmania` (`db: { schema: 'muzicmania' }` en `src/config/supabase.ts`). Columnas reales de `scores`: `id, user_id, score, created_at, track_id, accuracy` (NO `song_id` — el código usa `track_id`). `profiles` NO tiene `created_at` (usar `updated_at`) y no hay FK scores→profiles (el embed `profiles(...)` da 400 — consultar aparte por `user_id`).
- **`.single()` con 0 filas → 406 PGRST116**: usar siempre `.maybeSingle()` cuando la fila puede no existir (StatsTicker, récord global). El 406 en consola de `select=score&order=score.desc&limit=1` era eso.
- **Cargo advisories pendientes** (`apps/muzicmania/launcher`): `glib` 0.18.5 (GHSA-wrw7-89jp-8q8g, fix en ≥0.20.0) requiere gtk/tauri 3 — tauri 2.11.5 lo pincha en 0.18. `serde_with` 3.21.0 ya patcheado (cargo update jul 2026).
- **Overrides de seguridad** en `pnpm-workspace.yaml`: `undici 6.27.0`, `body-parser 1.20.6`, `brace-expansion 5.0.8`, `postcss 8.5.25`, `minimatch@^9 9.0.7`, `sharp 0.35.3` (forzar versiones patcheadas para transitivas).
- `muzicmania/website` has **Tauri + NSIS** commands (`pnpm tauri:build`, `pnpm tauri:build:nsis`); needs Rust toolchain
- No test framework is configured — CI only runs `lint`
- `prebuild` relative paths differ by nesting depth (2 levels vs 3 levels deep)
- Root `content/` holds master media; each app has a mirror `content/` + `documents/` + `documents/ia_docs/`
- Vercel deployments do **not** preserve original TypeScript source — only build output + public/ static assets
- `packages/cdn`, `packages/ui`, `packages/config`, `packages/utils` are the shared npm packages
- Icon system is in `shared/icons/` (outline/filled/flag); use `resolveIcon()` from `@ciszunetwork/cdn`. All 4 websites import this package.
- **Legacy files** (pre-date `packages/cdn/`): `shared/hybrid-system.js`, `shared/aliases.json`, `scripts/setup-icons-system.js`, `scripts/setup-aliases.js` — no longer imported by any app. The canonical resolver is `packages/cdn/index.ts`.
- **Content dirs**: `root/content/`, `apps/*/content/`, `ciszukoantony/content/`, `ciszugamens/content/` hold multimedia (banners, flayers, logos, thumbails). These are candidates for CDN but tracked in git for local builds.

## Supabase Advisors (Database Linter)

### Security advisors — estado actual (jul 2026)

| Advisor | Estado | Explicación |
|---|---|---|
| `authenticated_security_definer_function_executable` | 0 warnings | ✅ Migración 11 (REVOKE EXECUTE de anon/authenticated en `handle_review_like`, `handle_review_update`, `update_track_like_count` — son SOLO triggers, el motor no chequea EXECUTE al dispararlos). ⚠️ **Pendiente de aplicar**: requiere PAT válido vía Management API (el `sbp_` filtrado fue redactado y ya no funciona). |
| `auth_leaked_password_protection` | 1 warning | **Free Tier limitation** — solo activable desde Dashboard con plan Pro. |

**Funciones cambiadas a SECURITY INVOKER** (más seguro, RLS se respeta):
- `public.get_email_by_username(text)` → INVOKER (migration 09)
- `public.is_account_recoverable(uuid)` → INVOKER (migration 09)
- `public.is_account_recoverable(text)` → INVOKER (migration 09)
- `public.submit_game_score(...)` → INVOKER (migration 09)
- `muzicmania.submit_game_score(...)` → INVOKER (migration 10)

### Performance advisors — estado actual (jul 2026)

| Advisor | Estado | Explicación |
|---|---|---|
| `auth_rls_initplan` | 0 warnings | ✅ Todas las `auth.uid()`/`auth.role()`/`auth.jwt()` envueltas en `(SELECT auth.X())` |
| `multiple_permissive_policies` | 0 warnings | ✅ Policies duplicadas mergeadas, ALL separado en comandos individuales |

**Reglas para evitar `auth_rls_initplan`:**
- Toda llamada a `auth.uid()`, `auth.role()`, `auth.jwt()` en USING/CHECK de RLS policies debe ir envuelta en `(SELECT auth.X())`
- Si ya está dentro de una subconsulta EXISTS, envolver igualmente: `profiles.id = (SELECT auth.uid())`

**Reglas para evitar `multiple_permissive_policies`:**
- No usar `FOR ALL` — separar en policies individuales por comando (SELECT/INSERT/UPDATE/DELETE)
- Si un mismo rol+acción tiene dos policies con distintos USING, mergearlas con OR
- Para `muzicmania.likes`: "Likes are viewable by everyone" (SELECT) + "Users can manage their own likes" (ALL) → la ALL cubre SELECT, causando duplicado. Solución: ALL → INSERT+UPDATE+DELETE separados.

## Seguridad — XSS y SQL Injection

### Prevención de XSS

- **NUNCA** usar `innerHTML` o `dangerouslySetInnerHTML` con datos de usuario sin escapar
- Usar `escapeHtml()` helper (crea textNode via DOM y extrae innerHTML):
  ```js
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
  ```
- Preferir `textContent` sobre `innerHTML` cuando no se necesita HTML
- En Next.js, JSX escapa automáticamente — solo preocuparse por `dangerouslySetInnerHTML`
- TODO `dangerouslySetInnerHTML` debe usar DOMPurify.sanitize() si los datos pudieran volverse dinámicos en el futuro

**Archivos legacy con XSS ya fixeados:**
- `apps/muzicmania/web/src/utils/legacy_scripts/search.mjs` — `query` del search box escapado con `escapeHtml()`
- `apps/muzicmania/web/src/utils/legacy_scripts/auth.mjs` — `displayName`/`username` escapados con `escapeHtml()`
- Duplicados en `apps/muzicmania/website/` (untracked)

### Prevención de SQL Injection

- **NUNCA** concatenar strings en queries SQL: `` `SELECT * FROM t WHERE id = '${val}'` ``
- Usar siempre el ORM de Supabase (parametrizado): `.eq('id', val)`, `.rpc('func', { param: val })`
- En scripts que construyen SQL dinámico, validar entrada con regex antes de interpolarla
- Las 52 funciones PL/pgSQL del proyecto están **limpias** (sin `EXECUTE` dinámico)
- Discord bot usa Discord API segura — no construye SQL directamente

**Archivos con patrones inseguros ya fixeados:**
- `scripts/fix-migrations.js` — validación regex `/^\d{14}$/` sobre version strings antes de usarlas en SQL
- `apps/muzicmania/web/src/scripts/dbManager.ts` — `eval()` + raw SQL: agregadas confirmaciones explícitas (dev tool, no se shippea)

**Dev tools que requieren precaución:**
- `apps/muzicmania/*/src/scripts/dbManager.ts` — tiene `eval()` (shell interactiva) y `execute_sql_query` RPC. Son herramientas de desarrollo solamente. Tienen doble confirmación de seguridad.

## Migraciones aplicadas (jul 2026)

| Migration | Archivo | Qué hace |
|---|---|---|
| 04 | `20260729000004_fix_excessive_grants.sql` | Revocó ALL de anon, solo SELECT |
| 05 | `20260729000005_fix_advisors_security_definer.sql` | Fix 27 warnings: search_path + REVOKE anon |
| 06 | `20260729000006_fix_remaining_anon.sql` | REVOKE preciso por signature exacta |
| 07 | `20260729000007_fix_public_inherit.sql` | REVOKE FROM PUBLIC + GRANT a authenticated |
| 08 | `20260729000008_fix_performance_advisors.sql` | Initplan wrapping + eliminar policies duplicadas |
| 09 | `20260729000009_fix_remaining_advisors.sql` | Funciones públicas a INVOKER + merged policies |
| 10 | `20260729000010_fix_submit_game_score_invoker.sql` | `muzicmania.submit_game_score` → INVOKER |
| 11 | `20260729000011_revoke_execute_trigger_functions.sql` | REVOKE EXECUTE de anon/authenticated en las 3 funciones trigger SECURITY DEFINER restantes (cierra advisor). ⚠️ Aún sin aplicar — requiere PAT válido |

## Scripts útiles (en `scripts/`)

- `check-func-perms.js` — verifica permisos EXECUTE por rol en funciones
- `check-policies.js` — lista cantidad de policies por tabla
- `check-auth-wrapper.js` — detecta `auth.*()` sin wrapper `(SELECT ...)` en policies
- `analyze-policies.js` — detecta policies duplicadas y auth calls top-level
- `backup-db.js` — backup con timestamp, limpia >30 días, flags `--scheduled`/`--dry-run`
- `update-env-keys.js` — actualiza todos los `.env` con nuevas keys tras rotación manual
- Aplicar migraciones: `node scripts/apply-migration-XX.js`

## Herramientas de seguridad instaladas (jul 2026)

| Herramienta | Cómo | Notas |
|---|---|---|
| **secretlint** (13.0.4) | `secretlint` (npm global) | Hook pre-commit activo (`.git/hooks/pre-commit`, ignora con `--no-verify`). Config: `.secretlintrc.json` (preset-recommend + patrones custom `sbp_`, `vcp_`, `sb_secret_`, JWT) |
| **gitleaks** (8.30.1) | `C:\Users\fplay\AppData\Local\Programs\Gitleaks\gitleaks.exe` | Escaneo de historial: `--log-opts="--all"`. Reporte del escaneo jul 2026: `Temp\opencode\gitleaks_hist.json` (130 leaks, la mayoría de `.turbo/runs/*.json` ya destrackeados; restan `cloudflare-api-key` ×3 en `.turbo` del historial y 1 key en `generate-tracks.ps1` ya quitada) |
| **semgrep** (1.172.0) | `semgrep scan --config p/security-audit` (pip) | Pendiente: escaneo completo (se colgó en la sesión — reintentar por targets pequeños: `apps/*/website/src` uno a uno) |
| **trivy** (0.72.0) | PATH: `C:\Users\fplay\AppData\Local\Microsoft\WinGet\Links` | Usa `--db-repository mirror.gcr.io/aquasec/trivy-db` (con la red nueva resuelve). pnpm-lock: 0 vulns HIGH/CRITICAL |
| **cargo-audit** (0.22.2) | `cargo audit` (en `apps/muzicmania/launcher/src-tauri`) | 17 warnings permitidos: glib (tauri 3) + unic-ucd-version (transitivo) |
| **pnpm audit** | `pnpm audit --prod` | 0 vulns |
| **ZAP** | NO instalado | choco falla por lock/permisos — instalar con shell admin: `choco install zaproxy -y` |

**Pendientes sesión anterior (jul 2026):**
- Aplicar migración 11 (REVOKE EXECUTE trigger functions) — requiere PAT nuevo del usuario
- Rotar tokens — lista COMPLETA con valores en `C:\Users\fplay\AppData\Local\Temp\opencode\tokens_a_rotar.md` (9 ítems: PAT, service_role, JWT secret, password dashboard, anon, Vercel vcp_, Suno AI key, Cloudflare R2, Discord). Supabase: regenerar en Dashboard y actualizar `.env` con `scripts/update-env-keys.js`. Vercel: rotar `vcp_` y actualizar GH secret `VERCEL_TOKEN` (4 workflows lo usan)
- Semgrep scan completo + ZAP install + secretlint full repo scan
- `.turbo/runs/*.json` con env vars siguen en el historial git (git rm --cached hecho; purgar con filter-branch si el repo se hace público)

## A ejecutar en toda implementación nueva

1. **Advisors**: después de cualquier cambio en policies o funciones, verificar Security + Performance Advisors en Dashboard
2. **XSS**: todo input de usuario renderizado debe pasar por `escapeHtml()` o `textContent`; nunca `innerHTML` directo
3. **SQL Injection**: nunca concatenar strings en SQL; siempre ORM parametrizado o RPC con objetos
4. **SECURITY DEFINER**: solo cuando sea estrictamente necesario (triggers que modifican datos de otros usuarios); preferir INVOKER siempre que RLS lo permita
5. **RLS policies**: siempre separar por comando (no ALL), evitar USING(true) sin restricción de rol, envolver auth.*() en subconsultas