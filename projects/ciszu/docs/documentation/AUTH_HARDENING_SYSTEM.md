# Sistema de endurecimiento de autenticación (CISZU ID)

Estado: 19 sep 2026. Aplica a las 4 webs (Ciszu Network, CiszuBot, Ciszuko Antony,
MuzicMania). Complementa `AUTH_SYSTEM.md` y `EMAILS_SYSTEM.md`.

Este documento cubre lo implementado para: verificación en dos pasos por email,
recuperación de contraseña, reCAPTCHA v2+v3 en los registros, emails con marca y
la verificación del bloque de anuncios/analítica.

---

## 1. Por qué existe este trabajo

Cada web tenía su PROPIA copia de cada pieza del flujo de autenticación y las
copias habían divergido hasta quedar rotas de formas que no se veían en el
código, solo en el comportamiento:

| Síntoma reportado | Causa real encontrada |
|---|---|
| "No aparece el reCAPTCHA en el registro" | Cada página cargaba `api.js` por su cuenta y ciszukoantony renderizaba el widget **sin llamar nunca a la verificación**. |
| "Un enlace válido de repente pasa a inválido" | `React.StrictMode` monta el efecto dos veces; la segunda lectura ya no encontraba el hash y se declaraba inválido. |
| "No dice por qué falla el enlace" | Supabase comunica el motivo en el hash (`#error_code=otp_expired`) y nadie lo leía. |
| "El 2FA nunca funciona" | La tabla `two_factor_codes` **no existía** en la base de datos, el código no se enviaba a nadie (`TODO` + `console.log`) y el rate-limit nunca se aplicaba (`if (!limiter.allow(ip))` sobre un objeto, siempre verdadero). |
| "La página de recuperación se rompe al guardar" | `ciszubot` usaba `toast(...)` sin definirla → `ReferenceError` justo tras cambiar la contraseña. |

La corrección de fondo es la misma en todos los casos: **una sola
implementación compartida** y **tests sobre la lógica**, no una copia por web.

---

## 2. Lógica compartida (`@ciszunetwork/utils`)

Módulos puros, sin I/O, cubiertos por tests (`packages/utils/tests/`):

| Módulo | Qué decide |
|---|---|
| `authCodes.ts` | Contrato del código 2FA: formato `C-123 434`, TTL 3 h, único por web, 3 intentos, 2 reenvíos, suspensión 30 min. |
| `authRecovery.ts` | Estado del enlace de recuperación (`verified`/`expired`/`used`/`superseded`/`invalid`), motivo, "lleva inválido X", límite de 12 h, y validación de la contraseña nueva (no reutilizable). |
| `recoveryClient.ts` | Lectura del hash de Supabase, marcas de sesión de recuperación y cálculo del instante exacto de caducidad. |
| `recaptcha.ts` + `recaptchaRoute.ts` | Verificación servidor de v2 y v3 (score, `action`, `hostname`) y handler HTTP único. |
| `twoFactor.ts` | Servicio 2FA completo sobre una interfaz de persistencia y un mailer inyectables. |
| `emailBranding.ts` | Plantillas de email con marca y envío por HTTP. |
| `duration.ts` | Formato legible de duraciones ("3 h 20 min"). |

Tests: `npx vitest run packages/utils/tests` (authCodes 16, authRecovery 15,
recaptcha 14, recoveryClient 8, twoFactor 11, emailBranding 11).

---

## 3. reCAPTCHA v2 + v3 (registro e inicio de sesión)

- Componente único `RecaptchaGate` (`@ciszu/ui`): carga `api.js` **una sola vez**
  con `?render=<site key v3>` y monta el widget de v2 con `grecaptcha.render`.
  Cargarlo dos veces (una por versión) era la razón de que no apareciera.
- El token de v3 se pide **justo antes de enviar** (caduca en 2 min y es de un
  solo uso) mediante `v3ExecutorRef`. El de v2 se reinicia con `resetKey` en cada
  envío fallido, porque también se consume.
