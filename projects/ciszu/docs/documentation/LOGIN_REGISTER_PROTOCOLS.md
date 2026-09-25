# LOGIN_REGISTER_PROTOCOLS — Protocolo CISZU ID (Login/Registro) — Ciszu Network

Versión: 1.0.0
Actualización: 2026-08-19
Identificador: LOGIN_REGISTER_PROTOCOLS_V1.0.0_2026_08_19_ciszunetwork

> **Estado**: aprobado e implementado (19 ago 2026). Define el estándar **oficial** de
> identidad, login y registro de las 4 webs (ciszunetwork, ciszukoantony, ciszubot,
> muzicmania). Complementa `AUTH_SYSTEM.md` (plan estratégico Supabase-first) con las
> reglas de producto y de UI/UX. Toda pantalla de auth nueva debe cumplir ESTE documento.
> La fuente de verdad estratégica (Supabase, RLS, migración 20, schemas por web) es
> `AUTH_SYSTEM.md` y `DB_SYSTEM.md`; aquí manda la experiencia, el branding y la seguridad
> de la capa de presentación.

---

## 1. Identidad oficial: CISZU ID

- Toda cuenta creada en cualquier web del ecosistema es oficialmente una cuenta **CISZU ID**.
- El título del bloque de login/registro debe ser **"CISZU ID"**; el subtítulo sigue el
  patrón **"Crea tu cuenta en (Proyecto) con CISZU ID"** (registro) y **"Inicia sesión en
  (Proyecto) con CISZU ID"** (login).
- El único OAuth que NO es placeholder es el de **Discord en ciszubot** (obligatorio). Los
  demás (Google, Microsoft) son beta/placeholder pero se muestran igual en todas las webs.
- Una cuenta CISZU ID = un `auth.users` en el proyecto Supabase `obwzzmbvkrcscqwptlqo`,
  con perfil en el schema de cada web (ciszunetwork/ciszukoantony/ciszubot/muzicmania).
  Nunca duplicar identidad (una sola cuenta, varios schemas de perfil).

### 1.1 Iconografía de marca (cabecera de auth)

Toda página/panel de login y registro muestra una línea horizontal centrada con:

```
[CISZU isotipo]  [X SVG]  [isotipo de la web]
```

- El isotipo de CISZU va a la izquierda y el de la web a la derecha, separados por una
  **"X" en SVG** (estilo colaboración/conexión, `currentColor`).
- Al hacer click en el **isotipo de CISZU** se navega a `https://ciszunetwork.vercel.app`.
- Al hacer click en el **isotipo de la web** se navega a la home de la propia web.
- Debajo puede haber una recomendación opcional: "¿Sin cuenta en Ciszu Network? Créala y
  úsala en todas nuestras apps" con link a `https://ciszunetwork.vercel.app/register`.
- Los isotipos se resuelven con `assetResolver.resolve` (CDN), nunca rutas hardcodeadas.

### 1.2 Subtítulo del proyecto

| Web           | Subtítulo login                              | Subtítulo registro                            |
| ------------- | -------------------------------------------- | --------------------------------------------- |
| ciszunetwork  | Inicia sesión en Ciszu Network con CISZU ID  | Crea tu cuenta en Ciszu Network con CISZU ID  |
| ciszukoantony | Inicia sesión en Ciszuko Antony con CISZU ID | Crea tu cuenta en Ciszuko Antony con CISZU ID |
| ciszubot      | Inicia sesión en CiszuBot con CISZU ID       | Crea tu cuenta en CiszuBot con CISZU ID       |
| muzicmania    | Inicia sesión en MuzicMania con CISZU ID     | Crea tu cuenta en MuzicMania con CISZU ID     |

---

## 2. "CONTINUAR CON:" — proveedores OAuth

- Los proveedores sociales NO son "opciones adicionales": se presentan bajo el encabezado
  **"CONTINUAR CON:"** (script en mayúsculas, tracking ancho).
- Orden: Google, Microsoft y (solo ciszubot) Discord. El orden por defecto es Google,
  Microsoft; en ciszubot se añade Discord como primera opción destacada.
