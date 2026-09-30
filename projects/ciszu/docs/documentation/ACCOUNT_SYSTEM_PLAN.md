# ACCOUNT_SYSTEM_PLAN — Ciclo de vida de cuentas, sanciones, roles y auth

**Versión:** 1.0.0
**Actualización:** 2026-09-30
**Identificador:** ACCOUNT_SYSTEM_PLAN_V1.0.0_2026_09_30_ciszunetwork
**Definición:** Plan maestro del sistema unificado de cuentas del ecosistema. **ESTADO:
EJECUTADO en su núcleo** — la implementación y operación vigentes viven en
`ACCOUNT_SYSTEM.md` (v1.0.0); este documento conserva los requisitos originales y las
fases, incluidas las pendientes (reclaim de correos eliminados, moderación por rango).

---

## 1. Alcance

Aplica a las 4 webs (`ciszunetwork`, `ciszubot`, `ciszukoantony`, `muzicmania`), al bot de Discord,
a la base de datos Supabase (`obwzzmbvkrcscqwptlqo`, esquema compartido `ciszunetwork` y por web) y a
la consola **devcon** (`tools/consoles/devcon.ps1` + `test/website/debug/`). No toca `TODO.md`
(solo el dueño lo edita).

## 2. Requisitos — Bloque A: verificación de registro y OTP (pendiente previo)

Estado actual (bug reportado 30 sep 2026, ciszubot): al registrarse el sistema dice "revisa tu email",
el correo nunca llega y la pantalla salta demasiado rápido al login; después el login dice que la
cuenta no existe. Se reemplaza ese flujo por:

1. **Registro** — tras pasar TODAS las validaciones (Turnstile, reCAPTCHA v2+v3, contraseña segura,
   duplicados, campos obligatorios, rate limits), si la cuenta es nueva **SIEMPRE** se exige
   verificación antes de crear la cuenta.
2. **Código modelo ciszunetwork** (`C-XXX XXX`): prefijo `C-`, 6 dígitos aleatorios, espacio central
   (ej. `C-123 434`). **Modal con 6 campos** individuales.
3. **Vigencia**: temporal, **expira en 3 h**, único por website; la UI indica si expiró.
4. **Reenvíos con límites** (timer en el mismo modal); al **3.er límite** → suspensión temporal
   local de intentos de sesión/registro.
5. Si el usuario **no** verifica → la cuenta **NO se crea**. Si verifica → cuenta creada y vinculada
   al email usado.
6. **OTP en login**: tras registrarse, cada inicio de sesión pide OTP (mismo modelo C-XXX XXX, 3 h,
   reenvíos limitados). **Desactivable** por el usuario desde configuración de cuenta.
7. **Modal opcional en el index** tras registrarse/logearse: recordar activar "recordar sesión
   30 días". Cerrable; si se ignora no tiene efecto; también activable luego en configuración.
8. **Paridad de configuración de cuenta** en las 4 webs (copiar de muzicmania, excluyendo lo
   puramente de perfil): nombre display, recordatorio OTP, notificaciones email, cambiar contraseña,
   auth, cierre de sesión segura, debug, dispositivos/sesiones. Accesible desde el header tras login.

## 3. Requisitos — Bloque B: Danger Zone y ciclo de eliminación (15 días)

### 3.1 Flujo de eliminación (configuración de cuenta → "Danger Zone")

- El usuario debe escribir: **contraseña** + **username completo repetido** + confirmación de
  **advertencia final** antes de ejecutar.
- Al eliminar: la cuenta pasa a **estado de suspensión de eliminación durante 15 días**.
  - Inmediatamente: **desindexada** (no indexación, no interacción de ningún tipo: no amistades,
    no follows, no menciones válidas).
  - La cuenta sigue existiendo y **todos los datos se guardan** (respaldados).

### 3.2 Recuperación (dentro de los 15 días)

- Si el usuario inicia sesión durante el periodo: se **detecta** el estado "eliminada" y se bloquea
  el acceso hasta confirmar la recuperación.
