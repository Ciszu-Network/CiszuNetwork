# PAYMENTS_SYSTEM — Metodología de pagos y donaciones de Ciszu Network

**Estado (12 ago 2026)**: **NOWPayments ACTIVO** — cuenta del usuario creada (11 ago 2026), credenciales en vault, env vars en Vercel (ciszunetworkpage), rutas API de invoice + webhook IPN desplegadas y verificadas con firma real. Paquete `@ciszunetwork/payments` completo (NOWPayments + Lemon Squeezy stub) + 9 tests. Pendiente del usuario: wallets propias y activar cuenta NOWPayments (ver §7). Complementa a `COMPANY_REGISTRATION_PLAN.md` (legal).

## 1. Contexto y reglas de la financiación

- Sin tarjeta de crédito, sin plan de pago hasta que haya ingresos (regla del ecosistema).
- El dueño es **menor de 18 años**: algunos rieles (PayPal, Payoneer, Lemon Squeezy, Stripe) exigen mayoría de edad → el roadmap es **por edades**.
- Objetivo: **empezar a recibir pagos reales HOY** con crypto (NOWPayments, sin KYC de merchant y sin edad mínima) y formalizar todo a los 18.

## 2. Matriz producto × método

| Producto | Hoy (<18) | A los 18 | Futuro (LLC/dominio) |
| --- | --- | --- | --- |
| Donaciones | **USDT-TRC20 / BTC / ETH** (NOWPayments o direcciones directas) | + PayPal (paypal.me), + Lemon Squeezy | Stripe directo |
| Compras digitales (MuzicMania, juegos) | NOWPayments invoice (0.5-1%) | Lemon Squeezy (MoR: tarjetas/PayPal globales, 5% + $0.50, IVA/impuestos/facturas los gestiona él) | Stripe |
| Licencias de software | — | Keygen API (license keys, free tier) + Lemon Squeezy | Stripe Billing |
| Suscripciones | NOWPayments recurring (no recomendado sin KYC) | Lemon Squeezy subscriptions | Stripe |
| Venta de música/arte | NOWPayments + Binance P2P (VE) | PayPal + Payoneer (pagos internacionales de clientes) | Stripe + distribuidores |
| Servicios (discord, comisiones) | Zinli (rieles VE, tarjeta virtual) + Binance P2P | PayPal/Zinli + facturación digital (FREELANCER_TAX_GUIDE) | Facturación formal SAPI |

## 3. Riele de pago por país (Venezuela)

| Riel | Sirve para | KYC/edad | Estado |
| --- | --- | --- | --- |
| **Binance** (P2P + Pay) | Comprar/vender USDT a Bs y $, pagar con crypto | Cuenta sí, Pay KYC | ✅ Crear cuenta |
| **MetaMask** | Billetera ETH/BTC auto-custodia para recibir pagos | Ninguno | ✅ Crear billetera |
| **Zinli** | Tarjeta virtual $ (compras online, pagos de servicios VE) | Cédula | ✅ Crear cuenta |
| **NOWPayments** | Pasarela crypto sin KYC merchant | Email | ✅ Crear cuenta |
| PayPal | Pagos internacionales | **18 años** | ⏳ A los 18 |
| Payoneer | Recibir pagos de freelancing (clientes US/EU) | **18 años** | ⏳ A los 18 |
| Lemon Squeezy | MoR: cobrar tarjetas/PayPal global sin LLC | **18 años** (payout PayPal) | ⏳ A los 18 |
| Stripe | Procesador directo | País soportado/LLC (VE no soporta) | ⏳ Fase LLC |
| Coinbase | Exchange/billetera | KYC (edad 18 en VE) | ⏳ 18 |
| Revolut | Cuenta multi-divisa europea | VE no soportado (solo con residencia EU) | ⏳ Futuro |

## 4. Fases (roadmap por edad)

