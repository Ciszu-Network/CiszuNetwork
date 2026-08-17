# SECURITY_PROTOCOLS — Protocolos de Seguridad del Ecosistema

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: SECURITY_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> **Qué es este documento**: protocolos **permanentes y accionables** de seguridad para el
> ecosistema Ciszu Network — las 4 websites (muzicmania, ciszunetwork, ciszubot,
> ciszukoantony) + bot de Discord + BD Supabase. Son procedimientos, checklist y reglas que
> se aplican en **toda implementación nueva** y se re-verifican tras tocar DB, auth,
> endpoints o secretos. No es un registro de trabajo pasado: es la política viva.

---

## 1. Filosofía de seguridad

**Shift-left**: la seguridad se aplica en la **misma sesión en que se escribe el código**, no
en campañas posteriores. El flujo normal de generación de código NO cubre 4 categorías por
defecto (se centra en la funcionalidad y asume un entorno seguro):

1. **Fin de seguridad** — RLS en tablas nuevas, EXECUTE de funciones, grants anon.
2. **Protección de secretos** — dónde vive cada credencial, qué viaja al navegador.
3. **Verificación de acceso/permisos** — rate limits, roles, targets de envs.
4. **Verificación con fuentes externas** — nunca confiar en el propio estado.

**Verificación externa (regla de oro)**: el estado que el código "confirma" es la misma fuente
que lo escribió. La verificación real se hace con **fuentes externas al código**:

- Queries SQL directas con `dbvr` (RLS, grants, EXECUTE).
- `curl` a producción y local (headers, robots, payloads IAST).
- `grep` del **bundle compilado** (`.next/static`) para secrets.
- **Output del build** (`next build`) para confirmar middleware, robots.txt y metadata.
- **CI** (`gh run list`), tests (`pnpm test`), DAST (Playwright/ZAP).

**Defensa en capas**: RLS + JWT + rate limits + API routes server-only + IAST (observa) +
Turnstile (bloquea bots) + CSP + headers de seguridad. Cada capa asume que las demás pueden
fallar. El IAST **solo observa, no bloquea** — el bloqueo lo hacen Turnstile/rate limits.

---

## 2. Checklist obligatorio en toda implementación nueva

### Si la tarea crea una tabla Supabase / migración
- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policy explícita en la **MISMA migración**.
      ⚠️ Supabase otorga `GRANT ALL` a anon/authenticated **por defecto** en tablas nuevas →
      sin RLS = BD abierta.
- [ ] Tras aplicar, ejecutar los 3 checks SQL de la sección 3 (NO confiar en el advisor del
      Dashboard: **no avisa** de tablas sin RLS ni de EXECUTE anon en funciones normales).
- [ ] Si la tabla expone datos públicos por diseño (p.ej. `ciszubot.bot_status`): `GRANT SELECT`
      a anon + policy SELECT explícita. Todo lo demás = deny-all (el bot y las rutas server-side
      usan service_role, que ignora RLS).
- [ ] Grants de servicio: `GRANT ALL` a `service_role` explícito (la Management API no aplica
      grants default).

### Si la tarea crea/modifica una RPC o endpoint con datos de usuario
- [ ] `has_function_privilege('anon', ...)` para cada función RPC tocada → anon **false**.
- [ ] Datos personales (email, etc.): **NUNCA** vía RPC pública/PostgREST con anon → API route
      server-only (service_role) + rate limit (patrón: `get_email_by_username` se movió a
      `/api/auth/resolve-username`).
- [ ] Funciones: preferir **SECURITY INVOKER** siempre que RLS lo permita; SECURITY DEFINER solo
      para triggers que modifican datos de otros usuarios, y en ese caso con `search_path` fijo
      + `REVOKE EXECUTE` de anon/authenticated (el motor no chequea EXECUTE al disparar triggers).

### Si la tarea crea un endpoint POST (muta o consume un servicio externo)
- [ ] Rate limit SIEMPRE con `createRateLimiter` de `@ciszunetwork/utils` (0 deps; memoria → KV
      → Postgres). NO inventar implementaciones por app. Referencias de límites:

| Endpoint | Límite | Nota |
| --- | --- | --- |
| `/api/verify-turnstile` (×4 webs) | 30/min por IP | 429 + `Retry-After` |
| `/api/auth/resolve-username` (muzicmania) | 10/min por IP | resolver de datos personales |
| `/api/dashboard/[guildId]` POST (ciszubot) | 10/min por IP | mutación; GET autenticado sin límite |
| `/api/auth/discord/callback` (ciszubot) | 20/min por IP | protege exchangeCode→Discord |
| bot `/api/votes` + `/api/votes/dbl` | 10/h por IP | webhook de votos |
| `/api/auth/discord` (ciszubot) | — | redirect sin coste (el callback ya limita) |
| `/api/leaderboard` (muzicmania) | cache 60s | actúa de límite natural |
| `/api/ping`, `/api/build-status`, `/api/download/windows` | — | GET estáticos/triviales |

- El rate limit es **en memoria por instancia** (suficiente contra abuso trivial de scripts);
  la defensa edge real (rate limiting de Cloudflare) está planificada en la Fase B con dominio —
  ver `CLOUDFLARE_SYSTEM.md`.

### Si la tarea toca secrets/envs
- [ ] NUNCA fallbacks con valores reales en código (quedan en git para siempre). Secrets solo
      como `process.env.X` (sin prefijo) en server-only.
- [ ] `NEXT_PUBLIC_` **viaja al bundle del navegador**: solo poner ahí lo público por diseño
      (anon key publishable, site keys de CAPTCHA, URLs).
- [ ] En Vercel: secrets con target **SOLO `production`**; los previews NO deben tener datos
      reales (fallan limpio al autenticar/tocar datos).
- [ ] Antes de añadir un archivo, comprobar que no exista ya por hash en `shared/`/ciszukoantony
      (regla anti-duplicación del repositorio).

### Si la tarea crea una web/landing nueva (o despliega en Vercel)
- [ ] `robots.ts` desde el día 1: allow `/`, disallow `/api/` y rutas autenticadas
      (`/dashboard` en ciszubot).
- [ ] Verificar `/robots.txt` en el output del build + `X-Robots-Tag: noindex` en previews
      (Vercel lo añade automáticamente a los deployments de preview).
- [ ] Middleware `src/middleware.ts` con cabeceras de seguridad (`X-Content-Type-Options:
      nosniff`, `Referrer-Policy`, `Strict-Transport-Security`; sin `X-Frame-Options` para
      permitir previews de Vercel) + **CSP** vía `buildCsp()` de `@ciszunetwork/utils` + sensor
      IAST (`createIast('<app>')`). Verificar en build output `ƒ Middleware`.

### Regla de oro (siempre)
- [ ] Verificar con fuentes EXTERNAS (dbvr, curl, grep del bundle, output del build). Si se
      cambia RLS/grants, comprobar que NO se rompió lo que ya funcionaba — p.ej. la web de
      ciszubot lee `bot_status` con anon: conservar ese grant.

---

## 3. Verificaciones SQL (dbvr)

Estado canónico del esquema de seguridad (hechos, verificables en cualquier momento):

- **RLS**: 28/28 tablas de los schemas app con RLS.
- **Grants anon**: SOLO `ciszubot.bot_status` SELECT (estado público intencional) +
  `ciszunetwork.messages` INSERT (formulario de contacto) + los SELECT/INSERT públicos por
  policy de muzicmania.
- **Funciones**: 0 funciones SECURITY DEFINER con EXECUTE anon (todas INVOKER con
  `search_path` fijo).

Queries de verificación (datasource `supabase` configurada en dbvr):