- **Iconos oficiales (idénticos en las 4 webs)**, copiados de ciszunetwork:
    - **Google** (4 colores): `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`.
    - **Microsoft** (4 cuadrantes): `#F35325`, `#81BC06`, `#05A6F0`, `#FFBA08`.
    - **Discord**: `#5865F2` (isotipo oficial).

- Comportamiento: Google/Microsoft muestran un aviso toast "OAuth de X disponible en
  futura versión beta" (placeholder). Discord en ciszubot hace el flujo real
  (`/api/auth/discord`).
- El componente `OAuthProviders` de muzicmania sirve de referencia base para el estilo y
  las dimensiones (botones `flex-1`, icono color + nombre, hover con el brand color).

---

## 3. Estructura de la pantalla de auth

Todas las webs usan **páginas propias** `/login` y `/register` (ruta `(auth)` o raíz),
accesibles desde el dropdown del botón AUTH y desde los enlaces de menú. No modales laterales
para el flujo completo.

### 3.1 Errores de formulario coherentes (regla global)

- Los errores van **bajo el campo, alineados a la izquierda**, con `text-red-400 text-[10-11px] font-bold`, animación suave de entrada (fade/slide corta) — estilo de muzicmania/login de
  ciszunetwork.
- Los inputs con error marcan borde `border-red-500/50`.
- **PROHIBIDO** el estilo "centrado" de los errores de ciszukoantony: la tarjeta se centra,
  pero los mensajes de error y los labels NO.
- Los errores globales de sesión (fallo de Supabase, captcha faltante) van en un banner
  dentro de la tarjeta, izquierda-alineado, tono rojo translúcido.

### 3.2 Footer de acciones secundarias (TODOS los auth)

Todo formulario de login o registro incluye debajo la batería de accesos rápidos, excluyendo
el que corresponde a la propia pantalla:

| Acción                                     | En login                             | En registro |
| ------------------------------------------ | ------------------------------------ | ----------- |
| ¿Has olvidado tu contraseña?**RECUPÉRALA** | ✅ (abre olvido)                     | —           |
| ¿Sin registro?**REGÍSTRATE**               | ✅ → /register                       | —           |
| ¿Acceder ahora?**ACCEDER**                 | —                                    | ✅ → /login |
| ¿Necesitas ayuda?**SOPORTE**               | ✅ → /support (o /soporte según web) | ✅ idem     |

- Formato de cada línea: pregunta en `text-gray-500 font-bold uppercase tracking-[0.2em]` y
  la acción subrayada con `underline decoration-*` uso del color de marca de la web.
- En ciszubot estas acciones conviven con el acceso a Discord ("Acceder con Discord").

---

## 4. Preferencias locales (modal)

- Las preferencias viven en un **modal centrado separado** (Radix `Dialog` de `@ciszu/ui`),
  abierto desde el botón AUTH: dentro del dropdown AUTH hay un botón **"Preferencias
  locales"** que abre el modal (NO están embebidas en el dropdown).
- El modal tiene su botón **X** de cierre (arriba derecha) + ESC/focus trap (Radix).
- Apariencia: parecida al menú de configuración de MuzicMania; contenedor `max-w-md`,
  cabecera con icono ajustes + título "Preferencias locales", fondo oscuro neon.
- **Si el usuario borra los datos locales se pierden las preferencias y el ID de invitado**
  (no se re-crean salvo al volver a interactuar).

### 4.1 Contenido del modal

Todas las webs muestran los mismos controles, con el ESTILO del control por-web definido:

| Control          | Obligatorio | Regla de estilo                                                       |
| ---------------- | ----------- | --------------------------------------------------------------------- |
| **Idioma**       | Sí          | MISMO selector que el menú hamburguesa/sidebar y el footer (ver §6.1) |
| **Tema**         | Sí          | MISMO botón sol/luna del menú hamburguesa/footer (ver §6.2)           |
| **Zoom**         | Sí          | Estilo de ciszubot (botones redondos − / valor % / +)                 |
| **Silenciar**    | Sí          | Cualquier estilo EXCEPTO el de ciszubot (usar etiqueta + switch)      |
| **Ayuda rápida** | Sí          | Enlaces propios de cada web (ver §4.2)                                |

- **Zoom**: de forma **independiente por página** (cada ruta guarda su zoom en
  `localStorage`) y persistido. Límites 80–140%, paso 10%. Se aplica al `<html>` `font-size`.
