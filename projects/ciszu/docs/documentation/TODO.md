# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Pagos (metodología + NOWPayments) — ACTIVO

- [x] Decisión: NOWPayments HOY (crypto sin KYC) → Lemon Squeezy a los 18 → Stripe con LLC. Metodología completa en `PAYMENTS_SYSTEM.md`.
- [x] Paquete `@ciszunetwork/payments` (NOWPayments client + IPN HMAC + Lemon Squeezy stub + donaciones por env) con 9 tests.
- [x] **USUARIO**: cuenta NOWPayments creada (`ciszunetwork`) + API key + IPN secret + public key → vault y Vercel (11 ago 2026).
- [x] Rutas API desplegadas en ciszunetwork: `POST /api/payments/invoice` (rate limit 10/min) + `POST /api/webhooks/nowpayments` (firma HMAC, rate limit 30/min).
- [ ] **USUARIO**: configurar **wallet de retiro** en NOWPayments (Settings → Payouts) — sin esto los pagos quedan retenidos.
- [ ] **USUARIO**: wallets MetaMask/TrustWallet (seeds a Bitwarden), Binance (P2P), Zinli.
- [ ] **USUARIO**: poner direcciones públicas en `DONATE_*` (vault) y sección "Apoyar" en las webs.
- [ ] **USUARIO (18 años)**: PayPal, Payoneer, Lemon Squeezy, Keygen API para licencias.
- [ ] **USUARIO (Futuro)**: migración schema `pagos` (orders/transactions con RLS) + entrega de producto en el webhook.

## Reseñas / reputación (Trustpilot y otras) — EN IMPLEMENTACIÓN

- [x] Decisión: plataformas de valoración por producto. Metodología completa en `REVIEWS_SYSTEM.md` (independiente de pagos).
- [x] **USUARIO**: descargar el archivo HTML de verificación de Trustpilot (`c2b7fd59-...html`) y darle el nombre al agente (11 ago 2026 — archivo desplegado y respondiendo 200).
- [ ] **USUARIO**: pulsar **Verify domain** en Trustpilot para `ciszunetwork.vercel.app`.
- [ ] **USUARIO**: subir Ciszubot a Top.gg y DiscordBotList + tokens (`TOP_GG_TOKEN`, `DISCORDBOTLIST_TOKEN`) → vault.
- [ ] **USUARIO**: perfil itch.io + publicar MuzicMania; Google Business Profile; (futuro) Microsoft Store/Steam/Product Hunt.
