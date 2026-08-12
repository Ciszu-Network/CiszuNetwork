# EMAILS_SYSTEM — Emails transaccionales (Supabase hoy → Resend con dominio)

**Estado (11 ago 2026)**: **Brevo DESCARTADO** — la cuenta quedó suspendida permanentemente ("la actividad de tu cuenta no cumplía nuestras Condiciones de uso") y crear una API key exige teléfono **no venezolano** → inviable desde VE. Plan revisado:
- **HOY / sin dominio**: los emails de **AUTH de Supabase** (verificación, reset, OTP) usan el **SMTP nativo de Supabase** (gratis, sin configuración). El paquete `@ciszunetwork/email` **no tiene proveedor activo** hasta tener dominio.
- **Fase B (con dominio Cloudflare)**: **Resend** como único proveedor transaccional (3.000/mes free, SPF/DKIM automáticos).

## 1. Decisión: Supabase hoy, Resend mañana (Brevo descartado)

Comparación verificada (ago 2026), priorizando **free sin tarjeta**:

| Proveedor | Free tier (verificado) | Dominio | Notas |
| --- | --- | --- | --- |
| **Supabase Auth SMTP** ✅ (HOY) | Gratis, sin límite práctico para auth (verificación/reset/OTP) | No | SMTP del proyecto + `no-reply@supabase.co` (o sender custom vía SMTP de un proveedor). Cubre todo el email funcional de auth en las 4 webs |
| **Resend** ✅ (Fase B) | 3.000/mes (100/día), 30 días de logs | **Sí**: 1 dominio verificado (SPF/DKIM automáticos) | API moderna, entregabilidad alta; primario cuando exista el dominio (Fase B Cloudflare, `CLOUDFLARE_SYSTEM.md`) |
| ~~Brevo~~ | ~~300 emails/día permanente, sin tarjeta~~ | — | ❌ **DESCARTADO (11 ago 2026)**: cuenta suspendida permanentemente + exige teléfono no venezolano para crear API key → inviable en VE. SMTP `smtp-relay.brevo.com` documentado abajo solo como referencia histórica |
| SendGrid | **DESCARTADO**: free nuevo = trial 60 días (100/día), luego se detiene; API/SMTP exigen dominio autenticado (single sender solo marketing → 403) | Sí | Era el candidato obvio hasta verificar el trial |
| MailerSend | 12k/mes | Sí (obligatorio) | Requiere dominio desde el día 1 |
| Mailgun / SES | trial/12 meses limitado | Sí | Requieren tarjeta |
| Gmail SMTP | 500/día | — | Bloquea cuentas con uso transaccional; no apto |

**Plan**: **SMTP nativo de Supabase** para todo el email funcional HOY → **Resend como único transaccional cuando exista el dominio** (SPF/DKIM nativos = mejor entregabilidad). Sin failover entre proveedores (solo habrá 1 configurado).

## 2. Paquete `@ciszunetwork/email`

Abstracción de proveedor (patrón de los demás paquetes compartidos). **HOY solo contiene el provider de Resend, sin API key activa:**

```
packages/email/
  src/types.ts       EmailProvider, EmailMessage, EmailResult, EmailError, EmailNotConfiguredError, EmailProviderUnavailableError
  src/resend.ts      createResendProvider() → POST api.resend.com/emails (Bearer); bloqueado sin dominio verificado salvo RESEND_ALLOW_UNVERIFIED (dev)
  src/index.ts       sendEmail(), getEmailProvider() (Resend), getFallbackProvider() → null (un solo proveedor)
  tests/            7 tests (payloads, errores, configuración)
```

> El provider de Brevo se eliminó del paquete (11 ago 2026) junto con su failover. Con 0 proveedores activos, `sendEmail()` lanza `EmailNotConfiguredError` claro — **no rompe builds ni servidores**.

### Env vars

| Variable | Uso |
| --- | --- |
| `RESEND_API_KEY` | Key API de Resend (Fase B, con dominio) |
| `EMAIL_FROM` / `EMAIL_FROM_RESEND` | Remitente, p. ej. `Ciszu Network <no-reply@dominio-verificado>` |
| `RESEND_ALLOW_UNVERIFIED` | Solo desarrollo (envío a tu propia dirección con dominio de prueba resend.dev) |

`EMAIL_PROVIDER` y `EMAIL_FAILOVER` se eliminaron (solo existe un proveedor).

### Uso

```ts
import { sendEmail } from '@ciszunetwork/email';
await sendEmail({
  to: 'fan@example.com',
  subject: 'Verifica tu cuenta',
  html: '<p>Hola...</p>',
});
```

Hasta que exista dominio + `RESEND_API_KEY`, este paquete lanza error claro. Los emails de auth no pasan por aquí (los envía Supabase directamente).

## 3. Supabase Auth (emails de verificación/reset) — HOY

**Sin configuración adicional**: Supabase sirve los emails de auth con su SMTP por defecto (sender `no-reply@supabase.co`). Esto ya cubre verificación de email, reset de contraseña y OTP en las webs que tengan auth (muzicmania).

Para mejorar entregabilidad cuando exista dominio (Fase B): Dashboard → Authentication → SMTP Settings → **Enable custom SMTP** con `smtp.resend.com:465/587`, usuario `resend`, password = API key, sender = `no-reply@<dominio-verificado>`.

> Referencia histórica: el SMTP de Brevo (`smtp-relay.brevo.com:587`, user+pass = API key) queda descartado junto con la cuenta.

## 4. Casos de uso actuales y futuros

- **HOY**: (a) SMTP de Supabase Auth (verificación de email, reset de contraseña) en muzicmania — configuración por defecto; (b) emails de soporte/contacto de las webs → pendientes del paquete hasta Fase B.
- **FUTURO (con dominio)**: emails transaccionales vía Resend (confirmación de donación/pago — NOWPayments IPN), boletines (Resend Broadcasts), facturas de Lemon Squeezy (las emite el MoR, no hace falta).

## 5. Tareas del usuario (para activar en Fase B — tarea cerrada HOY)

> **Estado**: sistema de emails **CERRADO (11 ago 2026)**. El email funcional (auth de Supabase) ya trabaja sin configuración. Los pendientes de abajo solo se activan cuando exista dominio (Fase B); quedan registrados aquí, no en el TODO global.

1. **(Fase B) Comprar/configurar el dominio** (`DOMAINS_SYSTEM.md`).
2. Verificar el dominio en Resend (SPF/DKIM automáticos a los 10–15 min).
3. Copiar `RESEND_API_KEY` a `services/supabase/.env` (vault) + `.env.local` + Vercel.
4. Poner `EMAIL_FROM_RESEND` = `Ciszu Network <no-reply@<dominio>>`.
5. Opcional: activar custom SMTP en Supabase Auth (§3) con Resend para mejor entregabilidad de los emails de auth.
6. Test de humo: `pnpm test` (los tests unitarios no requieren cuenta real).

## 6. Verificación de la implementación (ya hecha)

- Tests del paquete `@ciszunetwork/email` limpiados (Brevo eliminado, Resend único) y pasando.
- Sin API keys reales: `sendEmail` lanza `EmailNotConfiguredError` claro (no rompe builds ni servidores).
- Brevo retirado también del resto del repo: widget de chat de las 4 webs revertido, CSP sin orígenes de brevo.com/sendinblue.com, `AGENTS.md` y docs actualizados.