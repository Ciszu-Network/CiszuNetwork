# Reporte de completación — TO_DO_LIST (1 ago 2026)

Commit: `ae692ca` (pusheado a `main`) — "Completa tareas TO_DO_LIST: fixes consola muzicmania, logos CDN reales, XSS ciszukoantony, migracion 12, CI semgrep, dependabot cargo, Docker, notificaciones, AI art APIs"

## Tareas completadas

### Errores de consola (docs/ia_docs/TO_DO_LIST.md)
- **SSR crash en MuzicMania `/play`**: 9 inicializadores de localStorage protegidos con `typeof window` (playlists, scrollSpeed, audioOffset, showEarlyLate, showPrecisionMS, audioOutput, colorblindMode, highContrast, tactileControls). Build estático 35/35 OK.
- **Hydration mismatch**: `getLastMatch` protegido con estado `isHydrated`.
- **`ctx.roundRect` no soportado**: fallback a `ctx.rect` en `MusicVisualizer.tsx`.
- **StatsTicker**: try/catch alrededor de acceso a red/Supabase.
- **Fechas debug en /reviews**: fechas estáticas (eran `new Date()` evaluado en tiempo de build).
- **404 de logos/images**: fotos reales (`cisko-1.jpg`, `cisko-2.jpg`) en `public/images/francisco_selfie/` de las 4 apps + logos SVG/PNG correctos en ciszukoantony (rutas `/logos/imagen/outline/...` válidas, no las antiguas con espacios). Corregidas todas las referencias (team, about, projects, layouts, og).

### Vulnerabilidades GitHub (cierre de alertas)
- Secret scanning #1 (PAT `sbp_` en PRIVATE_DOCS.md) → **resolved/revoked** vía API. Además `git rm --cached` de ambos PRIVATE_DOCS.md + `.gitignore` (`**/PRIVATE_DOCS.md`, `services/supabase/.env`).
- Code scanning: 0 abiertas. Dependabot: solo #12 (glib, requiere Tauri 3 — no fixable) → ignorada.
- Añadido job **semgrep** al CI + ecosistema **cargo** a dependabot.

### Advisors Supabase (services/supabase/docs/ia_docs/TO_DO_LIST.md)
- **Migración 12 APLICADA** vía Management API (PAT de `services/supabase/.env`): REVOKE EXECUTE de anon/authenticated en las 3 funciones trigger SECURITY DEFINER restantes. Verificado por SQL: 0 SECURITY DEFINER ejecutables por anon/authenticated en `public` + `muzicmania`.
- Security advisors: 0 warnings accionables (resta solo `auth_leaked_password_protection`, limitación Free Tier). Performance: 0 warnings.

### Docker
- `docs/ia_docs/DOCKER.md` (guía + limitaciones honestas), `docker-compose.yml` (ciszu-bot + supabase-local con profile), `apps/ciszubot/Dockerfile` (node:20-alpine, no-root), `.dockerignore`, `apps/ciszubot/.env.example`.
- ⚠️ **Docker Desktop NO está instalado** en la máquina: instalar manualmente (WSL2 + reinicio) cuando el usuario despierte — pasos en DOCKER.md.

### DevSecOps
- README.md raíz: sección oficial "Filosofía y DevSecOps" enlazando DEVSECOPS.md y CODE_PRINCIPLES.md (ya referenciados por AGENTS.md).

### Notificación IA → teléfono
- Investigado: **ntfy.sh** (gratis, sin registro, push directo) + script `scripts/notify.js` creado y funcional. Complemento: plugin opencode-notify (toasts Windows). Documentado en `docs/ia_docs/NOTIFICACIONES.md`.
- ⚠️ Pendiente del usuario: instalar la app ntfy en el móvil y elegir topic.

### AI APIs artísticas (Leonardo/Recraft/SiliconFlow/Creen)
- Investigadas las 4: precios verificados jul/ago 2026. **NO existen claves** en ningún `.env` del proyecto.
- Recomendación: Recraft (SVG nativo → iconos), Leonardo (assets MuzicMania), SiliconFlow (FLUX barato), Creen (manual gratuito, sin API). Plan de integración en `docs/ia_docs/AI_ART_APIS.md`.
- ⚠️ Pendiente del usuario: generar las claves si quiere automatizar.

## Verificación final
- Builds: **4/4 OK** (ciszunetwork-page, ciszuko-network, muzicmania-next, ciszubot-web).
- Lint: OK en las 3 apps con script (ciszubot-web no tiene).
- gitleaks protect: 0 leaks. secretlint: sin hallazgos en cambios nuevos.
- Commit `ae692ca` + push a `main` OK (DNS de github.com ya resuelve — el push ya no falla).

## Pendientes del usuario al despertar
1. Instalar Docker Desktop (pasos en DOCKER.md).
2. Instalar app ntfy en el móvil (NOTIFICACIONES.md).
3. Generar claves AI (Leonardo/Recraft/SiliconFlow) si quiere automatizar arte (AI_ART_APIS.md).
4. (Opcional) Deploy: los cambios se despliegan solos con el push a main (4 workflows).
