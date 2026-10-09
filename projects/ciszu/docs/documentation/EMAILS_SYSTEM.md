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

**Customizados con marca Ciszu Network (04 oct 2026)**: los 5 templates de auth (confirmation, recovery, magic_link, email_change, invite) están personalizados vía la Management API (`PATCH /v1/projects/{ref}/config/auth`) con:

- **Subjects**: `Confirma tu cuenta | Ciszu Network`, `Restablece tu contraseña | Ciszu Network`, `Tu enlace mágico | Ciszu Network`, `Confirma tu nuevo correo | Ciszu Network`, `Invitación a Ciszu Network`.
- **HTML**: diseño neon (degradado azul→rosa), botón de acción, aviso "Este correo NO es de patrocinio ni un anuncio", y enlaces a Términos (`/terms`) y Política de Privacidad (`/policy`) de ciszunetwork.vercel.app.
- El sender sigue siendo `no-reply@supabase.co` (SMTP por defecto); para remitente propio se requiere dominio + custom SMTP (Fase B).

**Aplicación automatizada**: `scripts/apply-email-templates.js` (lee `SUPABASE_ACCESS_TOKEN` del vault `services/supabase/.env`; usa solo variables válidas `{{ .ConfirmationURL }}` — nunca `.Subject`/`.ButtonText`, que la API rechaza con 400). Plantilla fuente: `projects/ciszu/docs/email/template-auth.html`.

> Las webs comparten el proyecto Supabase (`obwzzmbvkrcscqwptlqo`), por eso el subject usa la marca genérica "Ciszu Network" (no el nombre de cada web). Si en el futuro cada web tuviera su propio proyecto, se diferenciaría el subject por proyecto.

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

## SMS (preparado, proveedor pendiente)

El ecosistema deja preparado el canal SMS sin depender de un proveedor concreto:

- **Utilidad**: `sendSms({ to, text })` en `packages/utils/src/sms.ts` (exportada por `@ciszunetwork/utils`, server-only). Usa las env `SMS_API_URL`, `SMS_API_KEY` y `SMS_FROM` (proveedor HTTP tipo Twilio-compatible); si no están configuradas devuelve `{ sent: false, error }` sin romper el flujo. Nunca lanza excepciones.
- **Preferencia**: columna `sms_enabled` en `public.notification_preferences` (migración `20261009000002_notification_sms.sql`), editable desde "Notificaciones" del panel de cuenta de las 4 webs, junto a un campo de **teléfono** guardado en `user_metadata.phone`.
- **Activación**: cuando exista proveedor (p.ej. Twilio), añadir las 3 env al vault (`services/supabase/.env`) + proyectos Vercel y llamar `sendSms()` desde los flujos que lo requieran (p. ej. avisos anticheat o seguridad).

_Última revisión: 13 ago 2026._ Relacionado: `DOMAINS_SYSTEM.md`, `PAYMENTS_SYSTEM.md`,
`CLOUDFLARE_SYSTEM.md`, `VAULT_SYSTEM.md`.

## Emails propios con marca (19 sep 2026)

Los correos que envía la aplicación (hoy el código 2FA) ya no salen como
"Supabase": van con remitente y asunto `Ciszu Network | <web>`, diseño propio y
pie con Términos, Privacidad y la aclaración de que **no son publicidad** (o de
que SÍ lo son, si el mensaje es promocional).

- Plantillas y transporte: `packages/utils/src/emailBranding.ts`
  (`renderBrandedEmail`, `twoFactorEmail`, `sendBrandedEmail`).
- Sin `RESEND_API_KEY` + `EMAIL_FROM_RESEND` el envío **falla con motivo**, no
  finge éxito. `EMAIL_ALLOW_PREVIEW=1` (solo desarrollo) marca `previewOnly`.
- Queda pendiente personalizar en el Dashboard de Supabase las plantillas de
  confirmación y recuperación con el mismo diseño y remitente: ver
  `AUTH_HARDENING_SYSTEM.md` §6.

## Ecosistema completo de emails (05 oct 2026)

### Branding por web (`emailBranding.ts` + `emailSites.generated.ts`)

Cada web tiene su propia versión del email. Los assets (logotipos, isotipos,
extras de cabecera, iconos de categoría, redes y UI) se incrustan como **PNG en
`data: URI`** para que Gmail los muestre **sin pedir "Mostrar imágenes"** (con
imágenes externas Gmail las bloquea por defecto). El generador
`scripts/build-email-sites.js` rasteriza los SVG de
`projects/<web>/content/logos/` y los iconos lucide con Playwright y los embebe
como base64, re-rasterizando los PNG de origen grandes para no superar el límite
de Gmail (~102 KB).

- **Logos a color/degradado** (no blancos): `EMAIL_CISZU_WORDMARK` y
  `EMAIL_SITE_ISOTYPES` usan las variantes `gradient/color` de cada web.
