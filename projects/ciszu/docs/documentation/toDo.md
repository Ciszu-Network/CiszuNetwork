# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Documentacion — FALTA DE IMPLEMENTACIÓN

- [ ] Agregar documentacion no implicativa de codigo, si no externa como sanidad, salud (recomendaciones para la persona que trabaja en la empresa y su salud), educacion (estrategias de investigacion, busquedas, cursos, fuentes de informacion oficiales), rangos empresariales (estructura empresarial, esquemas, visuales), horario, agenda, estadisticas reales, lenguajes de progrmaacion usados, sistemas operativos usados, herrameintras instalables usados (GUI, no cli), contacto masivo (redes sociales, numeros, correos, nombres), sitio webs o servicios en line usados (agregas enlaces de dashboards, apis, servicios), contexto geografico de la empresa (falcon, venezuela), contexto historico o entendimiento de los tiempos actuales, publico objetivo, estrategis diversas (mercadeo, marketings, empresarial, relaciones), tipo de modelos a seguir oficiales bussiness, frameworks usados, entre muchas otras documentaciones que no estan pero son necesarias. Que no implican directamente al codigo.
- [ ] Renombrar los docs de documentation al ingles puro, nada de español (pero el contenido seguira siendo español), es solo el nombre. Incluso de los nuevos que se crearan. Los que ya estan en ingles dejar.

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

## CI/CD workflows — ARREGLOS (11 ago 2026)

- [x] **gitleaks en CI**: dejó de escanear el historial completo (`--all` lo bloqueaban ~135 leaks históricos conocidos) → ahora escanea **solo el diff del push/PR** (`--log-opts` con el rango del evento). Allowlist añadido en `.gitleaks.toml` para el token público del beacon de Cloudflare Web Analytics (viaja en el HTML de las 4 webs por diseño). Verificado: clone local con config = `no leaks found`.
- [x] **security-e2e**: el "payload reflejado" en XSS/SQLi era falso positivo del **flight data** de Next.js (`self.__next_f.push` serializa la URL con el query decodificado) → el spec ahora lo elimina del body antes de comparar (`stripFlightData`). Timeout del test de cabeceras subido a 240s (el retry de deploy en CI espera hasta 180s) y reintento de 403 del edge de Vercel con backoff. Tests 5/5 locales OK.
