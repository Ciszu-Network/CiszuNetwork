# HISTORICAL_CONTEXT — Contexto histórico y tiempos actuales

Documento de referencia de dónde encaja Ciszu Network en el tiempo (ago 2026): contexto tecnológico, económico y social relevante para el ecosistema.

## Momento histórico del proyecto (línea interna)

- **Jul–ago 2026**: consolidación de seguridad y calidad:
  - 31/31 code scanning fixed, dependabot 35/36 (resta glib), secret scanning cerrada (PAT rotado).
  - Migraciones 04→17 aplicadas (RLS, advisors, bot_status, tablas ciszubot, cache ciszu, audit_log).
  - Sistema de formatos/entrega (avif/webp/opus), PDWA en 4 webs, PWA+manifest+sw.
  - Monitorización completa (UptimeRobot 5 endpoints + ntfy watcher), analítica PostHog, errores Sentry.
  - Limpieza de CDN (ciszu-assets 1.44 GB eliminado; ciszu-cdn 160 MB) y anti-duplicación 384 archivos.
  - Vault protegido (age + ACLs + BitLocker E:).
  - Documentación extensa migrada a inglés (solo nombres) + docs nuevos de estrategia.
- **Fase actual**: empresa unipersonal, pre-registro legal (Fase 0 sin costo, en línea).

## Contexto tecnológico de la era (2026)

- **IA generativa** es mainstream: agentes en terminal (opencode), modelos multi-modales. Ciszu usa IA para desarrollo (muletillas, generación de arte/música/video) con herramientas propias en `tools/`.
- **Web3/DeFi** consolidado todavía, pero Ciszu usa cripto solo como medio de pago (NOWPayments, MetaMask) — no NFTs.
- **Desktop apps** en declive frente a PWA/PDWA — Ciszu apostó por PDWA (4 webs) + Tauri para MuzicMania (desktop nativo con NSIS).
- **Cloud/hosting**: Vercel + Supabase Free tiers dominan el stack; Cloudflare (Fase A gratis) cubre captcha/analytics.
- **Seguridad**: el ciclo 2026 exige SAST/DAST, RLS estricto, rate limits, audit logs — todo aplicado en el repo.

## Contexto económico VE (2026)

- Dolarización parcial de facto; transacciones digitales via Binance P2P/Zinli/cripto comunes.
- Formalización emprendedora accesible en línea (RIF persona natural gratis en SENIAT, SAPI, SAREN) — Fase 0 alcanzable sin tarjeta.
- Restricciones de banca internacional (PayPal limitado desde VE), lo que justifica el stack de pagos multicanal crypto-first.

## Tiempos actuales (relevante para el producto)

- **Audiencia**: gamers + creadores de contenido + música (MuzicMania, bot de Discord Lounge, portfolios). En 2026, Discord sigue fuerte en comunidad; TikTok/Instagram forman la red social central para tráfico.
- **Modelo económico**: freemium + donaciones (NOWPayments), bots para monetización en comunidades; el plan de madurar hacia LLC (18 años) está documentado.

## Cómo usar este doc

- Sirve de ancla para decisiones estratégicas y de tono de marca: neón cian/rosa, Geomanist, eslogan. Actualizar trimestralmente con hitos relevantes (registro legal, primeros ingresos, crecimiento de comunidad).

_Última revisión: 11 ago 2026._