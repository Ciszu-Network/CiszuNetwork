# Tareas de seguridad que las IAs no hacen por defecto (auditadas 10 ago 2026)

> **Motivo de este documento**: hay 4 categorías de trabajo de seguridad que los LLMs/agentes
> **no aplican por defecto** al generar código (se centran en la funcionalidad y asumen que
> el entorno está seguro). Son fin de seguridad, protección de secretos y verificación de
> API keys/tokens. Este documento registra el estado verificado (10 ago 2026), los fixes
> aplicados y **cómo re-verificar** cada una. Cubre las **4 websites** (muzicmania,
> ciszunetwork, ciszubot, ciszukoantony) + bot + BD Supabase.

---

## 1. RLS — Supabase abierto a todo el mundo

**Estado previo**: muzicmania 11/11 tablas con RLS, pero **14 tablas de `ciszubot` SIN RLS**
y grants anónimos (SELECT/INSERT/UPDATE/DELETE) sobre `command_logs` y `guild_config`.
Además la RPC **`public.get_email_by_username` tenía EXECUTE para anon** → cualquiera podía
extraer el **email de cualquier usuario** (exfiltración de PII vía PostgREST, sin login).

**Fixes aplicados (migración 16, `20260810000016_security_hardening.sql`)**:
1. `REVOKE EXECUTE` de `get_email_by_username` a anon/authenticated — el login con `@username`
   de MuzicMania pasó a la API route `/api/auth/resolve-username` (service_role + rate limit).
2. `REVOKE ALL` de anon/authenticated en `ciszubot.command_logs` y `ciszubot.guild_config`.
3. `ciszunetwork.messages`: anon conserva SOLO `INSERT` (formulario de contacto); revocados
   UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER.
4. `ENABLE ROW LEVEL SECURITY` en las 13 tablas de ciszubot sin RLS (afk, alliances,
   discord_users, giveaways, guild_configs, inventory, levels, shop_items, snipes, tickets,
   transactions, wallets, warns) → deny-all para anon/authenticated. El bot y el dashboard
   usan **service_role** (BYPASSRLS) → siguen funcionando idéntico.

**Estado final verificado**: 28/28 tablas de los schemas app con RLS ✅ · grants anon solo
`ciszubot.bot_status SELECT` (estado público intencional) + `ciszunetwork.messages INSERT` +
los SELECT/INSERT públicos por policy de muzicmania ✅ · 0 funciones SECURITY DEFINER con
EXECUTE anon (todas INVOKER con search_path fijo) ✅.

**Cómo re-verificar** (dbvr):
```bash
dbvr sql -ds=supabase "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname IN ('muzicmania','ciszubot','ciszunetwork','public') ORDER BY 1,2"
dbvr sql -ds=supabase "SELECT grantee, table_schema, table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee='anon' ORDER BY 1,2"
dbvr sql -ds=supabase "SELECT has_function_privilege('anon','public.get_email_by_username(text)'::regprocedure,'EXECUTE')"
```
Regla: tras cualquier cambio de policies/funciones → revisar Security Advisors en el Dashboard
y re-ejecutar los checks de arriba.

---

## 2. API keys en el frontend

**Estado previo**: sin hallazgos críticos; se auditaron los 4 proyectos.

**Verificación realizada**:
- `service_role` / `sb_secret_*` solo existen en **server-side** (`lib/supabaseServer.ts`,
  `scripts/supabaseAdmin.ts`, rutas `app/api/*`, bot `src/services/supabase.ts`) — nunca en
  componentes cliente. ✅
- **Bundles compilados** (`.next/static/chunks`): solo aparecen valores **públicos por diseño**
  (`NEXT_PUBLIC_SUPABASE_ANON_KEY` = publishable, site keys de Turnstile/reCAPTCHA). Cero
  `sb_secret_*`, cero secrets de Turnstile/reCAPTCHA/recaptcha secret. ✅
- **Ningún `.env` real trackeado** en git (solo plantillas vacías como
  `services/supabase/.env.r2.example`). `.env.local` de las 4 apps están gitignored. ✅
- **Sin tokens hardcodeados** en código (grep `ghp_`, `vcp_`, tokens de Discord `MTM5NTUz`,
  `sk-`, `AIza` → 0 matches). ✅