- **Fase 0 (HOY, <18)**: wallets propias (MetaMask, Binance) + cuenta NOWPayments + Zinli. Cobrar donaciones y ventas digitales en USDT/BTC/ETH. Contabilidad manual en `archives/legal` (herramienta `tools/legal-ai`).
- **Fase 1 (18 años)**: PayPal + Payoneer + Lemon Squeezy (MoR) → cobrar tarjetas/PayPal con facturas e impuestos gestionados. Keygen API para licencias.
- **Fase 2 (con dominio propio, Fase B Cloudflare)**: Resend para emails transaccionales, verificación de marca, mejor entregabilidad.
- **Fase 3 (LLC o SAPI — `COMPANY_REGISTRATION_PLAN.md` y `INTERNATIONAL_LLC_GUIDE.md`)**: Stripe directo + cuenta bancaria corporativa + distribuidores de música/arte.

## 5. NOWPayments — integración técnica

**Paquete `@ciszunetwork/payments`** (patrón de los demás paquetes compartidos):

```
packages/payments/
  src/types.ts        PaymentProvider (createInvoice / verifyWebhook), PaymentOrder, PaymentResult, PaymentStatus
  src/nowpayments.ts  createNowPaymentsProvider() → POST /v1/invoice (x-api-key) + IPN HMAC-SHA512 (x-nowpayments-sig)
  src/lemonsqueezy.ts createLemonSqueezyProvider() → POST /v1/checkouts (Bearer) + webhook HMAC-SHA256 (X-Signature) — STUB hasta los 18
  src/donations.ts    getDonationMethods() → direcciones desde env (nunca hardcodeadas)
  src/index.ts        getPaymentProvider('nowpayments' | 'lemonsqueezy')
  tests/              8 tests (invoice, HMAC válido/inválido, errores, donaciones por env)
```

### Env vars (vault `services/supabase/.env` — CONFIGURADAS 11 ago 2026)

| Variable | Uso | Estado |
| --- | --- | --- |
| `NOWPAYMENTS_API_KEY` | Key API de la cuenta | ✅ En vault + Vercel |
| `NOWPAYMENTS_IPN_SECRET` | Secret del IPN (Settings → IPN) para firmar/verificar webhooks | ✅ En vault + Vercel |
| `NOWPAYMENTS_PUBLIC_KEY` | Clave pública (embeds: botón/widget de donación) | ✅ En vault + Vercel |
| `NOWPAYMENTS_DONATE_URL` | Página de donación: `https://nowpayments.io/donation/ciszunetwork` | ✅ |
| `NOWPAYMENTS_POS_URL` | POS Terminal: `https://nowpayments.io/pos-terminal/ciszunetwork` | ✅ |
| `NOWPAYMENTS_API` | (opcional) override de la base URL, p. ej. `https://api-sandbox.nowpayments.io` en pruebas | — |
| `LEMONSQUEEZY_API_KEY` / `_STORE_ID` / `_PRODUCT_ID` / `_WEBHOOK_SECRET` | A los 18 | — |
| `DONATE_USDT_TRC20` / `DONATE_USDT_ERC20` / `DONATE_BTC` / `DONATE_ETH` / `DONATE_PAYPAL` / `DONATE_ZINLI` / `DONATE_PAYONEER` | Direcciones públicas de donación (por env) | ⏳ Pendiente (wallets) |

> ⚠️ Todas las credenciales NOWPayments también se configuraron como **env vars en Vercel** para `ciszunetworkpage` (targets production+preview+development) el 11 ago 2026 vía API.

### Flujo de pago (ACTIVO — rutas desplegadas en ciszunetwork)

1. Front pide `POST /api/payments/invoice` (rate limit 10/min por IP con `createRateLimiter` — ver `CACHING_SYSTEM.md`). Body: `{ amount: number USD, email?: string }`. Valida monto $1–$10k.
2. Server: `createNowPaymentsProvider().createInvoice({...})` → `POST /v1/invoice` con `x-api-key`. Incluye `ipn_callback_url` = `https://ciszunetwork.vercel.app/api/webhooks/nowpayments`.
3. Redirige al `checkoutUrl` (hosted invoice de NOWPayments, ej. `https://nowpayments.io/payment/?iid=...`).
4. NOWPayments llama al webhook `POST /api/webhooks/nowpayments` (rate limit 30/min por IP) con el cuerpo crudo firmado: `verifyWebhook(rawBody, headers)` valida HMAC-SHA512 (timing-safe) y mapea estados.
5. Solo con estado `confirmed` se registra el pago (log + futuro upsert en `pagos.orders` para entregar producto/beneficio).
6. Emails de confirmación por `@ciszunetwork/email` (Resend, con dominio — Fase B).

