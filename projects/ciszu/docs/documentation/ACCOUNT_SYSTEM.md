# ACCOUNT_SYSTEM — Ciclo de vida de cuentas, verificación, sanciones y roles

**Versión:** 1.0.0
**Actualización:** 2026-09-30
**Identificador:** ACCOUNT_SYSTEM_V1.0.0_2026_09_30_ciszunetwork
**Definición:** Sistema unificado de cuentas del ecosistema (CISZU ID): registro con
verificación obligatoria C-XXX XXX, OTP de acceso, sesiones recordadas por dispositivo,
configuración de cuenta compartida, Danger Zone con ciclo de eliminación de 15 días,
sanciones ligadas al UUID, roles/tags globales por web y cuentas bot. Aplica a las 4 webs
(`ciszunetwork`, `ciszubot`, `ciszukoantony`, `muzicmania`).

---

## 1. Alcance y arquitectura

- **Backend de identidad**: Supabase Auth del proyecto `obwzzmbvkrcscqwptlqo` (un solo
  proyecto para las 4 webs; cada web opera su schema de datos).
- **Fuente de datos de cuenta**: `auth.users` (identidad), `public.user_roles`,
  `public.sanctions`, `public.account_deletions` (+ vista `public.account_public_status`),
  `public.two_factor_codes` y `public.two_factor_settings` (OTP por web), y los `profiles`
  de cada schema web.
- **Rutas API comunes** (una copia por web, mismo contrato): `/api/auth/2fa/*`,
  `/api/auth/register/complete`, `/api/auth/account/delete-request`,
  `/api/auth/account/recovery`. Todas protegidas con **BotID** (`initBotId` + `checkBotId`).
- **UI compartida** (`@ciszu/ui`): `RecaptchaGate` (v2+v3), `TwoFactorGate`/`AuthCodePanel`
  (C-XXX XXX), `RememberSessionPrompt`, `AccountSettingsPanel`.

## 2. Registro y verificación obligatoria (C-XXX XXX)

1. El formulario valida Turnstile/Cloudflare, reCAPTCHA v2+v3, contraseña segura,
   términos, campos obligatorios y duplicados.
2. Se crea el usuario **sin confirmar** y se envía el código **C-XXX XXX** por email con
   marca (el envío usa el servicio 2FA compartido de `@ciszunetwork/utils`).
3. La sesión se cierra de inmediato y aparece el **modal de 6 campos**
   (`TwoFactorGate` con `force`): temporizador de vigencia, expiración indicada,
   reenvíos con **límites** y **suspensión temporal al 3.er límite**, cancelable.
4. Al verificar: `POST /api/auth/register/complete` confirma el email (admin, vía
   `SUPABASE_SERVICE_ROLE_KEY`) y **activa el OTP de esa web**; el usuario inicia sesión
   y entra.
5. **Sin verificación la cuenta NO existe de forma utilizable**: queda sin confirmar y
   el login es imposible.
6. **Regla de los códigos**: temporales, **expiran en 3 horas**, **únicos por website**
   (la clave del registro 2FA incluye `website`), con intentos y reenvíos limitados.

## 3. OTP de acceso y configuración

- En cada login, si el OTP está activo en esa web, `TwoFactorGate` pide el código C-XXX XXX
  antes de dar la sesión por válida (el login consulta `/api/auth/2fa/status`).
- El usuario puede **desactivar el OTP** desde la configuración de su cuenta
  (`/api/auth/2fa/disable`); reactivarlo exige verificar un código nuevo
  (`/api/auth/2fa/enable`, que llama a `verify` antes de activar).

## 4. Recordar sesión (por dispositivo)

- Las sesiones expiran por configuración de Supabase Auth (aprox. 7 días por web).
  El sistema de "recordar" controla la **persistencia en el dispositivo**:
  - Activado → la sesión se guarda en `localStorage` (sobrevive apagados/reinicios).
  - Por defecto → `sessionStorage` (se pierde al cerrar el navegador); los tokens
    existentes migran al almacén elegido al cambiar la preferencia.
- Clave por website: `ciszu-remember-session:<site>`; el cliente Supabase de cada web usa
  `createRememberStorage(site)`.
- **Modal opcional** en el index tras registrarse o loguearse (`RememberSessionPrompt`):
  "Sí, recordar" / "Ahora no" / cerrar. Ignorarlo no decide nada. También se activa desde
  la configuración de la cuenta.