```bash
# 1. Tablas sin RLS en los schemas app
dbvr sql -ds=supabase "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname IN ('muzicmania','ciszubot','ciszunetwork','public') ORDER BY 1,2"

# 2. Grants de anon (solo bot_status SELECT + messages INSERT + policies públicas)
dbvr sql -ds=supabase "SELECT grantee, table_schema, table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee='anon' ORDER BY 1,2"

# 3. EXECUTE anon en una función RPC concreta (esperado: false)
dbvr sql -ds=supabase "SELECT has_function_privilege('anon','public.get_email_by_username(text)'::regprocedure,'EXECUTE')"
```

**Protocolo**: tras CUALQUIER cambio de policies/funciones/migraciones → re-ejecutar los 3
checks + revisar Security y Performance Advisors en el Dashboard. Reglas para evitar los
advisors:

- Toda llamada `auth.uid()`/`auth.role()`/`auth.jwt()` en USING/CHECK de policies debe ir
  envuelta en `(SELECT auth.X())`.
- No usar `FOR ALL` — separar en policies individuales por comando (SELECT/INSERT/UPDATE/
  DELETE) y mergear con OR las que repitan rol+acción.

---

## 4. Herramientas de seguridad (comandos)

### En cada push/PR y diario (CI — GitHub Actions)

El pipeline de seguridad corre **concurrentemente** (jobs independientes) y **cotidianizado**
(cron diario en `ci.yml` + DAST semanal en `dast.yml`):

| Job | Workflow | Cuándo | Qué verifica |
| --- | --- | --- | --- |
| `lint` | ci.yml | push/PR/diario | eslint de las webs |
| `unit-tests` | ci.yml | push/PR/diario | Vitest (incl. tests de IAST) |
| `semgrep` (SAST) | ci.yml | push/PR/diario | semgrep p/security-audit |
| `audit` (SCA) | ci.yml | push/PR/diario | `pnpm audit --prod --audit-level high` (fail si HIGH/CRITICAL) |
| `gitleaks` (DACP) | ci.yml | push/PR/diario | secret scanning del **diff del push/PR** (NO historial — se purga con filter-branch si el repo se hace público), binary oficial, allowlist `.gitleaks.toml` (token público del beacon de Cloudflare Web Analytics) |
| `security-e2e` (DAST) | ci.yml | push/PR/diario | Playwright `security.spec.ts` contra las 4 webs en prod: cabeceras HTTP, no-reflejo XSS/SQLi, sin 5xx, paths de escáneres, POST mutante a `/api/votes` |
| `zap-scan` (DAST full) | dast.yml | lunes 06:30 UTC + dispatch manual | ZAP baseline scan (matrix 4 webs), reportes HTML como artefacto 30 días |

Notas del pipeline:

- `security-e2e` espera hasta 180s en CI a que terminen los deploys de Vercel del mismo push
  (el middleware nuevo puede tardar ~1-2 min en llegar a prod); el spec de cabeceras tolera 403
  transitorios del edge (reintentos con backoff por sitio).
- El chequeo de no-reflejo XSS/SQLi elimina el **flight data** de Next.js
  (`self.__next_f.push(...)`) del body antes de comparar: el router serializa la URL con su
  query decodificado en esos bloques → falsos positivos de "payload reflejado".
- GitHub Secret Scanning nativo (DAA) NO está disponible en repos privados del plan Free
  (API 403) → la detección de secretos en CI la hace **gitleaks** (DACP) + el hook pre-commit
  local (secretlint). Documentado en `TOOLS_SYSTEM.md`.

Re-verificación: `gh run list --workflow=ci.yml` / `gh run list --workflow=dast.yml`; DAST
manual: `gh workflow run dast.yml`.

### Locales