### Mapeo de estados (IPN de NOWPayments)

| Estado IPN | Normalizado |
| --- | --- |
| `waiting`, `confirming` | `waiting` |
| `confirmed`, `sending`, `finished` | `confirmed` |
| `partially_paid` | `partially_paid` |
| `failed`, `refunded`, `expired` | mismo nombre |

### Reglas de seguridad (obligatorias)

1. **Todo endpoint que muta lleva rate limit** (regla `SECURITY_TASKS.md`): invoice 10/min, webhooks de pago 30/min por IP.
2. **NUNCA confiar en el estado del front**: el webhook firmado es la única fuente de verdad para marcar pagos.
3. **Verificar la firma ANTES de parsear** el cuerpo (HMAC sobre el body crudo, comparación timing-safe).
4. **Idempotencia**: `providerOrderId` + estado `confirmed` debe procesarse una sola vez (check `pagos.orders.status`).
5. Las direcciones de donación van en env (vault), nunca en el código.

## 6. Retiros y conversión (flujo del dinero)

1. Los pagos llegan a la wallet de NOWPayments (auto-conversión a USDT si se configura).
2. Retirar USDT → wallet propia (MetaMask/TrustWallet).
3. Convertir a $/Bs: Binance P2P (pares USDT/Bs y USDT/$) — el método más usado en VE.
4. Para gastos online: Zinli (tarjeta virtual) recargada con USDT o vía P2P.
5. A los 18: PayPal/Payoneer como alternativa para clientes internacionales que no usan crypto.
6. Contabilidad: registrar cada operación en `archives/legal` (privado, gitignored).

## 7. Tareas del usuario (para activar)

1. ✅ **Cuenta NOWPayments creada** (11 ago 2026, `ciszunetwork`) → API key + IPN secret + public key en vault y Vercel.
2. ⏳ **Configurar wallet de retiro en NOWPayments** (Settings → Payouts): dirección USDT-TRC20/BTC de la wallet propia — sin esto los pagos quedan retenidos en la cuenta de NOWPayments.
3. Crear **MetaMask** y/o **TrustWallet** → guardar seeds en Bitwarden (vault personal).
4. Crear cuenta **Binance** (KYC básico) → método P2P.
5. Crear cuenta **Zinli** (cédula).
6. Poner las direcciones públicas en `DONATE_*` del vault y en las webs (sección Apoyar).
7. Verificar el **dominio de la web en Trustpilot** (ver `REVIEWS_SYSTEM.md`).
8. A los 18: PayPal, Payoneer, Lemon Squeezy, Keygen (con la lista de §3).
9. Cuando se quiera vender: crear la migración del schema `pagos` (orders/transactions con RLS — regla `SECURITY_TASKS.md` #1) y rutas de entrega de producto.

## 8. Verificación de la implementación (11-12 ago 2026)

- ✅ 9/9 tests pasando (se añadió el de monto validado en la ruta invoice): invoice correcta, HMAC válido/inválido, errores HTTP, Lemon Squeezy bloqueado sin producto, donaciones solo con env.
- ✅ API key real verificada: `POST /v1/invoice` devolvió invoice `4395972544` con checkout URL (11 ago 2026).
- ✅ Rutas desplegadas en `ciszunetworkpage` (commit `c51d82f`): `POST /api/payments/invoice` + `POST /api/webhooks/nowpayments`.
- ✅ Webhook probado con firma HMAC-SHA512 real generada localmente con el IPN secret → respuesta esperada tras deploy.
- ✅ Env vars en Vercel: `NOWPAYMENTS_*` ×5 (production+preview+development).
- El paquete lanza `PaymentNotConfiguredError` claro si faltan keys (no rompe builds).
