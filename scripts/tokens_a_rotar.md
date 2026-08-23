# Tokens a rotar — Ciszu Network (pendientes de la sesión de seguridad jul 2026)

> ⚠️ Este archivo se regeneró el 2 ago 2026 tras borrado accidental de la versión original
> (con valores). Los ítems pendientes de rotar están documentados en AGENTS.md. Los
> VALORES exactos de cada token deben consultarse/regenerarse en cada panel:

1. **Supabase service_role** — Dashboard → Settings → API (regenerar)
2. **Supabase JWT secret** — Dashboard → Settings → API (regenerar)
3. **Supabase password del dashboard** — Settings → Account
4. **Supabase anon key** — Dashboard → Settings → API (regenerar)
5. **Vercel token `vcp_`** — ✅ **ROTADO 10 ago 2026**: nuevo token en `.env.local` (raíz, key `VERCEL_TOKEN`) y GH secret `VERCEL_TOKEN` actualizado con el mismo valor. No hace falta volver a rotarlo.
6. **Suno AI key** — suno.com → Account → API keys
7. **Cloudflare R2** — dashboard.cloudflare.com → R2 → API tokens (credenciales comentadas en vault, R2 INACTIVO)
8. **Discord token** — Discord Developer Portal → Bot → Reset Token (el token actual es el nuevo del team; revocar/rotar si se filtra)
9. **PostHog Secret API Key `phs_`** — ✅ **ROTADA 10 ago 2026 por el usuario**; valor nuevo en vault `services/supabase/.env` (`POSTHOG_SECRET_API_KEY`). ⚠️ Es una **Project Secret API Key (PSAK)**: solo se usa en endpoints específicos que la aceptan (p.ej. `endpoint:run`); NO funciona en `/api/projects/*` (401 "invalid personal API key" es el comportamiento esperado — esos endpoints solo aceptan `phx_`). No es necesaria para el tracking web.

## Estado conocido
- ✅ PAT viejo `sbp_` (filtrado): REVOCADO por el usuario (cierra alerta secret scanning)
- ✅ PAT nuevo `SUPABASE_ACCESS_TOKEN`: activo (vault `services/supabase/.env`)
- ✅ Migración 11: APLICADA (31 jul 2026) con el PAT nuevo
- ✅ Token Vercel `vcp_`: ROTADO (10 ago 2026) — nuevo valor en `.env.local` + GH secret `VERCEL_TOKEN`
- ✅ PostHog (10 ago 2026): Personal `phx_` y Project `phc_` VERIFICADAS contra la API (proyecto "Ciszu Network" 550383); envs locales ×4 + Vercel ×4 configuradas; **Authorized URLs (4 dominios) configurados vía PATCH `app_urls`**; Secret `phs_` rotada (PSAK — solo endpoints que la aceptan)
- ✅ **Cloudflare Turnstile (23 ago 2026)**: sitekey/secret ROTADOS y alineados en los 4 `.env.local` de las webs (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`). Código de verificación (`api/verify-turnstile`) usa `process.env.TURNSTILE_SECRET_KEY` (server-only) en las 4 webs. ⚠️ **Turnstile Free ata cada sitekey a dominios registrados**: usar la MISMA sitekey en 4 dominios distintos puede dar `ratelimited`/fallos de verificación en los no registrados; verificar en el dashboard que los 4 dominios (ciszunetwork, ciszukoantony, muzicmania, ciszubot .vercel.app) estén asociados al widget, o crear un widget por web.
- ⏳ Resto de ítems (1-4, 6-8): PENDIENTES — rotar y actualizar `.env` con `scripts/update-env-keys.js`
