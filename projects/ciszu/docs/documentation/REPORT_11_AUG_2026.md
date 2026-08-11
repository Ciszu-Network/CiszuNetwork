# REPORTE — Implementación de Sentry, Emails y Pagos (11 ago 2026)

**Commit**: `ab39ed2` (main, pushado por el agente — GitHub resolvió DNS correctamente)
**Estado**: 3 sistemas implementados al máximo posible sin cuentas del usuario. Todo verificado: tests 137/137, lint limpio, builds 4/4 webs OK, bot compila, gitleaks 0 leaks.

---

## 1. Qué quedó implementado (listo para producción)

### A) Errores → Sentry (doc: `ERRORS_SYSTEM.md`)
- `@sentry/nextjs@10.69.0` en las 4 webs: `src/sentry.{client,server,edge}.config.ts`, `src/instrumentation.ts` (`register()` + `onRequestError`/`captureRequestError`), `src/app/global-error.tsx`, `next.config.ts` con `withSentryConfig({ org: 'ciszu-network', project: <app>, silent: true, sourcemaps: { disable: true } })`.
- `@sentry/node@10.69.0` en el bot: `src/services/sentry.ts` (se activa solo con `SENTRY_DSN`) + captura de errores de comandos y procesos.
- Guardrails: tracing OFF, replays OFF, PostHog sigue solo analítica.
- **Sin DSN el SDK es no-op** → los builds actuales y producción funcionan sin la cuenta.

### B) Emails → ~~Brevo hoy~~ descartado → Supabase Auth hoy, Resend con dominio (doc: `EMAILS_SYSTEM.md`)
> ⚠️ **CORRECCIÓN (11 ago 2026, tras el reporte)**: Brevo quedó **DESCARTADO** — la cuenta se suspendió permanentemente y crear API key exige teléfono no venezolano (inviable en VE). El paquete `@ciszunetwork/email` se limpió: eliminado `brevo.ts` y el failover (queda solo Resend, inactivo hasta dominio Fase B). Los emails de **auth de Supabase** (verificación/reset/OTP) ya funcionan con el SMTP nativo del proyecto, sin configuración. Estado original, antes del descarte:
- Paquete `@ciszunetwork/email`: `EmailProvider` (send) + Brevo REST v3 (primario por defecto) + Resend (bloqueado hasta dominio, salvo `RESEND_ALLOW_UNVERIFIED` en dev) + `sendEmail()` con failover (`EMAIL_FAILOVER=1`) + errores claros (`EmailNotConfiguredError`).
- 7 tests. Sin API keys reales no rompe nada.

### C) Pagos → metodología + NOWPayments (doc: `PAYMENTS_SYSTEM.md`)
- Paquete `@ciszunetwork/payments`: `PaymentProvider` (createInvoice/verifyWebhook) + **NOWPayments** completo (invoice con `x-api-key`, IPN con HMAC-SHA512 timing-safe vía `x-nowpayments-sig`, mapeo de estados) + **Lemon Squeezy stub** (HMAC-SHA256, listo a los 18) + `getDonationMethods()` (direcciones `DONATE_*` desde env, nunca hardcodeadas).
- 8 tests. Roadmap por edad y matriz producto×método con TODOS los métodos del toDo (PayPal, Payoneer, Zinli, Stripe, Revolut, Coinbase, MetaMask, Binance + ahora: NOWPayments, Lemon Squeezy, Keygen).
- Sin API key real, `createInvoice` lanza `PaymentNotConfiguredError` (no rompe).

### Documentación y repo
- 3 docs maestros (ERRORES/EMAILS/PAYMENTS_SYSTEM.md) + `TODO.md` actualizado con los pendientes marcados como `[ ] USUARIO`.
- `AGENTS.md` actualizado con el estado de los 3 sistemas (sin pendientes nuevos).
- `vitest.config.mts` incluye los 2 paquetes nuevos; `pnpm-workspace.yaml` aprobó build de `@sentry/cli`.

## 2. Qué NO se pudo terminar (requiere tus cuentas/credenciales)

| Sistema | Pendiente | Dónde |
| --- | --- | --- |
| Sentry | Cuenta sentry.io (fplayersoffcial@gmail.com, free sin tarjeta) + org `ciszu-network` + 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot) + DSNs en `.env.local` ×4 y Vercel + `SENTRY_DSN` del bot | ERRORS_SYSTEM.md §6 |
| Sentry | `SENTRY_AUTH_TOKEN` (Vercel production ×4) para subir source maps — hoy `sourcemaps.disable` | ERRORS_SYSTEM.md §3 |
| Emails | ~~Cuenta Brevo + API key~~ **DESCARTADO (11 ago)**: Supabase Auth SMTP ya funciona hoy; pendiente real = dominio Fase B + `RESEND_API_KEY` | EMAILS_SYSTEM.md §5 |
| Emails | ~~SMTP custom de Supabase Auth (smtp-relay.brevo.com:587)~~ → con dominio: `smtp.resend.com` (user `resend` + API key) | EMAILS_SYSTEM.md §3 |
| Pagos | Cuenta NOWPayments + `NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET` (vault) | PAYMENTS_SYSTEM.md §7 |
| Pagos | Wallets MetaMask/TrustWallet (seeds → Bitwarden), Binance (P2P), Zinli; direcciones `DONATE_*` en vault + sección "Apoyar" web | PAYMENTS_SYSTEM.md §7 |
| Pagos | Schema `pagos` (orders con RLS — regla SECURITY_TASKS #1) + rutas `/api/payments/invoice` y `/api/webhooks/nowpayments` (rate limit) — pedir al agente cuando haya keys | PAYMENTS_SYSTEM.md §5 |
| Pagos (18 años) | PayPal, Payoneer, Lemon Squeezy, Keygen | PAYMENTS_SYSTEM.md §3-4 |

## 3. Próximo paso (cuando regreses)

Decir al agente (o hacerlo tú): "activar los sistemas → crear las cuentas". El agente puede:
1. Crearte la guía paso a paso de cada alta (ya está en las docs §6/§5/§7).
2. Cuando tengas las keys en el vault, cablear las API routes de pagos (schema + RLS + rate limits) y el uso de `sendEmail` en las webs (formularios de contacto) y donaciones.
3. Verificar en vivo con un error de prueba en Sentry y un email de prueba por Supabase/Resend.

## 4. Notas técnicas del cierre

- El push desencadenó los 4 workflows de deploy de Vercel (cambios en `projects/**` y `packages/**`) — las webs se redeployarán solas con el SDK instalado (no-op sin DSN).
- BitLocker seguía cifrando E: durante el trabajo (no se reinició nada).
- Los 2 avisos de PostHog en los tests (script externo bloqueado en happy-dom) son previos a este cambio; el único "error" del suite global es un timeout de arranque de worker de Vitest bajo carga de CPU (los archivos afectados pasan solos, verificado).