**Regla de oro**: en Next.js, cualquier variable con prefijo `NEXT_PUBLIC_` **viaja al bundle
del navegador**. Solo poner ahí lo que es público por diseño (anon key publishable, site keys
de CAPTCHA, URLs). Los secrets van SIEMPRE como `process.env.X` sin prefijo y se usan solo
en server components/routes. El hook pre-commit (secretlint + gitleaks) bloquea commits con
valores sospechosos.

**Cómo re-verificar**:
```bash
grep -rn "sb_secret" projects/*/website/src   # 0 matches esperado
grep -rn "NEXT_PUBLIC" projects/*/website/src/app  # solo vars publicas por diseño
# En un build reciente, buscar secrets en el bundle:
grep -rn "sb_secret_|TURNSTILE_SECRET_KEY|RECAPTCHA_SECRET_KEY" projects/*/website/.next/static
git ls-files | grep -E "\.env[^.]"  # solo plantillas .example
```

---

## 3. Rate limits en endpoints

**Estado previo**: ya había rate limiting en `packages/utils` (`createRateLimiter`) aplicado
al bot (`/api/votes` 10/h, `/api/votes/dbl`) y MuzicMania leaderboard (cache 60s). Faltaba en
el resto de endpoints.

**Fixes aplicados (10 ago 2026)** — `createRateLimiter` de `@ciszunetwork/utils` (ahora dep de
las 4 webs; añadido a ciszu y ciszukoantony):

| Endpoint | Límite | Nota |
| --- | --- | --- |
| `/api/verify-turnstile` (×4 webs) | 30/min por IP | 429 + `Retry-After` |
| `/api/auth/resolve-username` (muzicmania) | 10/min por IP | nuevo (sustituye RPC pública) |
| `/api/dashboard/[guildId]` POST (ciszubot) | 10/min por IP | GET autenticado sin límite |
| `/api/auth/discord/callback` (ciszubot) | 20/min por IP | protege exchangeCode→Discord |
| bot `/api/votes` + `/api/votes/dbl` | 10/h por IP | ya existía |
| `/api/auth/discord` (ciszubot) | — | redirect sin coste (el callback ya limita) |
| `/api/leaderboard` (muzicmania) | cache 60s | actúa de límite natural |
| `/api/ping`, `/api/build-status`, `/api/download/windows` | — | GET estáticos/triviales |

Nota: es rate limit **en memoria por instancia** (suficiente contra abuso trivial de scripts;
para defensa edge real está planificado el rate limiting de Cloudflare en la Fase B con
dominio — ver `CLOUDFLARE_SISTEMA.md`).

**Cómo re-verificar**: las rutas devuelven `429` + `Retry-After` al superar el límite
(`curl -X POST .../api/verify-turnstile` repetido 31 veces).

---

## 4. Staging no indexable + autenticación sin datos reales

**Estado previo**: las 4 webs NO tenían robots.txt/robots.ts; los previews de Vercel son
desindexables por defecto pero no estaba documentado; las envs de preview no estaban auditadas.

**Fixes/verificación aplicados**:
1. **`robots.ts` añadido a las 4 webs** (`MetadataRoute.Robots`): allow `/`, disallow `/api/`
   (y `/dashboard` en ciszubot). Sirve en `/robots.txt` en producción y preview.
2. **Previews no indexables**: Vercel añade automáticamente `X-Robots-Tag: noindex` a los
   deployments de preview (`*.vercel.app` de preview) → el "staging" NO aparece en Google.
   Con robots.ts además `/api/*` y `/dashboard` nunca se indexan ni en producción.
3. **Auth sin datos reales en previews (auditado vía API Vercel)**: los secrets del dashboard
   de ciszubot (`DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`,
   `SUPABASE_SERVICE_ROLE_KEY`) están **solo en production** → los previews no pueden
   autenticar ni tocar datos reales (fallan limpio). Las vars públicas
   (`NEXT_PUBLIC_*`, anon key) sí están en los 3 targets por diseño (publishable).