- El usuario debe **aceptar que no podrá volver a eliminar la cuenta durante 30 días**:
  - **Acepta** → recuperación otorgada (datos y perfil restaurados, foto anterior re-colocada).
  - **Rechaza** → no se otorga recuperación y se **desloguea**.

### 3.3 Expiración (pasados los 15 días)

- Al intentar iniciar sesión: **error** (sus contraseñas y validación fueron eliminadas).
- **Registrarse con el mismo correo**: permitido, con **disclaimer** recordando que ese correo se
  usó antes para una cuenta eliminada.

### 3.4 Arquitectura de datos (clave de la propuesta)

- **Las cuentas nunca se borran físicamente.** Eliminar = **desindexar** + **eliminar credenciales y
  validación**. Se conservan: **UUID único**, contenido subido y demás datos.
- **El correo queda vinculado al UUID para siempre** (también los OAuth). Al re-registrar con el
  mismo correo: se **reemplazan** los datos antiguos por los nuevos según lo que el usuario desee.
- Si el usuario vuelve a eliminar tras 30 días → mismo ciclo.
- **Excepción**: contenido eliminado selectivamente (p. ej. una foto no apta pedida por soporte o
  automod) sí se elimina de verdad.
- **Baneos**: el ban está vinculado al **UUID** (no solo al email). Un usuario baneado que elimina,
  espera 30 días y re-registra con el mismo email **sigue baneado** (detección por UUID y por IP).
  Sanciones temporales/permanentes, configuraciones exactas y mutes **persisten siempre**.

### 3.5 Anonimización pública al eliminar (visible en la web; respaldo en DB)

| Elemento | Público tras eliminar | En DB |
| --- | --- | --- |
| Display name | `Deleted Account` | Original respaldado |
| Username | `@deleted-account` + serie numérica gigante (nunca iguales) | Original respaldado |
| BIO / gustos / likes / redes | `esta cuenta ha sido eliminada` / vacío / oculto | Respaldo |
| Foto de perfil | Estándar (por seguridad) | Original respaldado (se re-coloca al recuperar) |
| Historiales públicos | Ocultos por seguridad | Respaldo |
| Comentarios, reviews | **Se mantienen públicos** | Sin cambios |
| Records, puntuaciones, guardados, logros | Se mantienen según la **visibilidad configurada** por el usuario | Sin cambios |

- Muzicmania (más datos públicos): ocultar/vaciar BIO, gustos, likes y campos custom.
- Cuenta eliminada: **cualquier interacción es inválida** (no agregar, seguir, etc.), sin indexación.
- Cuenta **baneada**: mismo bloqueo de interacción/indexación PERO **no se esconde nada** (todo
  público salvo eliminación selectiva). El perfil muestra **quién la baneó** (moderador/admin del
  staff, o el bot). La cuenta eliminada solo muestra "cuenta eliminada".

## 4. Requisitos — Bloque C: roles/tags globales (devcon)

- Nueva opción en **devcon**: otorgar **una** etiqueta/rol a un usuario concreto por **website**,
  identificándolo por **username completo exacto** (no multicasillas: un rol por operación).
- **Roles**: `admin`, `mod`, `owner`, `bot`, `vip`, `betatesting`, `support`.
- Los roles/tags **aparecen en el perfil** y **activan nuevas funciones** al hacer click en el perfil
  desde el header.
- **Jerarquía**:
  - `owner`, `mod`, `admin` → son **staff**: además de su tag llevan la **tag de staff**; cada uno
    tiene **panel y opciones de debug** distintas (más opciones a mayor rango). **Owner tiene todo.**
  - `bot` → **no es staff** pero **sí tiene permisos de staff**. Se otorga a cuentas bot creadas por
    cada website: `@ciszubot`, `@muzicmania`, `@ciszunetwork` (creadas por bots, **sin contraseña**,
    perfiles especiales).
  - `vip`, `betatesting`, `support` → **no son staff** (tags de comunidad).
- **Vista de staff en perfiles**: toggle de activación para eliminar o cambiar ciertas cosas desde el
  perfil, **siempre con marca** (auditoría visible).

## 5. Plan de ejecución por fases