- **Silenciar pestaña**: **independiente por página**. Cambia título + favicon a icono mute.

### 4.2 Ayuda rápida por web

| Web           | Enlaces de ayuda                                |
| ------------- | ----------------------------------------------- |
| ciszunetwork  | /help · /faq · /support · /policies             |
| ciszukoantony | /support · /feedback (o sus rutas equivalentes) |
| ciszubot      | /soporte · /faq (según su navegación)           |
| muzicmania    | /help · /faq · /support · /rules                |

---

## 5. Invitados

- Un invitado es el estado sin sesión: **no tiene fila en BD**, se identifica con un ID local:
  `Invitado` + 6 dígitos (p. ej. `Invitado483920`), guardado en `localStorage`
  (claves: `ciszu_guest_name` en ciszunetwork/ciszukoantony/ciszubot; `play_guest_name`
  en muzicmania — **unificada** en el header y dentro de `/play` de muzicmania).
- El botón AUTH sin sesión muestra: icono de invitado (silueta) + nombre `Invitado XXXXXX`.
- Al abrir el dropdown del AUTH, la cabecera distingue invitado de usuario logueado.
- El invitado usa preferencias locales y puede jugar en muzicmania (leaderboard de invitado),
  pero nunca tiene prioridad sobre cuentas reales.
- **Regla de coherencia**: en muzicmania el ID de invitado es SIEMPRE el mismo en el header
  y dentro de `/play`; en las demás webs no importa que cambie entre páginas, pero se guarda
  igualmente de forma persistente.

---

## 6. Sistema de idioma y tema (consistencia global)

### 6.1 Idioma

- Los botones/selectores de idioma del **botón AUTH (modal prefs)**, del **menú hamburguesa**
  y del **footer** deben ser el MISMO control (extraído a componente compartido o al menos
  con el mismo markup/clases), para que "independientemente" funcione igual que en el sidebar.
- Rutas de bandera por idioma, solo los habilitados: **ES-LA, ES-ES, EN-US, EN-UK**.
  Los demás idiomas de la lista siguen siendo muestra beta con aviso toast (como está hoy),
  pero NO se muestran como funcionales.
- El prefijo del idioma activo se aplica también al `<html lang>` (hoy ciszunetwork lo tiene
  fijo en `es`; todas las webs lo deben actualizar).
- **Geo-idioma**: al primer acceso (sin preferencia guardada en localStorage ni cookie), se
  detecta el país del cliente y se propone el idioma; si el país no tiene idioma soportado,
  se usa **inglés (EN-US)** por defecto. La detección se hace server-side (cabecera
  `x-country`/geo de Vercel o puente en middleware/route) y solo aplica una vez.
- En muzicmania el menú de idiomas dentro de `/play` ya es la referencia visual correcta
  (lista completa con banderas): reutilizar ese patrón.

### 6.2 Tema

- Un único toggle sol/luna con el mismo markup en hamburguesa, footer y modal prefs.
- Persistido en `localStorage` (clave `ciszu_preferences`, campo `theme`) y alternativa en
  cookie (`ciszubot_theme`). Al aplicar, togglea la clase `.light`/`.dark` en `<html>` y
  escribe `color-scheme`. Siempre eliguiendo el dark como default.
- En ciszukoantony el footer NO debe tener estado local propio: debe leer/llamar el store o
  el helper compartido (fix de coherencia conocido).

---

## 7. Campos de texto del auth

- Entrada con `placeholder` interno descriptivo (p. ej. `tu@email.com`, `CapaSinNombre`,
  `••••••••`), contador de caracteres cuando aplique, y marcado de obligatoriedad.
- Los **requeridos** llevan `*` rojo; los **opcionales** la etiqueta `(Opcional)`.
- Error si un campo requerido se envía vacío: "Este campo es obligatorio".
- Cada **título de campo** lleva un **botón/icono de requisitos** (ℹ o `?`) que despliega
  (tooltip/inline) los requisitos de ese campo (mínimos, formato, prohibiciones).
- Lista de campos por flujo:

