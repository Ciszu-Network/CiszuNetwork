# ACCESS_CONTROL_SYSTEM

> **Versión**: 1.0
> **Actualización**: 09 oct 2026
> **Identificador**: ACCESS_CONTROL_SYSTEM
> **Definición**: Modelo de autorización del ecosistema: identidad de staff, niveles, umbrales por consola, enforcement server-side, auditoría y gobernanza de acceso (GitHub, envs, notificaciones).

---

## 1. Principios

1. **Autoridad server-side**: ningún permiso crítico depende de archivos locales. La fuente de
   verdad de rangos, subcargos y umbrales vive en la base de datos (`internal.*` de Supabase).
2. **Deny-by-default**: sin fila en DB ⇒ nivel 99 (sin acceso). Sin umbral para un scope ⇒
   denegado. Sin usuario ⇒ lectura/escritura de ntfy denegadas.
3. **Least privilege**: cada rol recibe el mínimo; los scoped envs no llevan secretos de
   producción; el contratista trabaja por PR y nunca ve el vault.
4. **Trazabilidad**: toda acción sensible queda en `internal.staff_audit` (actor real, no
   falsificable desde el cliente) y todo cambio de código pasa por PR + CI.
5. **Separación de canales**: los secretos viven en el vault cifrado (`services/supabase/.env`
   + `.env.age`); el código solo referencia nombres (`process.env.X`).

## 2. Modelo de identidad (DB)

| Tabla (`internal`) | Qué guarda |
| --- | --- |
| `staff` | Empleados reales: `staff_id` (CZ-XXX), nombre, correo, cargo, cargos, subcargos, **nivel**, permisos, estado |
| `console_access` | Umbral por consola: `staffcon ≤ 4`, `devcon ≤ 6`, `customerscon ≤ 7` (nivel menor = mayor rango) |
| `staff_audit` | Auditoría: otp_verified, session_open/deny/revoke, staff_sync, level/subcargos_local_fallback, staff_upsert |
| `sessions` / `otp_codes` | Sesiones de consola (60 min por defecto) y OTP por email |
| `testing_accounts` / `projects` | Cuentas de prueba y registro de proyectos |
| `external_accounts` | Cuentas de servicios externos por staff (ntfy, tailscale, github, vercel, …) con **secreto cifrado AES-256-GCM** (clave `ACCOUNTS_ENC_KEY` en el vault) |

Rangos (staff.json → `roles`): CEO 0 · C-level 1 · Gerentes 2 · Supervisores 3 · Administradores
4 · RRHH 4 · Ciberseguridad/DevOps 5 · Desarrollo/Diseño/QA 6 · Community/Soporte 7 ·
Moderadores 8 · Betatesters 9.

## 3. Flujo de las consolas

1. La consola pide identidad y **OTP** por email (`console-guard auth-send/verify`).
2. `session-open` valida en DB: nivel del staff (`staff.nivel`, estado activo) **y** umbral del
   scope (`console_access`). Si falla ⇒ `DENIED_ACCESS` + fila `session_denied` en auditoría.
3. Los comandos sensibles (`testing-*`, `projects-*`, `session-revoke`) re-validan nivel contra
   DB en cada invocación (≤4 / owner para proyectos).
4. `can`/`subcargos` responden con los subcargos **de DB** (proyectos permitidos por staff).
5. Si la DB no responde, hay fallback a `staff.json` **solo como resiliencia** y queda auditado
   (`*_local_fallback`) — nunca silencioso.

## 4. Sincronización (staff.json ya NO es autoridad)

- `staff-sync` (guard): upserta `staff` + `console_access` desde `staff.json`. Solo el owner
  (nivel 0) puede ejecutarlo.
- **Hook automático**: `staffcon.js` dispara `staff-sync` tras cada guardado (no bloqueante).
  Si el actor no es owner, la DB queda intacta (fail-safe) y el owner puede sincronizar luego.
- `archives/staff/**` pasa a ser **export/vista** para reportes y carpetas generadas.

## 5. Envs scopeados (reparto selectivo)

`services/supabase/scoped/<proyecto>/<rol>.env` (detalle en `VAULT_SYSTEM.md`): solo valores
públicos + placeholders; jamás service keys, `DATABASE_URL`, `VERCEL_TOKEN`,
`SUPABASE_ACCESS_TOKEN`, `GOOGLE_OAUTH_*` ni el vault. Deploys siempre por PR + CI: nadie
necesita credenciales de producción en su máquina.

## 6. Gobernanza GitHub

- `main` protegida: PR + 1 aprobación + **CODEOWNERS** + CI verde + conversaciones resueltas;
  force-push y borrado bloqueados. Bypass únicamente para la cuenta del owner.
- Colaboradores/contratistas: rama o fork + PR; nunca push directo ni secretos. Deploys solo
  desde `main` (los PRs de forks no reciben secretos).
- Team `ciszubot-admins` (Org `Ciszu-Network`) listo para el admin exclusivo de ciszubot.
- Guard de repo público (`repo-guard.yml`): bloquea `archives/`, `tools/`, `scripts/`,
  `clones/`, `services/` y `.env*` trackeados.

## 7. Notificaciones (privacidad)

- Canal operativo: ntfy.sh con topic rotado (`CZ-ntfytask-<32 dígitos>`, vault) y política de
  no enviar información sensible. Reserva + token = publicación solo del owner.
- Canal único: **ntfy.sh** con reserva del topic (publicación solo del owner vía `NOTIFY_TOKEN`)
  y política de contenido estricta (nunca datos sensibles). El self-hosted quedó **descartado por
  decisión** (sin dependencia del PC). Ver `NTFY_SYSTEM.md`.

## 8. Cuentas externas por staff (staffcon `accounts`)

- Tabla `internal.external_accounts`: id, staff, servicio, identificador, secreto cifrado
  (AES-256-GCM), estado, quién la creó/revocó y cuándo. Deny-all: solo service_role.
- Comandos (guard): `accounts-add --by CZ-XXX --staff CZ-YYY --service ntfy --identifier X [--secret S] [--note] `,
  `accounts-list [--staff] [--service]`, `accounts-revoke --id N --by`, y `accounts-reveal --id N --by`
  (**solo owner**, queda auditado).
- En staffcon: acción `accounts list|add|reveal|revoke ...` (valida actor y nivel ≤4; reveal solo owner).
- La contraseña nunca se muestra en listados; solo `reveal` la descifra bajo auditoría.

## 9. Roadmap

- Tokens de publicación por rol cuando el staff necesite emitir avisos (ntfy.sh).
- Vercel Project Members + Mega selectivo por carpeta (al entrar personal).
- Cuentas externas por staff: extender `accounts` a más servicios y flujo interactivo completo en la consola.

---

_Última revisión: 09 oct 2026._ Relacionados: `SECURITY_PROTOCOLS.md`, `STAFF_SYSTEM.md`,
`VAULT_SYSTEM.md`, `NTFY_SYSTEM.md`, `REMOTE_CONTROL_SYSTEM.md`, `CONSOLE_SECURITY_SYSTEM.md`.