| Fase | Contenido | Depende de |
| --- | --- | --- |
| **0** | Fix del flujo de registro actual (quitar el mensaje de email roto/pantalla fugaz); capturar estado real de `auth/2fa/*` y del modelo C-XXX XXX existente en ciszunetwork (TODO #17) para reutilizarlo | — |
| **1** | Modelo de datos: migraciones Supabase — `account_status` (active/deleted/banned/suspended), `email↔uuid` permanente, `sanctions` (tipo, motivo, autor, vigencia), `tags/roles`, auditoría de eliminación/recuperación. **RLS obligatorio en toda tabla nueva** (policies por comando, `auth.*()` envuelto en SELECT) | Fase 0 |
| **2** | API server: solicitar eliminación, estado de cuenta en login, recuperación (aceptar/rechazar 30 días), re-registro con email ligado (disclaimer), propagación de bans por UUID/IP, invalidación de credenciales a los 15 días, rate limits + BotID donde aplique | Fase 1 |
| **3** | UI: Danger Zone en configuración de cuenta (4 webs), modales de recuperación/disclaimer, modal opcional "recordar sesión 30 días" en index, verificación de registro (modal 6 campos C-XXX XXX) + OTP de login | Fase 2 |
| **4** | Anonimización pública + anti-indexación + bloqueo de interacciones (amistades/follows/menciones) para eliminadas y baneadas; tabla de ocultamiento por web (muzicmania) | Fase 2 |
| **5** | devcon: comando de roles por username exacto; paneles por rango (owner/mod/admin/bot) con debug escalado; toggle de vista staff en perfiles; cuentas bot sin contraseña | Fase 1 |
| **6** | Paridad de pestañas de configuración de cuenta en las 4 webs (sin las de perfil) + recordatorio OTP + notificaciones email + dispositivos/sesiones | Fase 3 |

## 6. Reglas de seguridad aplicables (recordatorio obligatorio)

1. RLS en toda tabla nueva, en la misma migración, policies separadas por comando, nunca `FOR ALL`,
   `auth.*()` envuelto en `(SELECT auth.X())`.
2. Rate limit en todo POST que muta o consume servicio externo (`createRateLimiter`).
3. Secretos solo en vault (`services/supabase/.env` + Bitwarden) y `process.env` server-only; nunca
   en el repo (público).
4. Datos de validación de cuentas eliminadas: eliminación efectiva SOLO a los 15 días; hasta entonces
   respaldo íntegro.
5. Toda acción de staff (banear, cambiar, eliminar selectivamente) queda **marcada** y auditada con
   autor (staff o bot).
6. Verificar con fuentes externas (dbvr, curl a producción) tras cada fase; los deploys pasan por
   GitHub Actions.

## 7. Preguntas abiertas para confirmar antes de Fase 1

1. ¿El periodo de 15 días inicia al confirmar la eliminación (sí, por defecto) y la recuperación solo
   se ofrece UNA vez por ciclo (rechazar = pierde el acceso definitivamente)? (asumido)
2. ¿El bloqueo de "no eliminar en 30 días" tras recuperar aplica también si el usuario lo intenta por
   soporte? (asumido: solo por sistema)
3. ¿Los roles `vip`/`betatesting`/`support` tienen funciones concretas definidas o solo visibilidad en
   perfil por ahora? (asumido: visibilidad + puntos de extensión)
4. ¿La detección de ban por IP requiere almacenamiento de IP por cuenta (política de privacidad) o se
   consulta el historial de sanciones existente? (asumido: historial existente)

---

_Última revisión: 2026-09-30._ Relacionado: `AUTH_SYSTEM.md`, `LOGIN_REGISTER_PROTOCOLS.md`,
`DB_SYSTEM.md`, `SECURITY_PROTOCOLS.md`, `STAFF_SYSTEM.md`, `EMPLOYEES_SYSTEM.md`, `CUSTOMERS_SYSTEM.md`,
`DEV_CONSOLE_SYSTEM.md`, `PROJECT_STATE.md`, `TODO.md` (solo lectura), `STATIC_MIGRATION_PLAN.md`.