| Campo (login)    | Requisito mostrar                                   |
| ---------------- | --------------------------------------------------- |
| Email o @usuario | Formato email válido o @usuario; sin espacios       |
| Contraseña       | Obligatoria; 8+ caracteres; política CISZU (ver §8) |

| Campo (registro)     | Requisito mostrar                                                   |
| -------------------- | ------------------------------------------------------------------- |
| Nombre de usuario    | 3–20 caracteres, sin espacios, sin símbolos                         |
| Nombre a mostrar     | 3–30 caracteres                                                     |
| Email                | Formato válido (regex`^\S+@\S+\.\S+$`)                              |
| Fecha de nacimiento  | Mayor de 13 años (muzicmania/opcional según web)                    |
| Contraseña           | 8+ caracteres; ≥1 mayúscula, ≥1 minúscula, ≥1 número, ≥1 símbolo    |
| Confirmar contraseña | Debe ser idéntica a "Contraseña"                                    |
| (opcionales)         | Nombres reales, apellidos, país, teléfono (2FA) — etiqueta Opcional |

---

## 8. Contraseñas (política CISZU ID)

- **Siempre** se repite la contraseña en el registro ("Confirmar contraseña"). La
  discrepancia da error inmediato: "Las contraseñas no coinciden". Es un tipo de error
  propio e independiente de la barra de seguridad.
- **Barra de seguridad** siempre visible mientras se escribe (registro y cambio de contraseña):
  5 segmentos que se llenan por cada criterio cumplido:
    1. 8+ caracteres
    2. 12+ caracteres
    3. ≥1 mayúscula (`[A-Z]`)
    4. ≥1 minúscula (`[a-z]`)
    5. ≥1 número (`[0-9]`) + ≥1 símbolo (`[^A-Za-z0-9]`)

    (En muzicmania hoy cuenta 6 criterios con longitud doble; se unifica a 5 segmentos con la
    regla anterior en Ciszuko? No: **se unifica a 5 segmentos** en TODAS las webs con la misma
    lógica.)

- **Colores por nivel**: 1-2 segmentos `bg-red-500` (Débil), 3 `bg-yellow-500` (Media),
  4-5 `bg-neon-cyan` (Fuerte). **El mínimo aceptable para CISZU ID es "Media" (3/5)**; por
  debajo el formulario no se envía y se avisa: "La contraseña no cumple el nivel mínimo de
  seguridad CISZU ID (al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo)".
- Etiqueta de estado junto a la barra: Muy Débil / Débil / Media (aceptable) / Fuerte.
- **Copiar/pegar**: permitido en todos los campos de texto; **prohibido pegar** en campos de
  contraseña (se bloquea `onPaste`), pero se permite el **autocompletado** de gestores de
  contraseñas (`autoComplete` correcto: `current-password` / `new-password`).

---

## 9. Captcha y verificación de humanidad

- **Gate global**: Cloudflare Turnstile (`CloudflareGuard` de `@ciszu/ui`) ya cubre todas las
  webs (solo en producción, `storageKey` por web). Se mantiene.
