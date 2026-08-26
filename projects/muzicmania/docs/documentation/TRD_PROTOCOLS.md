# MuzicMania — Technical Requirement Document (TRD)

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: TRD_muzicmania_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Requisitos tecnicos de MuzicMania.

---


## 1. Arquitectura

- Monorepo pnpm; la web vive en `projects/muzicmania/website`.
- Next.js 15 App Router (RSC + client), Tailwind 4, @ciszu/ui (paquetes compartidos).
- Backend: RSC server + API routes + Supabase. Deploy: Vercel + GitHub Actions.

## 2. Stack

- Next.js 15
- Tailwind 4
- Supabase (schema muzicmania)
- Tauri (app escritorio)
- framer-motion

## 3. Integraciones

- Supabase (Postgres + auth + storage CDN `ciszu-cdn`).
- Google: GA4 + GTM + AdSense (scripts SSR en <head>; env NEXT_PUBLIC_*).
- PostHog (producto), Cloudflare Web Analytics (trafico), Sentry (errores).
- Cloudflare Turnstile (anti-bot), Feedback, ntfy/UptimeRobot (monitoring).

## 4. Componentes y paquetes

- `@ciszu/ui`: Modal, Toast, AdsProvider/AdFloat/AdPill, GoogleScripts, GlobalAdvisor, auth.
- `@ciszunetwork/cdn`: resolver de assets. `@ciszunetwork/db`: capa de datos server-only.

## 5. Rendimiento y seguridad

- Middleware con CSP + cabeceras; robots.ts (allow /, disallow /api/).
- RLS en toda tabla; rate limit en POST; secretos solo en vault.
- Core Web Vitals (Vercel Speed Insights en MuzicMania).

## 6. Entornos

- `development` (local, puerto fijo), `preview` (Vercel), `production` (main).

---
_Ultima revision: 2026-08-26_. Relacionado: PRD, BACKEND_SCHEMA, IMPLEMENTATION_PLAN.