- Config por web: `EMAIL_SITES` (nombre, url, acento, acento2, degradado del
  botón, **fondo oscuro propio `bg`**, fondo de tarjeta `cardBg`, settingsUrl,
  redes). Cada web tiene un fondo oscuro distinto y su degradado superior según
  el logotipo. `resolveSite(siteKey, siteName)` con fallback a `ciszu`.
- **Cabecera**: **logotipo maestro de Ciszu Network (con engranaje)** en todas
  las webs + extras por web a la derecha (isotipo redondeado del bot en ciszubot,
  logotipo de muzicmania, isotipos + youtube en ciszukoantony). En ciszu el
  logotipo maestro va centrado (sin isotipo redundante).
- **Pie**: sección de **redes** (siempre, con color de marca) + bloque del
  ecosistema **`[isotipo ciszunetwork] × [isotipo web]`** con la **X crossover**
  (isotipo de ciszunetwork monocromo outline blanco) y **copyright** por web y de
  Ciszu Network.
- **Icono de categoría** junto al título (verificación, llave, magia, candado,
  ticket...) con color semántico (`EMAIL_CATEGORY_ICONS`).
- **Botón centrado con flecha** (`EMAIL_UI_ICONS.arrow_right`).
- **Código estilo Steam**: `C-` **fijo** + dígitos separados (`C-1 2 3 4 3 4`)
  y **botón de copiar** al lado (`EMAIL_UI_ICONS.copy`). El prefijo `C-` es
  plantilla: solo se verifica el número; el botón copia los dígitos.
- **Sección de redes** (siempre presente, aparte) con **logos a color de marca**
  (youtube rojo, instagram, x, discord, github, tiktok, facebook...).
- **Emisor**: "Enviado por Ciszu Network · ciszunetwork@gmail.com · Página:
  <web> (url)".
- **Receptor**: saludo tras el título (ver abajo).
- **Aviso legal** ("no es publicidad" o el promocional) con **icono de aviso**, y
  **disclaimer de proveedor** con **icono de Supabase**: el correo se envía a
  través de Supabase mientras no haya dominio propio.

### Saludo al receptor (privacidad)

`renderBrandedEmail` recibe un `EmailRecipient` (`email`, `displayName`,
`username`) y un flag `loggedIn`:

| Contexto | Saludo |
| --- | --- |
| **Sin sesión** (verificación, recovery, magic link, cambio de correo, invitación) | `¡Hola, usuario@email.com!` (solo el correo, por privacidad). |
| **Con sesión** (ticket de soporte, avisos, notificaciones, patrocinios) | `¡Bienvenido Nombre @usuario (usuario@email.com)!` |
| Cuenta sin display name ni username | `¡Bienvenido (usuario@email.com)!` (solo el correo). |

### Plantillas disponibles

| Plantilla | Función |
| --- | --- |
| `twoFactorEmail` | Código OTP de acceso (usado por el 2FA de las 4 webs) |
| `welcomeEmail` | Bienvenida tras verificar la cuenta |
| `notificationEmail` | Notificaciones transaccionales de cada web |
| `sponsorshipEmail` | Patrocinio/anuncio de un proyecto (marketing, avisa cómo desactivar) |
| `accountWarningEmail` | Aviso de seguridad de la cuenta |
| `passwordChangedEmail` | Confirmación de cambio de contraseña |
| `supportTicketEmail` | Ticket de soporte creado (con sesión: muestra usuario) |
| `unlinkedEmail` | **Correo no vinculado**: no existe cuenta; sin enlaces, ofrece crear cuenta |
| `authConfirmationEmail` / `authRecoveryEmail` / `authMagicLinkEmail` / `authEmailChangeEmail` / `authInviteEmail` | Plantillas de Supabase Auth (botón con `{{ .ConfirmationURL }}`) |
| `debugEmail` | Plantilla de diagnóstico (solo devcon) |

### Preferencias de notificación (`notification_preferences`)

Tabla RLS por usuario (migración `20261005000001_notification_preferences.sql`):
`sponsorship_enabled`, `account_alerts_enabled`, `site_notifications_enabled`,
`newsletter_enabled`. Políticas separadas por comando (SELECT/INSERT/UPDATE/DELETE),
solo dueño (`auth.uid()`). Se gestionan desde la sección **Notificaciones** del
`AccountSettingsPanel` (casillas) vía el endpoint
`/api/auth/account/preferences` (GET/POST, con rate limit, en las 4 webs).

### Patrocinios diarios

- Endpoint `POST /api/sponsorship/dispatch` (solo ciszu): recorre los usuarios
  con `sponsorship_enabled=true` y envía un patrocinio rotativo de un proyecto
  del ecosistema (cambia cada día). Protegido con `SPONSORSHIP_CRON_SECRET`.
