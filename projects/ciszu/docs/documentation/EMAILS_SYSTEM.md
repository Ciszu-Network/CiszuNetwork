# EMAILS_SYSTEM — Emails transaccionales (Supabase hoy → Resend con dominio)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: EMAILS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de emails transaccionales del ecosistema. Estado: Supabase Auth
> SMTP hoy (sin dominio), Resend como único proveedor cuando exista dominio. Brevo descartado.

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

## Conceptos de email (contexto informático)

| Término | Definición |
|---|---|
| **Transactional email** | Email automático por acción (verificación, reset, recibo) |
| **SMTP** | Protocolo de envío de correo |
| **Sender** | Remitente (p. ej. `no-reply@dominio`) |
| **SPF** | Registro que autoriza servidores de envío |
| **DKIM** | Firma del mensaje para verificar autenticidad |
| **DMARC** | Política de verificación de remitente |
| **API key** | Token para llamar al servicio de email |
| **Deliverability** | Capacidad de llegar a la bandeja de entrada |
| **Domain verification** | Verificar que controlas el dominio (DNS TXT) |
| **MoR** (Merchant of Record) | Entidad que emite facturas (p.ej. Lemon Squeezy) |

## Cuándo usar qué (decisión rápida)

| Situación | Solución |
|---|---|
| Emails de auth (verificación/reset/OTP) | SMTP nativo de Supabase (hoy, sin dominio) |
| Transaccionales con dominio (Fase B) | **Resend** (3.000/mes free, SPF/DKIM auto) |
| Boletines (newsletter) | Resend Broadcasts (con dominio) |
| Confirmación de donación/pago | Resend + NOWPayments IPN (futuro) |
| Soporte/contacto de webs | Pendiente del paquete hasta Fase B |

## Env vars del paquete

| Variable | Uso |
|---|---|
| `RESEND_API_KEY` | Key de Resend (Fase B) |
| `EMAIL_FROM` / `EMAIL_FROM_RESEND` | Remitente con dominio verificado |
| `RESEND_ALLOW_UNVERIFIED` | Solo desarrollo |

## Troubleshooting

| Problema | Solución |
|---|---|
| `EmailNotConfiguredError` | No hay proveedor activo (esperado sin dominio) |
| Emails en spam | Verificar SPF/DKIM/DMARC con dominio |
| Resend 403 | Dominio no verificado o sender inválido |
| Brevo/otro error | Ya descartado — no reintroducir |

## Checklist de activación Fase B

- [ ] Dominio comprado (ver `DOMAINS_SYSTEM.md`).
- [ ] Dominio verificado en Resend (SPF/DKIM).
- [ ] `RESEND_API_KEY` en vault + `.env.local` + Vercel.
- [ ] `EMAIL_FROM_RESEND` configurado.
- [ ] (Opcional) Custom SMTP en Supabase Auth.
- [ ] `pnpm test` del paquete pasando.

## Autenticación de email en detalle (SPF / DKIM / DMARC)

| Mecanismo | Qué hace | Dónde se configura |
|---|---|---|
| **SPF** | Autoriza qué IPs/servidores pueden enviar con tu dominio (registro TXT con `include:`) | DNS del dominio (Resend lo añade) |
| **DKIM** | Firma criptográfica del mensaje para verificar que no fue alterado | DNS + el proveedor firma en el envío |
| **DMARC** | Política sobre qué hacer con mensajes que fallan SPF/DKIM (ninguna / cuarentena / rechazo) | DNS (registro TXT `_dmarc`) |
| **MX** | Rutas del correo entrante | DNS del dominio |
| **Return-Path / reply-to** | Dirección de rebotes y de respuesta | Configuración del envío |

Con Resend (Fase B): SPF y DKIM se generan automáticamente al verificar el dominio (suelen
propagar en 10-15 min); DMARC se puede añadir manualmente. Sin dominio no hay SPF/DKIM
propios — por eso hoy los emails de auth salen con el dominio `supabase.co`.

## Buenas prácticas de entregabilidad

1. Mantener **volumen gradual** al estrenar un dominio (no disparar miles de emails el día 1).
2. Usar un **remitente consistente** (`no-reply@<dominio>`) en todos los transaccionales.
3. Incluir **unsubscribe/preferencias** en envíos masivos (afecta a la reputación del dominio).
4. Monitorear **rebotes (bounce)** y quejas; limpiar las listas de direcciones inválidas.
5. Si el volumen crece, separar **transaccionales y boletines** en subdominios/SPF distintos.
6. Los **transaccionales** (verificación, reset, recibos) tienen prioridad de entrega sobre
   el marketing — los providers free también los tratan mejor.

## Casos de uso y proveedor recomendado (resumen)

| Caso | HOY (sin dominio) | Fase B (con dominio) |
|---|---|---|
| Verificación/reset/OTP de auth | SMTP nativo de Supabase | Idem o custom SMTP → Resend |
| Confirmación de donación/pago | No aplica | Resend (NOWPayments IPN) |
| Boletines | No aplica | Resend Broadcasts |
| Soporte/contacto de webs | Paquete sin provider (error claro) | Resend |

## Relación con otros sistemas

- `DOMAINS_SYSTEM.md` / `CLOUDFLARE_SYSTEM.md` — el dominio de Fase B es prerequisito de Resend.
- `PAYMENTS_SYSTEM.md` — la confirmación de pago (NOWPayments IPN) disparará los emails
  transaccionales futuros.
- `VAULT_SYSTEM.md` — `RESEND_API_KEY` y `EMAIL_FROM` viven cifrados ahí y en Vercel/`.env.local`.
- `ONLINE_SERVICES_SYSTEM.md` — inventario de cuentas (Resend/Brevo) y su estado.
- `AUTH_SYSTEM.md` — flujo de emails de verificación de Supabase Auth.

## Preguntas frecuentes

**¿Puedo usar `RESEND_ALLOW_UNVERIFIED` en producción?** No — es solo para desarrollo
(envíos a tu propia dirección con el dominio de prueba `resend.dev`).

**¿Por qué no reintroducir Brevo?** Cuenta suspendida permanentemente + exige teléfono no
venezolano para API keys; no es viable desde VE.

**¿Cuánto tarda en verificar el dominio en Resend?** SPF/DKIM suelen propagar en 10-15 min;
con DNS externo puede tardar más según el TTL de los registros.

**¿Qué pasa si supero los 3.000 emails/mes del free de Resend?** Se evalúan alternativas
(MailerSend 12k/mes) o un plan de pago, según la regla de financiación del ecosistema.

## Checklist de configuración del dominio en Resend (resumen)

- [ ] Dominio comprado (Fase B).
- [ ] Verificar el dominio (añadir los registros DNS requeridos).
- [ ] Confirmar SPF + DKIM activos en el dashboard.
- [ ] (Opcional) Añadir DMARC `_dmarc`.
- [ ] Guardar `RESEND_API_KEY` en vault + `.env.local` + Vercel.
- [ ] Probar un envío real y revisar los logs en Resend.

_Última revisión: 13 ago 2026._ Relacionado: `DOMAINS_SYSTEM.md`, `PAYMENTS_SYSTEM.md`,
`CLOUDFLARE_SYSTEM.md`, `VAULT_SYSTEM.md`.