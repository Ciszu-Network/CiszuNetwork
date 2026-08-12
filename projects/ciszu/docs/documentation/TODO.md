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

## Errores (Sentry) — CERRADA (11 ago 2026)

- [x] Decisión: Sentry (Developer free 5k errores, sin tarjeta). PostHog queda solo analítica. Detalle en `ERRORS_SYSTEM.md`.
- [x] SDK integrado: `@sentry/nextjs` en las 4 webs (client/server/edge configs + instrumentation + global-error + withSentryConfig) y `@sentry/node` en el bot (`services/sentry.ts`).
- [x] Cuenta sentry.io + org `ciszu-network` + 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot) + DSNs en env ×4 + bot + vault.
- [x] `SENTRY_AUTH_TOKEN` en Vercel production ×4 (source maps) + todas las features activadas (tracing 1.0, replays, feedback). Pendiente solo la verificación en vivo de un error de prueba.
