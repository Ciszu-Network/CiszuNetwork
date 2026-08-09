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

## Conclusión / política

- Estas 4 categorías **no las cubre el flujo normal de generación de código**: verificar
  siempre al tocar DB, auth o endpoints (y re-ejecutar los checks de las secciones 1-4).
- Pendientes relacionados (NO incluidos por decisión del usuario): rotación de keys de
  Turnstile de MuzicMania (secret en git como fallback — se rotará cuando el repo sea
  público) y tokens de Supabase (lista en `scripts/tokens_a_rotar.md`).