- Ruta `/api/verify-recaptcha` unificada en las 4 webs: un wrapper de 10 líneas
  sobre `createRecaptchaHandler`. Acepta `{ v2Token, v3Token }` y el formato
  legado `{ token, version }`.
- Política: **v2 es el requisito duro** (el usuario resolvió el reto); v3 aporta
  señal y un score bajo no bloquea si el v2 fue válido, para no dejar al usuario
  sin salida si Google no devuelve score.
- Variables por web:
  `NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2_<WEB>`, `..._V3_<WEB>`,
  `RECAPTCHA_SECRET_KEY_V2_<WEB>`, `RECAPTCHA_SECRET_KEY_V3_<WEB>`
  (`<WEB>` = `CISZU`, `CISZUBOT`, `CISZUKOANTONY`, `MUZIC`).

---

## 4. Recuperación de contraseña

Página `/reset-password` **generada desde plantilla** para las 4 webs
(`scripts/apply-reset-password-pages.mjs`). Para cambiar el comportamiento en las
4, se edita la plantilla y se vuelve a ejecutar.

Contrato implementado:

1. **Primero se evalúa el enlace.** Una sesión normal NO habilita esta pantalla:
   hace falta evidencia del enlace (token en la URL o marca de recuperación en
   `sessionStorage`). Así un enlace caducado nunca inicia sesión.
2. Si falla, se explica el **motivo** (`otp_expired` → expirado, `access_denied`
   → ya usado) y **cuánto lleva inválido**, con icono de advertencia (triángulo),
   no el icono de error anterior.
3. La marca de sesión de recuperación elimina el falso "inválido" al remontar.
4. La contraseña nueva **no puede ser la anterior**: se comprueba intentando
   entrar con la candidata (Supabase no expone la anterior).
5. Al guardar, la sesión **se cierra sola** y hay que volver a iniciar sesión.
6. En el login, el aviso de **un solo uso** se muestra siempre antes de pedir el
   enlace, y pedir demasiados enlaces obliga a esperar **12 horas**.

---

## 5. Verificación en dos pasos por email

- **Formato de la clave: `C-123 434`** (prefijo `C`, guion, 3 dígitos, espacio, 3
  dígitos). Temporal (3 h), **único por website**, reenviable 2 veces con
  enfriamiento de 60 s, y con suspensión de 30 min al agotar intentos o reenvíos.
- Rutas por web (`/api/auth/2fa/*`), generadas desde plantilla
  (`scripts/apply-two-factor-routes.mjs`):
  `generate` (emite y envía), `resend`, `verify`, `status`, `enable`, `disable`.
  Todas exigen `Authorization: Bearer <access_token>`.
- Pantalla: `TwoFactorGate` (`@ciszu/ui`), autónomo, integrado en los 4 logins.
  Tras validar la contraseña, el login consulta `status`; si el 2FA está activo
  en esa web, muestra la pantalla en vez de entrar.
- Activar el 2FA (`enable`) **exige verificar un código válido antes**, para
  garantizar que el canal de email del usuario funciona.
- El flag vive en `public.two_factor_settings (user_id, website, enabled)` y es
  **por web**: se puede tener activo en CiszuBot y no en MuzicMania.

### Migraciones aplicadas

- `20260906000001_two_factor_codes.sql` (base — **no estaba aplicada**, la tabla
  no existía).
- `20260919000001_two_factor_codes_hardening.sql` — columnas `attempts`,
  `resends`, `last_sent_at`, `suspended_until`, índices, retirada de las
  políticas de INSERT/UPDATE del cliente (si el navegador pudiera escribir un
  código, el 2FA no valdría nada) y `purge_stale_two_factor_codes()`.
- `20260919000002_two_factor_settings.sql` — tabla del flag por web + backfill
  desde los `profiles.two_factor_enabled` existentes.

---

