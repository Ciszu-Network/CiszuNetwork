# MuzicMania — Workflow de la app

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: WORKFLOW_APP_muzicmania_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Como actua MuzicMania pagina a pagina y su ciclo de vida.

---


## 1. Flujo del usuario (recorrido principal)

1. Entra a la landing (`/`): ve la marca, navega a secciones.
2. Si necesita cuenta: `/login` o `/register` (Cloudflare + Turnstile + verificar correo opcional).
3. Usa las secciones principales y vuelve a la landing o contacta por `/support`.

## 2. Mapa del sitio (sitemap)

- `/`
- `/play`
- `/leaderboard`
- `/library`
- `/profile`
- `/profile/:id`
- `/profile/settings`
- `/terms`
- `/policy`
- `/rules`
- `/guidelines`
- `/license`
- `/download`
- `/changelog`
- `/faq`
- `/forum`
- `/help`
- `/information`
- `/stats`
- `/support`
- `/team`
- `/credits`
- `/reviews`
- `/fddp2026`

## 3. Comportamiento por pagina

- **`/`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/play`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/leaderboard`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/library`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/profile`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/profile/:id`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/profile/settings`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/terms`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/policy`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/rules`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.

## 4. Disparadores de GitHub Actions (workflows)

- CI: lint + test + typecheck + semgrep + audit + gitleaks (push/PR).
- Deploy: `deploy-muzicmania-website.yml` (push a main, deploy a Vercel desde la raiz).
- DAST (semanal) + Lighthouse CI (LCP/rendimiento) + uptime-watch (cada 5 min).

## 5. Eventos de negocio

- Feedback (FAB), donaciones (NowPayments), anuncios (impresiones/clics en GA4).
- Auth (login/registro/logout), partidas (MuzicMania), dashboard (CiszuBot).

---
_Ultima revision: 2026-08-26_. Relacionado: GLOBAL_SYSTEM, IMPLEMENTATION_PLAN.