**Cómo re-verificar**:
```bash
# envs por target (Vercel API):
# GET /v9/projects/<proyecto>/env → revisar que los secrets tengan target SOLO production
curl -s -I https://<preview>.vercel.app/  # debe incluir X-Robots-Tag: noindex
curl -s https://ciszunetwork.vercel.app/robots.txt  # debe listar disallow /api/
```

---

## 5. IAST — sensor runtime en las 4 webs (11 ago 2026)

**Qué es**: IAST (Interactive Application Security Testing) coloca un sensor DENTRO de la app
que observa el tráfico real. Implementado sin dependencias npm en
`packages/utils/src/iast.ts` (`createIast`, edge-safe: solo regex puras → corre en el
middleware de Next.js y en cualquier runtime). Los findings salen por `console.warn` con
prefijo `[IAST]` (JSON estructurado: `app, method, path, findings[{type,severity,rule,evidence,source}], detectedAt`)
→ consumibles en Vercel Logs/Sentry.

**Reglas de detección** (RULES en iast.ts): sql-injection (critical), command-injection
(critical), xss (high), path-traversal (high), secret-in-request (high — **DACP runtime**:
exfiltración de secrets en params/headers; la evidencia se **redacta** `[REDACTED]` para no
re-exponer el valor), ssrf-localhost (high), scanner-probe (medium — .env/.git/wp-admin...).

**Características**: dedupe en memoria por fingerprint (payload+ruta+método, TTL 5 min, evita
spam del log) + dedupe interno por tipo+fuente+regla (colapsa el par `k=v` y el valor);
**NO bloquea tráfico** (solo observa — el bloqueo lo hacen Turnstile/rate limit); `observeBody()`
para cuerpos fuera del middleware; `stats()` para tests; `resetIastDedupe()` para tests.

**Integración**: middleware de las 4 webs (`src/middleware.ts`; ciszunetwork y ciszubot NO
tenían middleware — se crearon con el mismo patrón + cabeceras de seguridad:
`X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`; sin
`X-Frame-Options` para permitir previews de Vercel). El middleware corre en edge → coste
~0 y sin round-trip extra.

**Tests**: `packages/utils/tests/iast.test.ts` (11 tests — SQLi, XSS, traversal, command
injection, secrets redactados, probes de escáneres, no-findings, dedupe, formato del log).

**Cómo re-verificar**:
```bash
# 1. Unit tests del sensor
pnpm exec vitest run packages/utils/tests/iast.test.ts
# 2. Runtime local (next start de cualquier web + payload)
curl "http://localhost:3210/buscar?q=1'%20OR%201=1%20--"   # el log muestra [IAST] {...sql-injection...}
curl "http://localhost:3210/?q=<script>alert(1)</script>"
curl "http://localhost:3210/.env"                           # scanner-probe
# 3. Producción (tras deploy): Vercel Logs → filtrar "IAST"
```

---

## 6. Seguridad en CI — tareas concurrentes y cotidianizadas (11 ago 2026)

El pipeline de seguridad corre en GitHub Actions **concurrentemente** (cada job es
independiente) y está **cotidianizado** (cron diario en `ci.yml` + DAST semanal):

| Job | Workflow | Cuándo | Qué verifica |
| --- | --- | --- | --- |
| `lint` | ci.yml | push/PR/diario | eslint de las webs |
| `unit-tests` | ci.yml | push/PR/diario | Vitest 157 tests (incl. IAST 11) |
| `semgrep` (SAST) | ci.yml | push/PR/diario | semgrep p/security-audit |
| `audit` (SCA) | ci.yml | push/PR/diario | `pnpm audit --prod --audit-level high` (fail si HIGH/CRITICAL) |
| `gitleaks` (DACP) | ci.yml | push/PR/diario | **secret scanning del diff del push/PR** (NO historial: ~135 leaks históricos conocidos lo bloquearían siempre — se purgan con filter-branch si el repo se hace público), v8.30.1 binary oficial, allowlist `.gitleaks.toml` cubre el token público del beacon de Cloudflare Web Analytics |
| `security-e2e` (DAST) | ci.yml | push/PR/diario | Playwright `security.spec.ts` contra las 4 webs en prod: cabeceras HTTP, no-reflejo XSS/SQLi, sin 5xx, paths de escáneres, POST mutante a `/api/votes` |
| `zap-scan` (DAST full) | dast.yml | **lunes 06:30 UTC** + dispatch manual | ZAP baseline scan (zaproxy/action-baseline v0.15.0) sobre las 4 webs (matrix), reportes HTML como artefacto 30 días |

