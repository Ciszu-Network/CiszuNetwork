# CONSOLE_SECURITY_SYSTEM — Seguridad de las consolas (auth OTP, sesiones, testing, proyectos)

**Versión:** 1.0.0
**Actualización:** 2026-10-06
**Identificador:** CONSOLE_SECURITY_SYSTEM_V1.0.0_2026_10_06_ciszunetwork
**Definición:** seguridad compartida de las 3 consolas internas (devcon, staffcon, customerscon):
autenticación por OTP al correo del staff, sesiones de 60 min con cierre automático, registro de
sesiones activas con cierre remoto, obligación de internet, cuentas de testing y registro de
proyectos. Usa el schema `internal` de Supabase (solo personal).

---

## 1. Componentes

| Pieza | Ruta | Qué hace |
| --- | --- | --- |
| Schema interno | `services/supabase/migrations/20261007000001_internal_console_security.sql` | Tablas `otp_codes`, `sessions`, `testing_accounts`, `projects` (schema `internal`, sin acceso anon/authenticated) |
| Guardia (PS) | `tools/consoles/console-guard.ps1` | Funciones compartidas que las 3 consolas dot-sourcean |
| CLI (Node/tsx) | `scripts/console-guard.mts` | OTP, sesiones, testing y proyectos (SQL vía Management API + email) |

Las consolas cargan la guardia con:

```powershell
. (Join-Path $root 'tools\consoles\console-guard.ps1')
```

## 2. Internet obligatorio

`Assert-ConsoleOnline` comprueba conectividad (Management API) **antes de la contraseña** de cada
consola. Sin internet no hay acceso (se necesita para auth, sesiones, BD). Error claro y cierre.

## 3. Autenticación por OTP (inverso al de las webs)

En las webs, entrar al perfil de un staff exige una clave generada desde la devcon. En las
consolas el proceso es **al revés y más estricto**:

1. Tras elegir “quién eres” (identidad), se genera una clave **`CZ-XXXXXX`** temporal (nunca se
   guarda en env/vault; hash en `internal.otp_codes`) y se **envía por email** al correo vinculado
   del staff (obligatorio; si falta se usa `ciszunetwork@gmail.com`).
2. El usuario introduce la clave en la consola (`auth-verify`); caduca a los 10 min, 5 intentos y
   un solo uso.
3. Sin clave válida, la consola **no deja entrar al perfil** y se cierra.

Subcomandos: `auth-send`, `auth-verify`. El correo se muestra enmascarado (`ci***@outlook.com`) y
el código nunca se imprime.

## 4. Sesiones de 60 minutos

- `session-open` registra la sesión en `internal.sessions` (60 min por defecto).
- `Assert-ConsoleAlive` cierra el proceso (exit 77) al cumplirse los 60 min **sin avisar antes**:
  primero mata la consola y luego informa que la sesión terminó.
- `Read-KeyGuarded` sustituye a `[Console]::ReadKey` en los menús: verifica el tiempo restante en
  cada espera (funciona incluso si el usuario no toca el teclado).
- **Mi perfil** muestra el tiempo restante (min de 60) y los subcargos.

## 5. Sesiones activas + cierre remoto

- `session-list` lista las sesiones activas (id, staff, consola, actor, expiración).
- `session-revoke` cierra remotamente. Jerarquía: **owner (CEO, nivel 0)** puede todo; **admin
  (nivel ≤ 4)** puede cerrar sesiones de otros, pero **nunca la del owner** (`DENIED_OWNER`);
  niveles superiores (equipo) no pueden cerrar sesiones (`DENIED`).
- En cada consola: opción **“Sesiones activas (cerrar remotamente)”**.

## 6. Cuentas de testing (devcon)

Opción **TESTING ACCOUNTS** (devcon). Cuentas temporales de prueba (no perfiles reales):

- **Crear**: se eligen websites (multicasillas), duración obligatoria (10 min – 1 mes, por defecto
  10) y opcionalmente un email. Se generan **ID propio** (`TA-0001`…), usuario y contraseña.
  Si hay email, la cuenta sigue el flujo normal (OTP); si no, se crea sin OTP.
- **Resumen**: lista las cuentas con estado, webs, autor y caducidad (nunca muestra datos reales).
- **Modificar**: email, duración, clave, username, display name, banear/desbanear, eliminar por
  completo (destructivo, con advertencia y confirmación). Correo e email pueden repetir cuentas
  existentes (son secundarias de testeo).
- **Eliminar**: borra el rastro por completo (a diferencia de una cuenta real, que se conserva).

## 7. Registro de proyectos (solo owner)

Opción **PROYECTOS (owner)** (devcon). Registra/enlista proyectos (metadatos estilo staff/customers):

- **Crear**: nombre + carpeta (autogenerada si se omite) → crea la plantilla de la devcon
  (`README.devcon.md`, `devcon.meta.json`) en `archives/projects/<carpeta>/` y lo registra.
- **Enlazar**: como crear pero sin recrear la carpeta (solo escribe los archivos de enlace).
- **Desenlazar**: elimina **ÚNICAMENTE los archivos creados por la devcon** (nunca el proyecto
  real); la carpeta se borra solo si queda vacía. Es “la contra” del enlace.
- **Resumen/listar**: estado, carpeta, autor y fecha.

Solo el **owner (CEO)** puede ejecutarlo; otros niveles reciben `DENIED`.

## 8. Subcargos por proyecto (alcance del rango)

A partir de ahora el rango de un staff puede estar acotado a proyectos:

- `staff.json` → cada empleado puede llevar `subcargos` (map `proyecto → [cargos]`). `"*"` = todos
  los proyectos (el CEO). Ejemplos actuales:
  - `CZ-001` → `{ "*": ["CEO"] }` (todos los proyectos).
  - `CZ-002` (Rafael) → `{ "muzicmania": ["Betatesters"] }` (solo Muzicmania).
- Son **multiequipables**: si están todos, son todos los subcargos.
- Los customers también llevan `proyecto` (los 2 reales son de `ciszunetwork`).

### Estado de la Fase 2 (pendiente)

La **enforcement** completa de permisos por proyecto (deploy/gestión limitada al proyecto del
subcargo, etiquetas por web, subdivisión de carpetas `archives/staff/<proyecto>/…` y
`archives/customers/<proyecto>/…`) queda como **siguiente paso** (ver `TODO.md`): el modelo de datos
y la visualización ya están listos; falta aplicar filtros por proyecto en cada acción de las
consolas y reflejar los subcargos en las etiquetas de perfil de las websites.

## 9. Relación con otros sistemas

- `DEV_CONSOLE_SYSTEM.md` — consola principal (usa esta guardia).
- `STAFF_SYSTEM.md` / `EMPLOYEES_SYSTEM.md` — datos de staff y rangos (origen de `subcargos`).
- `EMAILS_SYSTEM.md` — transporte de los OTP (Gmail/Resend del sistema).
- `SECURITY_PROTOCOLS.md` — reglas de seguridad generales.
- `DB_SYSTEM.md` — el schema `internal` no se expone por PostgREST; solo servicio.

_Última revisión: 06 oct 2026._ Relacionado: `DEV_CONSOLE_SYSTEM.md`, `STAFF_SYSTEM.md`,
`EMAILS_SYSTEM.md`, `TODO.md`.