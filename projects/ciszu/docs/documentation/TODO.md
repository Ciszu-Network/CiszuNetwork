# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Documentacion — IMPLEMENTADA (11 ago 2026)

- [x] **Docs externos/no-código agregados** (en `projects/ciszu/docs/documentation/`, nombres en inglés):
  | Doc | Contenido |
  | --- | --------- |
  | `HEALTH.md` | Salud y bienestar laboral (pausas, postura, sueño, checklist) |
  | `EDUCATION.md` | Estrategias de aprendizaje/investigación, cursos, fuentes oficiales VE y tech |
  | `BUSINESS_STRUCTURE.md` | Rangos/esquemas empresariales y visuales (neón por rol) |
  | `SCHEDULE.md` | Horario, agenda diaria/semanal/trimestral |
  | `STATISTICS.md` | Estadísticas reales del ecosistema (repo, BD, CDN, monitoreo, seguridad) |
  | `TECH_STACK.md` | Lenguajes, frameworks, OS usados y herramientas (CLI+GUI) |
  | `CONTACTS.md` | Redes sociales, números, correos y nombres (fuente de las webs) |
  | `ONLINE_SERVICES.md` | Dashboards, APIs y servicios en línea usados |
  | `GEOGRAPHIC_CONTEXT.md` | Contexto geográfico (Falcón, Venezuela), huso, implicaciones |
  | `HISTORICAL_CONTEXT.md` | Contexto histórico y de los tiempos actuales (2026) |
  | `TARGET_AUDIENCE.md` | Público objetivo por producto |
  | `BUSINESS_STRATEGY.md` | Estrategias de marketing, empresa y relaciones |
  | `BUSINESS_MODELS.md` | Modelos de negocio de referencia y cómo se aplican |
- [x] **Docs de `documentation/` renombrados a inglés puro** (solo nombres; contenido sigue en español) en los 5 proyectos (ciszu 23 renombres + `toDo.md`→`TODO.md` en ciszu/ciszubot/ciszukoantony/muzicmania/ciszugamens). Referencias internas y de `AGENTS.md` actualizadas (globs `GUIA_*`→`*_GUIDE.md` corregidos).

## Pagos (metodología + NOWPayments) — EN IMPLEMENTACIÓN

- [x] Decisión: NOWPayments HOY (crypto sin KYC) → Lemon Squeezy a los 18 → Stripe con LLC. Metodología completa en `PAYMENTS_SYSTEM.md`.
- [x] Paquete `@ciszunetwork/payments` (NOWPayments client + IPN HMAC + Lemon Squeezy stub + donaciones por env) con 8 tests.
- [ ] **USUARIO**: cuenta NOWPayments + API key + IPN secret → vault.
- [ ] **USUARIO**: wallets MetaMask/TrustWallet (seeds a Bitwarden), Binance (P2P), Zinli.
- [ ] **USUARIO**: poner direcciones públicas en `DONATE_*` (vault) y sección "Apoyar" en las webs.
- [ ] **USUARIO (18 años)**: PayPal, Payoneer, Lemon Squeezy, Keygen API para licencias.
- [ ] **USUARIO (Futuro)**: migración schema `pagos` (orders/transactions con RLS) + rutas API `/api/payments/invoice` + `/api/webhooks/nowpayments`.

## Emails (Brevo hoy → Resend con dominio) — EN IMPLEMENTACIÓN

- [x] Decisión: Brevo 300/día gratis sin dominio → Resend 3k/mes con dominio (Fase B). SendGrid descartado (trial 60 días). Detalle en `EMAILS_SYSTEM.md`.
- [x] Paquete `@ciszunetwork/email` (Brevo + Resend + failover) con 7 tests.
- [ ] **USUARIO**: cuenta Brevo (fplayersoffcial@gmail.com) + API key → vault + verificar sender (código 6 dígitos) + `EMAIL_FROM`.
- [ ] **USUARIO**: activar SMTP custom en Supabase Auth (Dashboard → Authentication → SMTP) con `smtp-relay.brevo.com:587`.
- [ ] **USUARIO (con dominio)**: Resend + dominio verificado + `EMAIL_PROVIDER=resend` + `EMAIL_FAILOVER=1`.

## Errores (Sentry) — EN IMPLEMENTACIÓN

- [x] Decisión: Sentry (Developer free 5k errores, sin tarjeta). PostHog queda solo analítica. Detalle en `ERRORS_SYSTEM.md`.
- [x] SDK integrado: `@sentry/nextjs` en las 4 webs (client/server/edge configs + instrumentation + global-error + withSentryConfig) y `@sentry/node` en el bot (`services/sentry.ts`).
- [ ] **USUARIO**: cuenta sentry.io + org `ciszu-network` + 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot) + DSNs en env ×4 + bot.
- [ ] **USUARIO**: `SENTRY_AUTH_TOKEN` en Vercel production ×4 (source maps) + verificar un error de prueba llega al dashboard.

## CI/CD workflows — ARREGLOS (11 ago 2026)

- [x] **gitleaks en CI**: dejó de escanear el historial completo (`--all` lo bloqueaban ~135 leaks históricos conocidos) → ahora escanea **solo el diff del push/PR** (`--log-opts` con el rango del evento). Allowlist añadido en `.gitleaks.toml` para el token público del beacon de Cloudflare Web Analytics (viaja en el HTML de las 4 webs por diseño). Verificado: clone local con config = `no leaks found`.
- [x] **security-e2e**: el "payload reflejado" en XSS/SQLi era falso positivo del **flight data** de Next.js (`self.__next_f.push` serializa la URL con el query decodificado) → el spec ahora lo elimina del body antes de comparar (`stripFlightData`). Timeout del test de cabeceras subido a 240s (el retry de deploy en CI espera hasta 180s) y reintento de 403 del edge de Vercel con backoff. Tests 5/5 locales OK.