- Cron: `.github/workflows/sponsorship-cron.yml` (08:00 UTC diario) llama al
  endpoint con el secret. Sin `RESEND_API_KEY` los envíos fallan con motivo.
- Los emails de patrocinio recuerdan que se pueden desactivar en la cuenta.

### Sender propio (cómo cambiar el email del emisor)

El email de Supabase Auth sale de `noreply@mail.app.supabase.io` por el SMTP por
defecto. Para usar un remitente propio **se necesita un dominio** (no se puede
con `*.vercel.app`). Vías:

| Vía | Qué hacer | Cuándo |
| --- | --- | --- |
| **Custom SMTP en Supabase** | Dashboard → Authentication → SMTP Settings → Enable custom SMTP (ej. `smtp.resend.com:587`, usuario `resend`, password = API key, sender `no-reply@tudominio.com`) | Con dominio (Fase B) |
| **Envío propio (Gmail hoy)** | `sendBrandedEmail` usa **Resend** (si `RESEND_API_KEY`) y, si no, **Gmail API** (OAuth del sistema con `gmail.send`). Remitente = la cuenta del sender central (`fplayersoffcial@gmail.com`). Cubre 2FA, welcome, sponsorship, support, etc. | Hoy (hasta el dominio) |
| **Resend con dominio** | `EMAIL_FROM_RESEND` = `Ciszu Network <no-reply@tudominio.com>`; pasa a ser el transporte preferido y Gmail queda de fallback | Fase B |

> **Nota multi-empleado**: la credencial de envío (OAuth de Gmail / Resend) es
> **del sistema**, no personal. En producción la usa el backend (env vars de
> Vercel: `GOOGLE_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN` o `RESEND_API_KEY`);
> los empleados nunca la tocan. En la devcon se lee del vault local; sin credencial
> la devcon solo previsualiza (aviso claro).

**Recomendación**: comprar el dominio (`DOMAINS_SYSTEM.md`, ~$11/año con
Cloudflare/Porkbun) → verificar en Resend (SPF/DKIM automáticos) → activar
custom SMTP de Supabase con Resend para que los emails de auth también salgan
con el dominio propio. Resend sigue siendo el proveedor recomendado (3.000/mes
free, mejor entregabilidad).

### Debug de emails (devcon)

La consola de desarrollo tiene un apartado **EMAILS (debug)** (`test/website/debug/dev_console.ps1`)
que genera los emails para previsualizarlos y **enviarlos de verdad**, sin pasar
por la API de las webs (sin rate limit):

- Script `scripts/email-debug.mts` (con `tsx`): genera HTML/TXT por combinación
  web × tipo (13 tipos: los 5 de Supabase Auth + 8 de app, incluido `support_ticket`).
- Menú de **casillas** (webs y tipos); opción **GLOBAL** que salta el menú de webs.
- **Galería** `test/website/debug/local-logs/emails/index.html` con todas las
  combinaciones a la vez (iframes).
- **Correo destino** (se pide siempre; default `DEV_EMAIL`/`MEGA_EMAIL` del vault).
- **Datos del receptor** (`--as <correo>`): rellena la plantilla con esa cuenta
  (display name/username reales consultando Supabase). Si el correo **no está
  vinculado**, sale la plantilla de **error** (`unlinkedEmail`) para los tipos que
  requieren cuenta. Sin `--as`, datos ficticios `Usuario @usuario (usuario@email.com)`.
- **Envío real** (`--send`, cooldown de 1s por correo): intenta **Resend**
  (`RESEND_API_KEY`) y, si no, **Gmail API** (scope `gmail.send`). Sin ninguna de
  las dos, avisa y solo previsualiza (no hay proveedor).
- **Tag devcon**: los emails generados/enviados por la devcon llevan la franja
  "Enviado por la DEVCON" y el asunto `[DEVCON]`, así que la versión de devcon es
  distinguible de la real.
- **Plantilla `debugEmail()`**: muestra de golpe isotipos, redes, iconos de
  categoría, código, botón, avisos y disclaimer.
- Opción **Aplicar plantillas de auth a Supabase** (`--apply-supabase`): sube las
  5 plantillas de auth generadas con `emailBranding.ts` (mismo diseño que la app).
- Detalle: `DEV_CONSOLE_SYSTEM.md` §4.7.

> **Envío real (OAuth de Gmail, activo)**: el sistema envía **por Gmail API** con
> el OAuth del sender central (`GOOGLE_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN`, scope
> `gmail.send`; la cuenta es `fplayersoffcial@gmail.com`). Es una **credencial del
> SISTEMA**, no de un empleado: en producción la usa el backend (env vars de
> Vercel); en la devcon se lee del vault. Cuando se compre el dominio, se pasa a
> **Resend** (`RESEND_API_KEY`), que es el transporte preferido y queda como
> fallback automático (ver `sendBrandedEmail`).