| Herramienta | Comando | Uso |
| --- | --- | --- |
| **semgrep** | `semgrep scan --config p/security-audit` | SAST estático sobre apps + packages + bot + scripts; 0 findings reales esperados |
| **gitleaks** | `gitleaks.exe` | secret scanning del diff (historial tiene ~135 leaks históricos conocidos que lo bloquearían siempre) |
| **secretlint** | `secretlint` (npm global) | hook pre-commit activo (`.git/hooks/pre-commit`, ignora con `--no-verify`); config `.secretlintrc.json` (preset-recommend + patrones custom `sbp_`, `vcp_`, `sb_secret_`, JWT). Full scan por subtargets por tamaño del repo |
| **trivy** | `trivy fs --db-repository mirror.gcr.io/aquasec/trivy-db .` | SBOM/contenedores; pnpm-lock 0 vulns HIGH/CRITICAL |
| **pnpm audit** | `pnpm audit --prod` | 0 vulns esperados |
| **cargo-audit** | `cargo audit` (en `projects/muzicmania/launcher/src-tauri`) | 17 warnings permitidos: glib (tauri 3) + unic-ucd-version (transitivo) |
| **ZAP** | daemon + API (`zap.bat`, requiere JAVA_HOME) | DAST profundo: spider + ascan; 0 High / 4 Medium históricos en ciszunetwork (CSP resuelto, resto aceptados) |

**Regla**: si un comando falla porque la herramienta no está instalada → instalarla
(`winget install` / `pnpm add -g`) y documentarla. Preferir WinGet para bins de Windows.

---

## 5. Cifrado / vault

El vault de credenciales (`services/supabase/.env`) está protegido por capas y su gestión
completa vive en **`VAULT_SYSTEM.md`** (amenazas, inventario, procedimientos, checklist).

Protocolo mínimo del vault:

- La copia maestra va cifrada con **age** (`services/supabase/.env.age` + bundle
  `archives/backups/envs/`); la identity vive en `C:\Users\fplay\.ciszu\`.
- `scripts/vault.ps1` gestiona `crypt|decrypt|verify|backup|keygen|lock-acl`; `verify` +
  checklist se corren periódicamente.
- ACLs NTFS (fplay+SYSTEM) sobre identity, `.env`, `.env.age` y bundles.
- `update-env-keys.js` cifra los backups que genera antes de cada rotación.
- Los tokens en rotación se listan en `scripts/tokens_a_rotar.md` (sin valores).

**Reglas de credenciales**:
- Los archivos que documentan secrets en texto plano están **eliminados/redactados** y no
  vuelven a crearse: las credenciales reales viven SOLO en el vault.
- Nunca pegar secrets en docs; nunca trackear `.env` reales (solo plantillas `.example`).
- `NEXT_PUBLIC_` es público por diseño (viaja al bundle); los secrets van como
  `process.env.X` sin prefijo en server-only.
- Si el repo se hace público: rotar TODAS las credenciales, purgar historial con
  `git filter-branch`/BFG y verificar `git log --all -p | grep -i "sb_\|vcp_\|ghp_\|token\|secret\|key"`.

---

## 6. Monitoreo y errores

Doc maestro de errores: **`ERRORS_SYSTEM.md`**. Capas de observabilidad:

- **IAST runtime** (`packages/utils/src/iast.ts`, `createIast(app)`, edge-safe, 0 deps npm):
  sensor en el middleware de las 4 webs. Detecciones: sql-injection (critical),
  command-injection (critical), xss (high), path-traversal (high), secret-in-request (high —
  la evidencia se redacta `[REDACTED]` para no re-exponer el valor), ssrf-localhost (high),
  scanner-probe (medium — `.env`/`.git`/`wp-admin`). **Solo observa, no bloquea**; findings por
  `console.warn('[IAST] {...json}')` → Vercel Logs/Sentry. Dedupe en memoria (fingerprint
  payload+ruta+método, TTL 5 min) + dedupe interno tipo+fuente+regla. `observeBody()` para
  cuerpos fuera del middleware. Tests: `packages/utils/tests/iast.test.ts`.

  Re-verificación:
  ```bash
  pnpm exec vitest run packages/utils/tests/iast.test.ts
  curl "http://localhost:3210/buscar?q=1'%20OR%201=1%20--"   # log [IAST] {...sql-injection...}
  curl "http://localhost:3210/?q=<script>alert(1)</script>"
  curl "http://localhost:3210/.env"                           # scanner-probe
  ```

- **Sentry** (`@sentry/nextjs` en las 4 webs + `@sentry/node` en el bot): org `ciszu-network`
  con 5 proyectos; sin `SENTRY_DSN` el SDK es no-op. Config client en
  `src/instrumentation-client.ts` (el plugin v10 solo auto-detecta `sentry.client.config.ts`
  en la RAÍZ, no en `src/`); server/edge en `sentry.server/edge.config.ts` + `instrumentation.ts`
  con `register()`/`onRequestError`. Source maps solo si `SENTRY_AUTH_TOKEN` (solo production).
  CSP: `connect-src` incluye `https://*.ingest.us.sentry.io`.
