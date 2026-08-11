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

## Emails (Supabase Auth HOY → Resend con dominio) — Brevo DESCARTADO

- [x] Decisión revisada (11 ago 2026): **Brevo DESCARTADO** — cuenta suspendida permanentemente + API key exige teléfono no venezolano (inviable en VE). Nuevo plan: **SMTP nativo de Supabase** para auth HOY → **Resend** como único transaccional con dominio (Fase B). Detalle en `EMAILS_SYSTEM.md`.
- [x] Paquete `@ciszunetwork/email` (**Brevo eliminado**, solo Resend) con tests actualizados.
- [x] Widget/chat Brevo Conversations retirado de las 4 webs (misma cuenta suspendida).
- [ ] **USUARIO (con dominio)**: Resend + dominio verificado + `RESEND_API_KEY` en vault/Vercel + `EMAIL_FROM_RESEND`.
- [ ] **USUARIO (opcional, con dominio)**: SMTP custom en Supabase Auth con Resend (`smtp.resend.com`, user `resend` + API key) para mejor entregabilidad.

## Errores (Sentry) — EN IMPLEMENTACIÓN

- [x] Decisión: Sentry (Developer free 5k errores, sin tarjeta). PostHog queda solo analítica. Detalle en `ERRORS_SYSTEM.md`.
- [x] SDK integrado: `@sentry/nextjs` en las 4 webs (client/server/edge configs + instrumentation + global-error + withSentryConfig) y `@sentry/node` en el bot (`services/sentry.ts`).
- [ ] **USUARIO**: cuenta sentry.io + org `ciszu-network` + 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot) + DSNs en env ×4 + bot.
- [ ] **USUARIO**: `SENTRY_AUTH_TOKEN` en Vercel production ×4 (source maps) + verificar un error de prueba llega al dashboard.
