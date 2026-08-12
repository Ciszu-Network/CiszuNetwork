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

## Reseñas / reputación (Trustpilot y otras) — EN IMPLEMENTACIÓN

- [x] Decisión: plataformas de valoración por producto. Metodología completa en `REVIEWS_SYSTEM.md` (independiente de pagos).
- [x] **USUARIO**: descargar el archivo HTML de verificación de Trustpilot (`c2b7fd59-...html`) y darle el nombre al agente (11 ago 2026 — archivo desplegado y respondiendo 200).
- [ ] **USUARIO**: pulsar **Verify domain** en Trustpilot para `ciszunetwork.vercel.app`.
- [ ] **USUARIO**: subir Ciszubot a Top.gg y DiscordBotList + tokens (`TOP_GG_TOKEN`, `DISCORDBOTLIST_TOKEN`) → vault.
- [ ] **USUARIO**: perfil itch.io + publicar MuzicMania; Google Business Profile; (futuro) Microsoft Store/Steam/Product Hunt.
