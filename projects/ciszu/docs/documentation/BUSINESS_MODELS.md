# BUSINESS_MODELS — Modelos de negocio a seguir

Referencia de los modelos de negocio oficiales/reconocidos que Ciszu Network toma como inspiración y cómo se aplican hoy (ago 2026). Complementa `BUSINESS_STRATEGY.md`.

## Modelos de referencia

| Modelo | Cómo lo aplica Ciszu hoy |
| ------ | ------------------------ |
| **Freemium / F2P** | MuzicMania gratis con monedas in-game y rewards por votar; el bot gratuito con funciones premium futuras |
| **Marketplace / bot lists** | Presencia en top.gg y DBL (auto-post 30 min) para descubrimiento del bot |
| **Modelo de comunidad / Lounge** | Discord como centro de comunidad con economías, niveles, rangos — engagement-driven |
| **Subscription (a futuro, 18+)**: | Emails transaccionales ya listos (`@ciszunetwork/email`), payments integrados (NOWPayments) para suscripciones futuras |
| **Donations (patronaje)** | `getDonationMethods()` con direcciones crypto from env (`DONATE_*`); NOWPayments invoices |
| **Devol (para-publisher)**: | Música con licencia propia + covers; monetización de contenido en YouTube/Spotify |
| **Portfolio como funnel** | CiszukoAntony como vitrina → servicios (diseño/música/desarrollo) |

## Modelo de ingresos directos (stack actual)

1. **Donaciones crypto** — ahora (NOWPayments IPN, HMAC).
2. **Votos/Premium** — rewards en el bot + futuras funciones de pago.
3. **Servicios profesional** — a través del portfolio (diseño, música, desarrollo).
4. **Suscripciones (18+ / LLC)** — cuando la identidad legal lo permita (`INTERNATIONAL_LLC_GUIDE.md`).

## Modelo operativo

- **Operación remota 24/7**: Vercel + Supabase + GitHub Actions (infra en la nube).
- **Bootstrap/costo-cero**: Free tiers cuidados (límites monitoreados — cuota storage 1 GB conocida: lección `AGENTS.md`).
- **Única fuente de verdad**: decisiones de costo/servicio en `ONLINE_SERVICES.md`.

## Referentes de negocio a estudiar

- Gijs (MuzicMania-esco) — en realidad el referente es **Genre/online games indie + bots Discord con monetización por comunidad** (estilo Pancake/Top.gg bots).
- Creative kids / one-person studios: modelos "solopreneur" con 1-2 productos amplios (patrón que Ciszu sigue: 4 productos de un solo fundador).
- Plataformas de música con licencias abiertas: YouTube Content ID, Spotify for Artists.

## Reglas de decisión

- **Primero gratis, luego monetizar**: la monetización nunca debe romper la utilidad free (evitar paywall en funciones que definen el producto).
- **Fase por edad/legal**: nada de suscripciones o LLC hasta mayoría de edad (ver `COMPANY_REGISTRATION_PLAN.md`, `PAYMENTS_SYSTEM.md`).
- Cada nuevo modelo se valida con datos (PostHog, loyalty) antes de implementar.

_Última revisión: 11 ago 2026._