## 6. Emails con marca

- Plantillas en `emailBranding.ts`: cabecera "Ciszu Network / <web>", bloque de
  código monoespaciado, botón de acción, estilos en línea (lo único que respetan
  todos los clientes), y pie con Términos, Privacidad y Soporte.
- Asunto siempre `Ciszu Network | <web> — <título>`.
- Los correos de seguridad declaran **"no es publicidad ni patrocinio"**; los de
  marketing declaran lo contrario de forma explícita.
- El transporte es Resend por HTTP directo (sin nuevas dependencias en las webs).
  **Sin `RESEND_API_KEY` no se envía**: la función devuelve el motivo en lugar de
  fingir éxito, y `EMAIL_ALLOW_PREVIEW=1` (solo desarrollo) marca `previewOnly`.

### Pendiente de configuración externa

- [ ] `RESEND_API_KEY` + `EMAIL_FROM_RESEND` en Vercel de las 4 webs (requiere
      dominio verificado — Fase B Cloudflare). Sin esto el 2FA no puede enviar.
- [ ] Personalizar las plantillas de Supabase Auth (confirmación de email y
      recuperación) con el mismo diseño y remitente `Ciszu Network | <web>` en
      Dashboard → Authentication → Email Templates.

---

## 7. Registro e inicio de sesión

- Al registrarse, la sesión que `supabase-js` crea al vuelo **se cierra**: hay
  que iniciar sesión de nuevo y confirmar el email. Así el registro no salta la
  verificación.
- Al cerrar sesión (manual o automática) **siempre** se vuelve al home de la web.
- `muzicmania` ya no valida la contraseña nueva dentro del login: envía el enlace
  y el proceso continúa en `/reset-password`.

---

## 8. Anuncios y analítica — verificación

Verificado el 19 sep 2026:

- `ads.txt` presente en `public/` de las 4 webs con
  `google.com, ca-pub-3471969072198962, DIRECT, f08c47fec0942fa0`.
- `GoogleScripts` (GTM + GA4 + AdSense) renderizado en el `layout.tsx` de las 4.
- IDs confirmados: GTM `GT-KV5477MC` (ciszu), `GT-WF8B9HT8` (ciszubot),
  `GT-TXZGRRF9` (ciszukoantony), `GT-K4Z6G8LS` (muzicmania). GA4 y AdSense
  configurados en las 4.
- CSP (`packages/utils/src/csp.ts`) incluye `googletagmanager.com`,
  `pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`,
  `partner.googleadservices.com` y los orígenes de `google-analytics.com` en
  `script-src`, `img-src`, `connect-src` y `frame-src`.

### Pendiente de configuración externa (no depende del código)

- [ ] AdSense: enviar/verificar los 4 sitios, esperar aprobación y crear las
      unidades de anuncio por sitio.
- [ ] GA4: confirmar `page_view` en tiempo real en los 4 dominios.
- [ ] GTM: publicar contenedores y comprobar en Preview que los tags de GA4 y
      AdSense se disparan.
- [ ] Looker Studio: conectar las fuentes GA4 y crear el panel.
- [ ] En producción, confirmar que no hay 400/500 en impresiones de ads ni
      bloqueos de CSP.

---

## 9. Cómo se mantiene esto

Tres scripts generan el código repetido a partir de UNA plantilla. Si hay que
cambiar el comportamiento de las 4 webs, se edita la plantilla y se ejecuta:

```bash
node scripts/apply-reset-password-pages.mjs
node scripts/apply-two-factor-routes.mjs
```

Los scripts fallan si queda algún marcador `__ALGO__` sin sustituir, así que no
se pueden generar páginas a medias.

_Última revisión: 19 sep 2026._ Relacionado: `AUTH_SYSTEM.md`,
`EMAILS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`, `AD_SYSTEM.md`,
`CIBERSECURITY_SYSTEM.md`, `BACKEND_SYSTEM.md`.