## 5. Configuración de cuenta (paridad en las 4 webs)

La página `/settings` de cada web monta `AccountSettingsPanel`:

| Sección | Qué hace |
| --- | --- |
| Perfil | Cambiar nombre display (`user_metadata.display_name`). |
| Seguridad | Cambiar contraseña (re-autenticación previa) y activar/desactivar OTP. |
| Sesión | Activar "recordar", cerrar sesión y **cerrar TODAS las sesiones** (`signOut` global). |
| Notificaciones | Emails de cuenta y recordatorio de OTP (metadata). |
| Debug | Datos de cuenta para soporte; muestra el **rol** en esa web y el **toggle de vista de staff** (owner/admin/mod/bot, con nota de auditoría). |
| Danger Zone | Eliminación de cuenta (ver §6). |

Muzicmania conserva además su propia configuración de perfil (bio, avatar…);
el panel de cuenta es común y no elimina ninguna opción previa.

## 6. Danger Zone — ciclo de eliminación (15 días)

### 6.1 Solicitud

`POST /api/auth/account/delete-request` exige **contraseña** (re-autenticación
server-side), **username completo exacto** y la palabra **ELIMINAR**. Errores claros por
campo. Si se recuperó la cuenta hace menos de **30 días**, la eliminación se **bloquea**.

### 6.2 Estado de suspensión (15 días)

- La cuenta pasa a `account_deletions.status='pending'` con `expires_at = now + 15 días`.
- **Desindexación y anonimización pública**: `display_name = "Deleted Account"`,
  `username = deleted-account-<12 dígitos aleatorios>`, bio reemplazada por
  "Esta cuenta ha sido eliminada.", **foto estándar**, historiales ocultos; comentarios,
  reviews y logros/puntuaciones se mantienen según la visibilidad del usuario.
- **Respaldo íntegro** en `account_deletions.backup` (privado, RLS solo dueño).
- Interacciones invalidadas (no amistades/follows) y sin indexación.

### 6.3 Recuperación

Al iniciar sesión se detecta el estado (`account_deletions` propia vía RLS) y **se bloquea**
hasta confirmar: `POST /api/auth/account/recovery { accept: true }` restaura el respaldo y
fija **`no_delete_until = now + 30 días`** (no podrá volver a eliminarla en ese plazo).
**Rechazar** no otorga la recuperación y cierra la sesión.

### 6.4 Expiración (pasados los 15 días)

El workflow **`finalize-deletions.yml`** (cron diario) ejecuta
`scripts/finalize-deletions.js`: invalida credenciales y validación (bcrypt aleatorio +
email sin confirmar) y marca `status='expired'`. Al iniciar sesión con la contraseña
antigua el acceso falla. **El UUID, el correo, el contenido y el respaldo permanecen**:
el correo queda vinculado al UUID para siempre.

### 6.5 Re-registro con un correo eliminado

- Política aprobada: se podrá crear una cuenta nueva con ese correo, **con disclaimer**
  recordando que antes perteneció a una cuenta eliminada, reemplazando los datos según
  lo que el usuario decida. *(Endpoint de reclaim pendiente de la siguiente fase; el
  vínculo email↔UUID ya existe en datos para implementarlo sin migración.)*
- **Baneados**: el ban vive en el UUID (tabla `sanctions`); aunque la cuenta se elimine y
  se intente re-registrar el mismo correo, **el ban persiste** (y por IP cuando aplique).
  Otras sanciones/mutes también permanecen.

## 7. Sanciones y perfiles

- `public.sanctions` (lectura pública): `type` (`ban`/`mute`/`warning`), `scope`, `reason`,
  `actor` (`staff:<nombre>` o `bot`), `created_at`, `expires_at` (NULL = permanente).
- El perfil muestra **"Baneado por <autor>"** si hay un ban activo, o
  **"Cuenta eliminada"** (vista `account_public_status`) si está en ciclo de eliminación.
- Comentarios/reviews se mantienen públicos; lo personal (bio, gustos, historial) se
  oculta solo en eliminaciones.

## 7.5. Privacidad del perfil (visibility)

- `public.account_privacy` (por usuario): `visibility` = `public` (por defecto) | `friends` |
  `private` (+ `sections` jsonb reservado para restricciones por sector). Lectura pública del
  nivel; escritura solo service-role vía `/api/auth/account/privacy` (sesión + BotID).
