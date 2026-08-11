# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Pagos (metodología + NOWPayments) — EN IMPLEMENTACIÓN

- [x] Decisión: NOWPayments HOY (crypto sin KYC) → Lemon Squeezy a los 18 → Stripe con LLC. Metodología completa en `PAGOS_SISTEMA.md`.
- [x] Paquete `@ciszunetwork/payments` (NOWPayments client + IPN HMAC + Lemon Squeezy stub + donaciones por env) con 8 tests.
- [ ] **USUARIO**: cuenta NOWPayments + API key + IPN secret → vault.
- [ ] **USUARIO**: wallets MetaMask/TrustWallet (seeds a Bitwarden), Binance (P2P), Zinli.
- [ ] **USUARIO**: poner direcciones públicas en `DONATE_*` (vault) y sección "Apoyar" en las webs.
- [ ] **USUARIO (18 años)**: PayPal, Payoneer, Lemon Squeezy, Keygen API para licencias.
- [ ] **USUARIO (Futuro)**: migración schema `pagos` (orders/transactions con RLS) + rutas API `/api/payments/invoice` + `/api/webhooks/nowpayments`.

## Emails (Brevo hoy → Resend con dominio) — EN IMPLEMENTACIÓN

- [x] Decisión: Brevo 300/día gratis sin dominio → Resend 3k/mes con dominio (Fase B). SendGrid descartado (trial 60 días). Detalle en `EMAILS_SISTEMA.md`.
- [x] Paquete `@ciszunetwork/email` (Brevo + Resend + failover) con 7 tests.
- [ ] **USUARIO**: cuenta Brevo (fplayersoffcial@gmail.com) + API key → vault + verificar sender (código 6 dígitos) + `EMAIL_FROM`.
- [ ] **USUARIO**: activar SMTP custom en Supabase Auth (Dashboard → Authentication → SMTP) con `smtp-relay.brevo.com:587`.
- [ ] **USUARIO (con dominio)**: Resend + dominio verificado + `EMAIL_PROVIDER=resend` + `EMAIL_FAILOVER=1`.

## Errores (Sentry) — EN IMPLEMENTACIÓN

- [x] Decisión: Sentry (Developer free 5k errores, sin tarjeta). PostHog queda solo analítica. Detalle en `ERRORES_SISTEMA.md`.
- [x] SDK integrado: `@sentry/nextjs` en las 4 webs (client/server/edge configs + instrumentation + global-error + withSentryConfig) y `@sentry/node` en el bot (`services/sentry.ts`).
- [ ] **USUARIO**: cuenta sentry.io + org `ciszu-network` + 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot) + DSNs en env ×4 + bot.
- [ ] **USUARIO**: `SENTRY_AUTH_TOKEN` en Vercel production ×4 (source maps) + verificar un error de prueba llega al dashboard.
