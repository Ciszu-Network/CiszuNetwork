# CiszuBot — Workflow de la app

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: WORKFLOW_APP_ciszubot_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Como actua CiszuBot pagina a pagina y su ciclo de vida.

---


## 1. Flujo del usuario (recorrido principal)

1. Entra a la landing (`/`): ve la marca, navega a secciones.
2. Si necesita cuenta: `/login` o `/register` (Cloudflare + Turnstile + verificar correo opcional).
3. Usa las secciones principales y vuelve a la landing o contacta por `/support`.

## 2. Mapa del sitio (sitemap)

- `/`
- `/comandos`
- `/dashboard`
- `/dashboard/:guildId`
- `/descargas`
- `/estado`
- `/feedback`
- `/login`
- `/privacidad`
- `/register`
- `/soporte`
- `/terminos`

## 3. Comportamiento por pagina

- **`/`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/comandos`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/dashboard`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/dashboard/:guildId`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/descargas`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/estado`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/feedback`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/login`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/privacidad`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.
- **`/register`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.

## 4. Disparadores de GitHub Actions (workflows)

- CI: lint + test + typecheck + semgrep + audit + gitleaks (push/PR).
- Deploy: `deploy-ciszubot-website.yml` (push a main, deploy a Vercel desde la raiz).
- DAST (semanal) + Lighthouse CI (LCP/rendimiento) + uptime-watch (cada 5 min).

## 5. Eventos de negocio

- Feedback (FAB), donaciones (NowPayments), anuncios (impresiones/clics en GA4).
- Auth (login/registro/logout), partidas (MuzicMania), dashboard (CiszuBot).

---
_Ultima revision: 2026-08-26_. Relacionado: GLOBAL_SYSTEM, IMPLEMENTATION_PLAN.
