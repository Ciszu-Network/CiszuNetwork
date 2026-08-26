# MONETIZATION_PROTOCOLS — Monetización de Ciszu Network

Versión: 1.0.0
Actualización: 2026-08-26
Identificador: MONETIZATION_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definición**: protocolos de monetización de Ciszu Network: donaciones **directas** e
> **indirectas**, el sistema de **anuncios** (`AD_SYSTEM.md`) y el plan futuro de **compras** y
> **suscripciones**. Regula qué se cobra, cómo se ofrece, cómo se comunica y cómo se mide.
> Tarea `TODO.md #5`.

---

## 1. Visión general

Ciszu Network es un ecosistema digital **gratuito** en su núcleo (las 4 webs, el bot y el
juego). La monetización es **voluntaria y transparente**, sin paywalls que bloqueen el
contenido. El orden de prioridad:

1. **Donaciones directas** (cripto vía NowPayments, Patreon/Ko-fi, en el futuro PayPal).
2. **Anuncios** propios + futuros de terceros (sistema `AD_SYSTEM.md`), medidos con GA4.
3. **Donaciones indirectas**: suscripciones de apoyo en Patreon (beneficios simbólicos).
4. **Futuro**: compras en tienda (MuzicMania: objetos cosméticos) y suscripciones premium.

Regla de oro: **el usuario nunca se siente obligado a pagar ni a ver anuncios invasivos**;
todo anuncio es cerrable y toda donación es opcional.

---

## 2. Donaciones directas

### 2.1 Cripto (NowPayments)

- Pasarela ya integrada en la web principal (`api/webhooks/nowpayments` + `api/payments/invoice`).
- Acepta múltiples criptomonedas; genera invoice bajo demanda.
- El botón de donación aparece en `/support` de la web principal y en páginas de soporte.
- Reglas:
  - Mostrar siempre el monto en USD equivalente y la cripto exacta a pagar.
  - Tras un pago confirmado (webhook), mostrar agradecimiento (y en el futuro: recompensa simbólica).
  - No vincular la donación a cuentas ni privilegios (se agradece, no se premia con ventajas).

### 2.2 Fiat (Patreon / Ko-fi / BuyMeACoffee)

- Enlaces de perfil presentes en páginas de soporte (ciszukoantony, ciszubot, muzicmania).
- Patreon permite **suscripción de apoyo** (mensual) → "donación indirecta" (ver §4).
- Regla: los enlaces siempre van a la página oficial del creador (nunca a enlaces acortados).

---

## 3. Donaciones indirectas (anuncios)

Los anuncios son la forma "pasiva" de monetizar sin pedir dinero:

- **Anuncios propios** (promo del ecosistema): sin costo y sin cookies de terceros; mueven
  usuarios entre las webs (ej. de MuzicMania a la web principal).
- **Anuncios de terceros (futuro)**: AdSense u otra red (ver investigación en `AD_SYSTEM.md` §9).
- **Medición**: GA4 (impresiones/clics/cierres) — `AD_SYSTEM.md` §6.
- **Reglas de anuncios**:
  1. Todo anuncio es **cerrable** (X).
  2. Los **intrusivos** solo tras una acción real (fin de partida, compra).
  3. Los **particulares** respetan frecuencia mínima.
  4. Los de **recompensa** exigen espera y dan la **mitad**.
  5. Nunca incrustar en el layout (solo flotantes) — `AD_SYSTEM.md` §3.
  6. Nunca engañar: los CTAs deben llevar a donde dicen.

---

## 4. Suscripciones (futuro)

- **Patreon (hoy)**: suscripción de apoyo con beneficios simbólicos (agradecimientos, acceso
  anticipado a changelogs, rol en Discord). No afecta la funcionalidad de las webs.
- **Suscripción premium (plan futuro)**: por definir. Requisitos:
  - Debe respetar la regla de no-paywall (el contenido base sigue gratis).
  - Integración de pagos: evaluar Stripe (suscripciones) o seguir con NowPayments (cripto).
  - Requiere actualizar `PAYMENTS_SYSTEM.md` y las bases legales (ver `TODO.md #6`).

---

## 5. Compras en tienda (futuro)

- **MuzicMania**: tienda de cosméticos/objetos virtuales (skins de notas, colores, títulos).
  - Los objetos no deben dar ventaja competitiva (anti-P2W).
  - El "intrusivo" tras compra dispara el anuncio de agradecimiento (`placement: shop_checkout`).
- **Reglas**:
  - Precios claros en USD (y cripto si aplica).
  - Política de reembolso documentada en los términos del juego (`/terms`).
  - Al comprar: modal de confirmación y recibo; disparar anuncio intrusivo de agradecimiento.

---

## 6. Protocolos de comunicación

1. **Nunca** presionar al usuario para donar ni ver anuncios; el tono es de invitación.
2. Las páginas de soporte muestran donaciones y anuncios como **opción**, nunca como requisito.
3. Los toasts/avisos de agradecimiento tras donar usan el sistema de notificaciones (verde = éxito).
4. Todo ingreso y su origen se documenta (sin secretos): ver `PAYMENTS_SYSTEM.md`.

---

## 7. Medición y rendición

- GA4 mide el tráfico y el rendimiento de los anuncios (`ad_impression/click/dismiss`).
- PostHog mide el comportamiento de producto (ej. cuántos llegan al modal de donación).
- Los ingresos (NowPayments, Patreon) se registran en la documentación de pagos y en las
  revisiones mensuales (`PROJECT_STATE.md` / `STATUS_SYSTEM.md`).
- **Nunca** exponer montos por usuario; solo agregados.

---

## 8. Referencias

- `AD_SYSTEM.md` — el sistema de anuncios (tipos, reglas, GA4, investigación).
- `PAYMENTS_SYSTEM.md` — pasarelas y pagos.
- `ANALYTICS_SYSTEM.md` — medición (GA4, PostHog, Cloudflare).
- `GOOGLE_SYSTEM.md` — Google Business/reseñas; GA4/AdSense.
- `BUSINESS_SYSTEM.md` — marco de negocio.
- Páginas legales: `#6` (uso de datos para anuncios, geolocalización, cuentas).

---

_Última revisión: 26 ago 2026._ Relacionado: `AD_SYSTEM.md`, `PAYMENTS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`.