- **Captcha por formulario**: login y registro deben incluir **reCAPTCHA v2 invisible/tick**
  (Google, `react-google-recaptcha`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`), igual que muzicmania.
  Es obligatorio completarlo antes de enviar; si no, error "Debes completar el reCAPTCHA".
  Se verifica el token en servidor (ruta `POST /api/verify-recaptcha` o similar con
  `RECAPTCHA_SECRET_KEY`) en todos los entornos salvo bypass local dev.
- Flux: Cloudflare primero (gate de entrada) → reCAPTCHA en el formulario antes de enviar.

---

## 10. Verificación de email y 2FA

### 10.1 Verificación de email (al registrarse)

- Tras un registro exitoso se muestra una **pantalla de "verifica tu correo"**: se informa
  que se mandó un email con link de confirmación. Es **opcional completarla ahora**; el
  usuario puede seguir usando la app y terminar la verificación desde la configuración de su
  cuenta más adelante.
- El link de confirmación es el de Supabase (confirmation URL → la web de origen).

### 10.2 Clave 2FA temporal (CISZU ID)

- Si la cuenta tiene **2FA activada**, tras credenciales válidas se pide una pantalla con la
  clave oficial de CISZU: formato **`C-123 434`** (prefijo `C-`, 6 dígitos, espacio en
  medio de la cifra). Temporal y **expirable en 3 horas**.
    - Mientras se escribe, se auto-formatea `C-` + 3 dígitos + espacio + 3 dígitos.
    - Patrón de validación: `^C-\d{3} \d{3}$`.
- **Único por website**: el mismo secreto 2FA de una cuenta se emite por web (el usuario usa
  un código distinto por web si tiene 2FA en varias).
- Indicar en la pantalla:
    - "La clave expira en 3 horas".
    - Si expiró: aviso y **botón de reenviar** otro código.
- **Reenviar con límites**: máximo 3 reenvíos por intento de acceso. Al 3er reenvío sin éxito
  se **suspende temporalmente el intento de login de forma local** (bloqueo de 10 minutos
  registrado en localStorage/log).

### 10.3 Registro → login

- Tras crear la cuenta, **se redirige a `/login`** (nunca se inicia sesión automáticamente):
  "Cuenta creada. Inicia sesión para continuar."

---

## 11. Recuperación de contraseña

- En login, el enlace "¿Has olvidado tu contraseña? RECUPÉRALA" muestra un paso que **solo
  pide el email** y envía la petición: "Revisa tu correo: hemos enviado un enlace temporal de
  un solo uso para recuperar tu contraseña" (NO se muestra código en pantalla).
- El email (Supabase `resetPasswordForEmail` / plantilla) lleva un **link de un solo uso**
  que abre la **pantalla exclusiva** de actualización de contraseña (ruta
  `/reset-password` / `?code=` recovery de Supabase):
    - Campo "Nueva contraseña" + "Repetir contraseña" + barra de seguridad CISZU (igual §8).
    - **La nueva contraseña no puede ser la anterior**: se envía a Supabase `updateUser` y, si
      la devuelve igual, se avisa.
    - Tras guardar: "Contraseña actualizada. Inicia sesión de nuevo." → `/login`.
- Si el link ya fue usado o expiró: mensaje "El enlace ya fue utilizado o expiró. Solicita
  uno nuevo."

---

## 12. Seguridad de sesión y logs

- Sesión: cookie httpOnly + `SameSite=Lax` + `Secure` en producción. En ciszubot la sesión
  Discord usa cookie HMAC firmada (`ciszubot_session`, 7 días); las sesiones CISZU ID usan
  Supabase Auth (cookie `sb-*` gestionada por `@supabase/ssr`). No exponer tokens en el DOM.
- **Logs de intentos** (login y registro): cada intento (éxito o fallo) se registra con
  **IP**, fecha/hora, tipo (login/register/2fa/reset), email/usuario (nunca la contraseña),
  resultado y user-agent. Tabla por web en el schema correspondiente (p. ej.
  `ciszunetwork.auth_logs` / `ciszukoantony.auth_logs` / `ciszubot.auth_logs` /
  `muzicmania.auth_logs`) con **RLS**. Sirve para sancionar posteriormente spam o intentos de
  hackeo.
- **Rate limit** por IP en los endpoints de auth (login, register, reset, 2fa verify): usar
  `createRateLimiter` de `@ciszunetwork/utils` (mín. 10/min por IP, con backoff).
- El middleware añade cabeceras de seguridad + CSP + sensor IAST (`createIast`) a las 4 webs
  (ya existente; mantener al tocar rutas nuevas `/login`, `/register`, `/reset-password`).
- 2FA y recuperación: los códigos/links son de un solo uso y expiran (3h 2FA, 1 uso reset).

---

## 13. Geo-idioma por IP/pais

- Único intento: si el usuario no tiene preferencia de idioma guardada, el server (Vercel
  geo headers: `x-vercel-ip-country` o `x-country`) selecciona el idioma inicial.
- Mapeo base: `VE|CO|MX|AR|CL|ES` → `ES-LA`/`ES-ES` (ES para todos); `US|UK|CA|AU` → `EN`.
  Cualquier otro país → `EN-US` (inglés por defecto).
- El resultado solo se guarda cuando el usuario interactúa con el selector (no se impone).

---

## 14. Estado actual por web (baseline 19 ago 2026)

| Web           | Login/Register       | Olvido          | Captcha form | Modal prefs | Invitado         | OAuth placeholders     |
| ------------- | -------------------- | --------------- | ------------ | ----------- | ---------------- | ---------------------- |
| ciszunetwork  | ✅ páginas           | ❌              | ❌           | dropdown    | ✅               | ✅ Google/MS           |
| ciszukoantony | ✅ páginas           | ❌              | ❌           | dropdown    | ✅               | ✅ Google/MS           |
| ciszubot      | ✅ páginas + Discord | ❌              | ❌           | dropdown    | ✅               | ✅ Google/MS + Discord |
| muzicmania    | ✅ páginas           | ✅ código 6 díg | ✅ reCAPTCHA | dropdown    | ✅ (header+play) | ✅ Google/MS           |

Brechas principales a cerrar con este protocolo:

1. Olvido/recovery y link de un solo uso en **ciszunetwork, ciszukoantony y ciszubot**.
2. reCAPTCHA en el formulario en **ciszunetwork, ciszukoantony y ciszubot**.
3. Modal de preferencias separado + "Preferencias locales" como botón del dropdown en las 4.
4. Unificar idioma (selector único hamburguesa/footer/modal) + `html lang` + geo-language
   first visit.
5. Fix tema footer ciszukoantony (estado local → store).
6. Errores de ciszukoantony alineados (izquierda, sin centrado).
7. Página de verificación de email (registro) en las 4.
8. 2FA con clave `C-XXX XXX`, formateo, expiración 3h, reenvíos limitados con bloqueo local —
   en las 4 webs (loguear flujo).
9. Barra de seguridad unificada (5 segmentos, mínimo "Media") + repetir contraseña ya
   presente en todas.
10. Logs de intentos + rate limit IP en auth endpoints de las 4 webs.
11. Iconografía cabecera `[CISZU isotipo] X [isotipo web]` en login/register de las 4.

---

## 15. Checklist de implementación por web (aceptación)

- [ ] Login/registro con branding CISZU ID (§1) y cabecera de isotipos (§1.1).
- [ ] Subtítulo por web (§1.2) y footer de acciones (§3.2).
- [ ] "CONTINUAR CON:" con iconos oficiales Google/MS/Discord (§2).
- [ ] Errores de campo izquierda-alineados y no centrados (§3.1).
- [ ] Modal de preferencias locales con X, zoom y silenciar por página (§4).
- [ ] Selector idioma único + `<html lang>` + geo-language (§6.1).
- [ ] Tema único sol/luna + fix footer ciszukoantony (§6.2).
- [ ] Invitado ID persistente (§5).
- [ ] Campos con placeholder interno, requerido/opcional y botón de requisitos (§7).
- [ ] Contraseña repetida + barra de seguridad 5 segmentos, mínimo Media, pegado bloqueado
      pero autocomplete permitido (§8).
- [ ] Turnstile (gate) + reCAPTCHA por formulario con verificación server (§9).
- [ ] Pantalla verificar correo al registrarse (opcional después) (§10.1).
- [ ] 2FA clave `C-XXX XXX`, expiró 3h, reenvío ≤3, bloqueo local al 3º (§10.2).
- [ ] Registro → login; recovery por link de un solo uso + pantalla exclusiva; nueva pass no
      puede ser la antigua (§10.3 y §11).
- [ ] Logs de intentos con IP + rate limit en auth endpoints (§12).
- [ ] Storages `auth_logs` en migración con RLS por schema (§12).

---

## Referencias

- `AUTH_SYSTEM.md` — estrategia Supabase-first, migración 20, schemas por web, RLS.
- `DB_SYSTEM.md` — Drizzle, schemas ciszunetwork/ciszukoantony/ciszubot/muzicmania.
- `SECURITY_PROTOCOLS.md` — RLS obligatorio, rate limits, nunca secrets en código.
- `FRONTEND_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md` — Modal Radix (`@ciszu/ui`), Icon.
- `CDN_SYSTEM.md` — resolver de isotipos (`assetResolver.resolve`).
- `MONITORING_SYSTEM.md` — logs/observabilidad de intentos de auth.

_Última revisión: 19 ago 2026._ Relacionado: `AUTH_SYSTEM.md`, `SECURITY_PROTOCOLS.md`, `DB_SYSTEM.md`, `FRONTEND_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`.
