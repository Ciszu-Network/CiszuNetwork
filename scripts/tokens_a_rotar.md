# Tokens a rotar — Ciszu Network (pendientes de la sesión de seguridad jul 2026)

> ⚠️ Este archivo se regeneró el 2 ago 2026 tras borrado accidental de la versión original
> (con valores). Los ítems pendientes de rotar están documentados en AGENTS.md. Los
> VALORES exactos de cada token deben consultarse/regenerarse en cada panel:

1. **Supabase service_role** — Dashboard → Settings → API (regenerar)
2. **Supabase JWT secret** — Dashboard → Settings → API (regenerar)
3. **Supabase password del dashboard** — Settings → Account
4. **Supabase anon key** — Dashboard → Settings → API (regenerar)
5. **Vercel token `vcp_`** — vercel.com → Settings → Tokens (regenerar y actualizar GH secret `VERCEL_TOKEN` usado por los 4 workflows)
6. **Suno AI key** — suno.com → Account → API keys
7. **Cloudflare R2** — dashboard.cloudflare.com → R2 → API tokens (credenciales comentadas en vault, R2 INACTIVO)
8. **Discord token** — Discord Developer Portal → Bot → Reset Token (el token actual es el nuevo del team; revocar/rotar si se filtra)

## Estado conocido
- ✅ PAT viejo `sbp_` (filtrado): REVOCADO por el usuario (cierra alerta secret scanning)
- ✅ PAT nuevo `SUPABASE_ACCESS_TOKEN`: activo (vault `services/supabase/.env`)
- ⏳ Migración 11: APLICADA (31 jul 2026) con el PAT nuevo
- ⏳ El resto de ítems (1-8): PENDIENTES — rotar y actualizar `.env` con `scripts/update-env-keys.js`
