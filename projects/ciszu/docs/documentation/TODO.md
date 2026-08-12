# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Pagos (metodología + NOWPayments) — EN IMPLEMENTACIÓN

- [x] Decisión: NOWPayments HOY (crypto sin KYC) → Lemon Squeezy a los 18 → Stripe con LLC. Metodología completa en `PAYMENTS_SYSTEM.md`.
- [x] Paquete `@ciszunetwork/payments` (NOWPayments client + IPN HMAC + Lemon Squeezy stub + donaciones por env) con 8 tests.
- [ ] **USUARIO**: cuenta NOWPayments + API key + IPN secret → vault.
- [ ] **USUARIO**: wallets MetaMask/TrustWallet (seeds a Bitwarden), Binance (P2P), Zinli.
- [ ] **USUARIO**: poner direcciones públicas en `DONATE_*` (vault) y sección "Apoyar" en las webs.
- [ ] **USUARIO (18 años)**: PayPal, Payoneer, Lemon Squeezy, Keygen API para licencias.
- [ ] **USUARIO (Futuro)**: migración schema `pagos` (orders/transactions con RLS) + rutas API `/api/payments/invoice` + `/api/webhooks/nowpayments`.

## Errores (Sentry) — CERRADA (12 ago 2026)

- [x] Decisión: Sentry (Developer free 5k errores, sin tarjeta). PostHog queda solo analítica. Detalle en `ERRORS_SYSTEM.md`.
- [x] SDK integrado: `@sentry/nextjs` en las 4 webs (client/server/edge configs + instrumentation + global-error + withSentryConfig) y `@sentry/node` en el bot (`services/sentry.ts`).
- [x] Cuenta sentry.io + org `ciszu-network` + 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot) + DSNs en env ×4 + bot + vault.
- [x] `SENTRY_AUTH_TOKEN` en Vercel production ×4 (source maps) + todas las features activadas (tracing 1.0, replays, feedback). Verificación en vivo OK (12 ago): feedback "prueba" → `CISZUNETWORK-3` en Feedback view; source maps subidos confirmado con build debug; alertas por email activas (sin Discord/Slack).

## Errores (Sentry) — MEJORA FUTURA (página dedicada)

- [ ] **Mover el widget de feedback de Sentry a una página dedicada por sitio** (hoy es botón flotante "Reportar un problema"). Razón: a veces tapa elementos de la UI. La página debe tener estética propia por sitio (neon por web, ya configurables los textos/tema en `feedbackIntegration`) y soportar **traducciones** (hoy textos configurables sin i18n automático). Ver `ERRORS_SYSTEM.md` §8.
- [ ] **Mover el botón "Instalar PDWA" a una página dedicada** (hoy es fab flotante inferior-izquierda en los 4 layouts). Depende: decidir por sitio. Se combina con el futuro de los widgets (Sentry feedback + PDWA en una página de "Instalar/Ayuda" por web).
- [ ] Evaluar bajada de `replaysSessionSampleRate` de 1.0 (temporal para pruebas) a 0.1 en los 4 `src/instrumentation-client.ts` cuando se termine de probar. Y verificar el checklist "Beyond the Basics" de sentry.io (Unminify + notifications) tras un deploy con eventos frescos.