**Notas**:
- `security-e2e` espera hasta 180s en CI a que terminen los deploys de Vercel del mismo push
  (el middleware nuevo de una web puede tardar ~1-2 min en llegar a prod); en local falla
  rápido con mensaje claro.
- El spec de cabeceras tolera 403 transitorios del edge de Vercel (reintentos con backoff por sitio).
- El chequeo de no-reflejo XSS/SQLi elimina el **flight data** de Next.js
  (`self.__next_f.push(...)`) del body antes de comparar: el router serializa la URL con su
  query decodificado en esos bloques, lo que producía falsos positivos de "payload reflejado".
- El DAST semanal con ZAP es el "escaneo profundo" programado; el `security-e2e` es el
  control diario rápido.
- GitHub Secret Scanning nativo (DAA) NO está disponible en repos privados del plan Free
  (respuesta API 403) → la detección de secretos en CI la hace **gitleaks** (DACP) + el hook
  pre-commit local (secretlint). Documentado en `TOOLS.md`.

**Cómo re-verificar**: `gh run list --workflow=ci.yml` / `gh run list --workflow=dast.yml`;
abrir un job y ver los checks. Ejecutar manualmente el DAST: `gh workflow run dast.yml`.

---

## 7. Estado verificado del toDo de BD — Supabase (11 ago 2026)

> Análisis completo del `services/supabase/docs/documentation/toDo.md`, **verificado con
> fuentes externas** (dbvr, OPTIONS HTTP, grep del código). Objetivo: que las IA no
> re-abran ítems ya resueltos ni marquen como "pendiente" lo que es inaplicable.
> ⚠️ El toDo.md solo lo edita Ciszuko Antony — este doc es la evidencia de cada ítem.