- Efecto: en `friends`/`private` los datos **detallados** (records, historial, logros,
  amistades, comentarios) se limitan; los datos **básicos** (nombre, foto, bio) siguen
  visibles. Aplicado especialmente al perfil público de muzicmania (aviso "Perfil privado /
  para amigos").
- El modo `friends` quedará plenamente operativo cuando exista el sistema de
  amistades/seguidores; hasta entonces solo el dueño ve el detalle.

## 8. Roles y tags (globales por website)
- `public.user_roles`: **un rol por usuario y web** (`owner`, `admin`, `mod`, `bot`, `vip`,
  `betatesting`, `support`), `granted_by` y fecha. Lectura pública para tags de perfil;
  escritura solo service-role/Management API.
- **Staff**: `owner`, `admin`, `mod` llevan además la tag **STAFF** en el perfil. `bot` no
  es staff pero **tiene permisos de staff**; `vip`, `betatesting`, `support` no son staff.
- Los tags aparecen en el perfil (p. ej. muzicmania) y habilitan paneles/debug por rango
  (a mayor rango, más opciones; owner tiene todo). El toggle de "vista de staff" en
  perfiles queda marcado/auditado.
- **Cuentas bot**: `@ciszubot`, `@muzicmania`, `@ciszunetwork` creadas por
  `scripts/bot-accounts.js` (password aleatoria desconocida — nadie puede iniciar sesión
  con ellas), email interno `bot+<username>@ciszunetwork.com` y rol `bot` en su web.

## 9. Operación (scripts y consolas)

| Herramienta | Uso |
| --- | --- |
| `scripts/apply-migration-47..50.js` | Migraciones del sistema (tablas/RLS y fixes). |
| `scripts/finalize-deletions.js` | Finaliza eliminaciones vencidas (cron diario). |
| `scripts/roles.js` | `list [web]` · `grant <web> <username> <rol> [actor]` · `revoke <web> <username>`. |
| `scripts/bot-accounts.js` | Crea/actualiza las cuentas bot y su rol. |
| devcon (`test/website/debug/dev_console.ps1`) | Sección **ROLES / ETIQUETAS**: otorgar (web + username exacto + rol), quitar, listar. Registra `actor` en el log de auditoría. |

## 10. Seguridad (RLS y límites)

- `user_roles` y `sanctions`: SELECT público; sin policies de escritura (service-role).
- `account_deletions`: SELECT solo del dueño (`(SELECT auth.uid()) = user_id`); el respaldo
  nunca es legible por terceros; la vista pública expone únicamente
  `user_id, status, requested_at, expires_at, no_delete_until`.
- Todas las rutas mutadoras: BotID + rate limiting existente; la eliminación exige
  re-autenticación y doble confirmación.

## 11. Retención de datos (referencia para textos legales)

- Eliminar una cuenta **no borra** los datos: suspende el acceso público 15 días y conserva
  todo con respaldo. Pasados los 15 días se eliminan **credenciales y validación**, pero
  el UUID, el correo, el contenido y las sanciones permanecen vinculados.
- La eliminación **real** de contenido solo ocurre por borrado selectivo (soporte, automod
  o petición expresa sobre contenido específico).
- Los datos "no personales" (records, puntuaciones, guardados, logros) pueden permanecer
  visibles según la configuración de visibilidad del usuario.

## 12. Estado y pendientes declarados

- **Implementado**: §2–§4, §6.1–§6.4, §7 (visualización de ban/eliminada en perfil), §8–§10.
- **Implementado también**: endpoint de **reclaim** (re-registro de correo eliminado con
  disclaimer), anonimización por web (metadata + perfil: nombre/usuario/avatar con respaldo
  y restauración), **privacidad de perfil** (public/friends/private) y **detección de ban
  por IP** (`banned_ips` + `sanctions.ip`; guardia en register y reclaim).
- **Pendiente de siguiente fase**: acciones de moderación completas por rango (hoy:
  visualización + toggle con auditoría), sistema de amistades/seguidores (habilita del todo
  el modo `friends`) y perfiles públicos en las demás webs.

---

_Última revisión: 2026-09-30._ Relacionado: `ACCOUNT_SYSTEM_PLAN.md` (plan y requisitos originales),
`AUTH_SYSTEM.md`, `LOGIN_REGISTER_PROTOCOLS.md`, `DB_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`STAFF_SYSTEM.md`, `EMPLOYEES_SYSTEM.md`, `DEV_CONSOLE_SYSTEM.md`, `TODO.md` (solo lectura).
