# EMAILS_SISTEMA — Emails transaccionales (Brevo hoy → Resend con dominio)

**Estado (11 ago 2026)**: paquete `@ciszunetwork/email` listo y probado (16 tests). Pendiente del usuario: cuenta Brevo + API key y verificación de sender (ver §5).

## 1. Decisión: ¿por qué Brevo hoy y Resend mañana?

Comparación verificada (ago 2026), priorizando **free sin tarjeta**:

| Proveedor | Free tier (verificado) | Dominio | Notas |
| --- | --- | --- | --- |
| **Brevo** ✅ (HOY) | 300 emails/**día** (~9k/mes) **permanente**, sin tarjeta | **No obligatorio**: sender verificado por email (código 6 dígitos) | SMTP `smtp-relay.brevo.com:587/465` + API v3 + plantillas + estadísticas. Deliverability menor sin dominio (SPF/DKIM del remitente son de Brevo) |
| **Resend** ✅ (CON DOMINIO) | 3.000/mes (100/día), 30 días de logs | **Sí**: 1 dominio verificado (SPF/DKIM automáticos) | API moderna, 100% fiable en entregabilidad, ideal cuando exista el dominio (Fase B Cloudflare, `CLOUDFLARE_SISTEMA.md`) |
| SendGrid | **DESCARTADO**: free nuevo = trial 60 días (100/día), luego se detiene; API/SMTP exigen dominio autenticado (single sender solo marketing → 403) | Sí | Era el candidato obvio hasta verificar el trial |
| MailerSend | 12k/mes | Sí (obligatorio) | Requiere dominio desde el día 1 |
| Mailgun / SES | trial/12 meses limitado | Sí | Requieren tarjeta |
| Gmail SMTP | 500/día | — | Bloquea cuentas con uso transaccional; no apto |

**Plan**: **Brevo HOY** (funciona sin dominio) → **Resend como primario cuando exista el dominio** (SPF/DKIM nativos = mejor entregabilidad), con **failover automático** entre ambos.

## 2. Paquete `@ciszunetwork/email`

Abstracción multi-proveedor con failover (patrón de los demás paquetes compartidos):

```
packages/email/
  src/types.ts       EmailProvider, EmailMessage, EmailResult, EmailError, EmailNotConfiguredError, EmailProviderUnavailableError
  src/brevo.ts       createBrevoProvider()  → POST api.brevo.com/v3/smtp/email (header api-key)
  src/resend.ts      createResendProvider() → POST api.resend.com/emails (Bearer); bloqueado sin dominio verificado salvo RESEND_ALLOW_UNVERIFIED (dev)
  src/index.ts       sendEmail(), getEmailProvider(), getFallbackProvider()
  tests/            7 tests (payloads, errores, failover, selección)
```

### Env vars

| Variable | Uso |
| --- | --- |
| `EMAIL_PROVIDER` | `brevo` (default) o `resend` |
| `BREVO_API_KEY` | Key API v3 de Brevo |
| `RESEND_API_KEY` | Key API de Resend |
| `EMAIL_FROM` | Remitente, p. ej. `Ciszu Network <no-reply@emisor-verificado>` (Brevo) |
| `EMAIL_FROM_RESEND` | Remitente para Resend (debe ser del dominio verificado) |
| `EMAIL_FAILOVER` | `1` = si el primario falla, reintentar con el secundario |

### Uso

```ts
import { sendEmail } from '@ciszunetwork/email';
await sendEmail({
  to: 'fan@example.com',
  subject: 'Verifica tu cuenta',
  html: '<p>Hola...</p>',
});
```

El fallback lanza error solo si **ambos** proveedores fallan (con las causas encadenadas).

## 3. Supabase Auth (emails de verificación/reset)

Supabase usa SMTP propio por defecto (delivery pobre y desde `no-reply@supabase.co`). Para usar Brevo/Resend:

1. Dashboard → Authentication → SMTP Settings → **Enable custom SMTP**.
2. Con Brevo: host `smtp-relay.brevo.com`, puerto 587 (TLS), usuario = la API key, password = la API key (Brevo usa la API key como user y pass SMTP), sender = `no-reply@<emisor>` verificado.
3. Con Resend (cuando haya dominio): `smtp.resend.com:465/587`, usuario `resend`, password = API key.
4. ⚠️ Los enlaces de confirmación generados por Supabase apuntan al dominio del proyecto; con dominio propio (Fase B) mejorarlos con `SITE_URL`.

## 4. Casos de uso actuales y futuros

- **HOY**: (a) SMTP de Supabase Auth (verificación de email, reset de contraseña) en muzicmania; (b) emails de soporte/contacto de las webs; (c) confirmación de donación/pago (NOWPayments IPN → email).
- **FUTURO**: boletines (Brewo marketing o Resend Broadcasts con dominio), facturas de Lemon Squeezy (las emite el MoR, no hace falta).

## 5. Tareas del usuario (para activar)

1. Crear cuenta en `brevo.com` con fplayersoffcial@gmail.com (free, sin tarjeta).
2. Copiar la **API v3 key** a `services/supabase/.env` como `BREVO_API_KEY` y a Vercel donde se use.
3. En Brevo → Sender Identity: verificar el remitente por email (código de 6 dígitos). Poner `EMAIL_FROM` en `.env.local` ×4 + Vercel.
4. (Fase B, con dominio) Verificar dominio en Resend, copiar `RESEND_API_KEY`, poner `EMAIL_PROVIDER=resend`, `EMAIL_FROM_RESEND=<dominio>`, `EMAIL_FAILOVER=1`.
5. Activar SMTP custom en Supabase (§3).
6. Test de humo: `pnpm --filter @ciszunetwork/email` … (los tests unitarios no requieren cuenta).

## 6. Verificación de la implementación (ya hecha)

- 16/16 tests pasando (`packages/email` + `packages/payments`), incluido el failover real con doble mock de fetch.
- El paquete queda añadido al monorepo (workspace `packages/*` ya lo cubre) y al `vitest.config.mts`.
- Sin API keys reales: sin ellas `sendEmail` lanza `EmailNotConfiguredError` claro (no rompe builds ni servidores).