| # | Ítem del toDo | Estado | Evidencia / Acción |
|---|---|---|---|
| 1 | Contraseñas 100% cifradas | ✅ **Cubierto** | `auth.users.encrypted_password` = **bcrypt** (`$2a$10$` confirmado por query). Cero columnas password en schemas app. NO inventar cifrado propio — Supabase Auth ya lo hace. |
| 2 | CORS restringido | ⚠️ **Inaplicable en Supabase** | PostgREST responde `ACAO: *` fijo (verificado con OPTIONS); sin opción en ningún plan. La protección equivalente (JWT + RLS deny-all + rate limits + API routes) ya está. → Doc maestro: **`CORS_SISTEMA.md`** (con plan de implementación futura en API routes/Cloudflare). |
| 3 | Validar datos en backend | ✅ **Cubierto** | `muzicmania.submit_game_score` valida en BD: `auth.uid()` obligatorio + rangos (score 0–9.999.999, accuracy 0–100) con RAISE EXCEPTION. Dashboard bot valida en route.ts. Turnstile ×4 webs. Gap menor (mensajes de contacto sin límite de longitud) aceptado: nadie renderiza esos datos. |
| 4 | Sanitizar inputs antes de guardar | ✅ **Cubierto (modelo correcto)** | En Supabase el modelo correcto NO es "sanitizar al guardar" (anti-patrón: destruye datos legítimos p.ej. `a<b`): queries parametrizadas (sin SQLi), escape en render (JSX escapa, DOMPurify solo HTML dinámico), + IAST runtime desde 11 ago. |
| 5 | CSP (Content Security Policy) | ✅ **Cubierto (11 ago 2026)** | `buildCsp()` en `packages/utils/src/csp.ts` (allowlist: self + Google Fonts self-hosted, Turnstile `challenges.cloudflare.com`, PostHog `us*.i.posthog.com`, Web Analytics `static.cloudflareinsights.com`, Supabase). Aplicada en el middleware de las 4 webs; ciszubot añade `cdn.discordapp.com` (avatares), muzicmania `wss://` (realtime). `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. `'unsafe-inline'` en script/style (bootstrap inline de Next, estilos inline v3 PDWA — documentado). E2E `security.spec.ts` ahora exige la cabecera. ZAP: "CSP not set" resuelto. |
| 6 (opc) | Logs de auditoría | ✅ **Cubierto (11 ago 2026)** | Migración 17: `ciszubot.audit_log` (RLS ON deny-all, grants SOLO service_role, cero anon/authenticated — verificado con dbvr). `src/lib/audit.ts` (best-effort, nunca bloquea) en el dashboard: login/login_failed/logout (OAuth Discord) + config_update por guild con campos. Se unió a `command_logs` del bot como fuente de auditoría. |
| 7 (opc) | Headers de seguridad | ✅ **Cubierto** | `X-Content-Type-Options: nosniff` + `Strict-Transport-Security` + `Referrer-Policy` + **CSP** en middleware de las 4 webs (11 ago). `X-Frame-Options` descartado deliberadamente (rompe previews de Vercel). |

**Regla para agentes futuros**: si un requerimiento pide "configurar CORS" → consultar
`CORS_SISTEMA.md` antes de tocar nada (respuesta estándar: inaplicable en REST de Supabase,
la seguridad real es RLS/JWT; opción futura en API routes o Cloudflare).

---

## Conclusión / política

- Estas 4 categorías **no las cubre el flujo normal de generación de código**: verificar
  siempre al tocar DB, auth o endpoints (y re-ejecutar los checks de las secciones 1-4).
- Pendientes relacionados (NO incluidos por decisión del usuario): rotación de keys de
  Turnstile de MuzicMania (secret en git como fallback — se rotará cuando el repo sea
  público) y tokens de Supabase (lista en `scripts/tokens_a_rotar.md`).

---

## Prevención — checklist para agentes en TODA implementación nueva

> Este checklist está internalizado en AGENTS.md ("A ejecutar en toda implementación nueva",
> §7 puntos). Copia operativa para el agente: **completar cada punto EN LA MISMA sesión que
> se escribe el código**, no en una campaña posterior (así se evitó la auditoría de 10 ago).

**Si la tarea crea una tabla Supabase / migración:**
- [ ] `ENABLE ROW LEVEL SECURITY` + policy explícita en la MISMA migración (recordar: Supabase
      da `GRANT ALL` a anon/authenticated por defecto en tablas nuevas → sin RLS = BD abierta).
- [ ] `dbvr sql -ds=supabase` con los 3 checks de la sección 1 tras aplicar (no confiar en el
      advisor del Dashboard: no avisa de tablas sin RLS ni de EXECUTE anon en funciones normales).

**Si la tarea crea/modifica una RPC o endpoint con datos de usuario:**
- [ ] `has_function_privilege('anon', ...)` para cada función RPC tocada.
- [ ] Datos personales (email, etc.): NUNCA vía RPC pública/PostgREST con anon → API route
      server-only (service_role) + rate limit.

**Si la tarea crea un endpoint POST (muta o consume servicio externo):**
- [ ] Rate limit con `createRateLimiter` de `@ciszunetwork/utils` (memoria → KV → Postgres).
      Referencias: verify-turnstile 30/min, callbacks OAuth 20/min, mutaciones 10/min,
      resolvers de datos personales 10/min.

**Si la tarea toca secrets/envs:**
- [ ] NUNCA fallbacks con valores reales en código (quedan en git). Secrets solo
      `process.env.X` en server-only. `NEXT_PUBLIC_` solo para lo público por diseño.
- [ ] En Vercel: secrets con target SOLO `production`; previews sin datos reales.

**Si la tarea crea una web/landing nueva (o despliega en Vercel):**
- [ ] `robots.ts` desde el día 1 (allow `/`, disallow `/api/` y rutas autenticadas).
- [ ] Verificar `/robots.txt` en el output del build + `X-Robots-Tag: noindex` en previews.

**Siempre (regla de oro):**
- [ ] Verificar con fuentes EXTERNAS (dbvr, curl, grep del bundle, output del build) — el
      estado que la IA "confirma" es la misma fuente que ella escribió. Si se cambia
      RLS/grants, comprobar que no se rompió lo que ya funcionaba (p.ej. `bot_status`
      SELECT anon lo consume la web de ciszubot).