- **PostHog** (analítica pura): 1M eventos/mes free; las 4 webs se separan con la propiedad
  `app`. Ver `ANALYTICS_SYSTEM.md`.
- **UptimeRobot + ntfy**: 5 monitores KEYWORD; alertas por email + push app + ntfy watcher
  (`scripts/uptime-watch.js`, cron 5 min). Ver doc de UptimeRobot.
- **CSP**: `buildCsp()` en `packages/utils/src/csp.ts` (allowlist: self + Turnstile
  `challenges.cloudflare.com` + PostHog `us*.i.posthog.com` + Web Analytics
  `static.cloudflareinsights.com` + Supabase; ciszubot añade `cdn.discordapp.com`, muzicmania
  `wss://`). `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. `'unsafe-inline'`
  en script/style documentado (bootstrap inline de Next + estilos inline v3 PDWA).
  **En desarrollo (`NODE_ENV !== 'production'`)** `buildCsp()` añade `'unsafe-eval'` a
  `script-src` (lo exige el cliente de Next.js dev, sin él no hidrata → menú móvil y
  navegación muertas) y los orígenes del CDN local `http://localhost:8788`/`127.0.0.1` a
  `img-src`, `media-src`, `font-src` y `connect-src` (assets servidos por
  `scripts/serve-cdn.js` sin internet). En producción NO se incluyen.

---

## 7. Acceso e identidad

Principio rector: **acceso de rol mínimo** — no dar acceso de infra a quien no lo requiere.

- **Bot de Discord y rutas server-side** usan **service_role** (BYPASSRLS) → el RLS deny-all no
  les afecta. Antes de revocar grants anon, verificar quién consume cada tabla (policy pública
  intencional vs fuga de datos).
- **Previews de Vercel**: secrets solo en target `production` (los previews fallan limpio al
  autenticar/tocar datos reales); las vars públicas `NEXT_PUBLIC_*`/anon key sí en los 3
  targets por diseño. Previews NO indexables (`X-Robots-Tag: noindex` automático de Vercel).
- **Dashboard de ciszubot** (OAuth Discord): sesión HMAC sha256 7 días; `isGuildAdmin`
  (ADMINISTRATOR|MANAGE_GUILD); auditado en `ciszubot.audit_log`
  (login/login_failed/logout/config_update) vía `src/lib/audit.ts` (best-effort, nunca
  bloquea). `command_logs` del bot como segunda fuente.
- **Databases**: 0 columnas password propias — auth = **bcrypt nativo de Supabase Auth**
  (`auth.users.encrypted_password`). NO inventar cifrado propio.
- **CORS**: inaplicable en REST de Supabase (PostgREST responde `ACAO: *` fijo, sin opción en
  ningún plan). La protección real es JWT + RLS deny-all + rate limits + API routes. Si un
  requerimiento pide "configurar CORS" → consultar `CORS_SYSTEM.md` antes de tocar nada.
- **Escalabilidad organizacional** (repartir permisos por rol cuando el equipo crezca):
  `ORGANIZATIONAL_SCALABILITY_PLAN.md`. La cuenta ya es GitHub Organization `Ciszu-Network`.
- **Rotación de credenciales**: lista en `scripts/tokens_a_rotar.md`; el protocolo de rotación
  y backup de `.env` está en `scripts/update-env-keys.js` + `VAULT_SYSTEM.md`.
- **Secret scanning**: gitleaks en CI (diff) + secretlint pre-commit local + auditoría manual
  del bundle compilado tras cada build.

