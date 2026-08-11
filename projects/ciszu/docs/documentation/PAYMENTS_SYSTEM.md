# PAYMENTS_SYSTEM — Metodología de pagos y donaciones de Ciszu Network

**Estado (11 ago 2026)**: metodología completa + paquete `@ciszunetwork/payments` (NOWPayments listo, Lemon Squeezy cableado) + 8 tests. Pendiente del usuario: crear wallets y cuentas (ver §7). Complementa a `COMPANY_REGISTRATION_PLAN.md` (legal).

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

### Env vars (vault `services/supabase/.env`)

| Variable | Uso |
| --- | --- |
| `NOWPAYMENTS_API_KEY` | Key API de la cuenta |
| `NOWPAYMENTS_IPN_SECRET` | Secret del IPN (Settings → IPN) para firmar/verificar webhooks |
| `NOWPAYMENTS_API` | (opcional) override de la base URL, p. ej. `https://api-sandbox.nowpayments.io` en pruebas |
| `LEMONSQUEEZY_API_KEY` / `_STORE_ID` / `_PRODUCT_ID` / `_WEBHOOK_SECRET` | A los 18 |
| `DONATE_USDT_TRC20` / `DONATE_USDT_ERC20` / `DONATE_BTC` / `DONATE_ETH` / `DONATE_PAYPAL` / `DONATE_ZINLI` / `DONATE_PAYONEER` | Direcciones públicas de donación (por env) |

### Flujo de pago (cuando se active)

1. Front pide `POST /api/payments/invoice` (con rate limit de `createRateLimiter` — ver `CACHING_SYSTEM.md`).
2. Server: crea `pagos.orders` (schema nuevo: id uuid, product, amount_usd, status, provider, created_at) → `provider.createInvoice(order)`.
3. Redirige al `checkoutUrl` de NOWPayments (hosted invoice).
4. NOWPayments llama al webhook `POST /api/webhooks/nowpayments` con el cuerpo crudo firmado: `verifyWebhook(rawBody, headers)` valida HMAC-SHA512 (timing-safe) y mapea estados (`finished/confirmed/sending → confirmed`, `failed/refunded/expired → …`).
5. Solo con estado `confirmed` se marca la orden pagada y se entrega el producto/beneficio (p. ej. rol de Discord, código de licencia).
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

1. Crear cuenta **NOWPayments** (email) → API key + IPN secret → vault + env.
2. Crear **MetaMask** y/o **TrustWallet** → guardar seeds en Bitwarden (vault personal).
3. Crear cuenta **Binance** (KYC básico) → método P2P.
4. Crear cuenta **Zinli** (cédula).
5. Poner las direcciones públicas en `DONATE_*` del vault y en las webs (sección Apoyar).
6. A los 18: PayPal, Payoneer, Lemon Squeezy, Keygen (con la lista de §3).
7. Cuando se quiera vender: crear la migración del schema `pagos` (orders/transactions con RLS — regla `SECURITY_TASKS.md` #1) y las rutas API de §5.

## 8. Verificación de la implementación (ya hecha)

- 8/8 tests pasando: invoice correcta, HMAC válido/inválido, errores HTTP del proveedor, Lemon Squeezy bloqueado sin producto, donaciones solo con env.
- El paquete está en el workspace y en `vitest.config.mts`.
- Sin API keys reales: `createInvoice` lanza `PaymentNotConfiguredError` claro (no rompe builds).
