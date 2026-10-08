# ADMIN_PROTOCOLS — Normas de administración, jerarquía y accesos del staff

**Versión:** 1.0.0
**Actualización:** 2026-10-09
**Identificador:** ADMIN_PROTOCOLS_V1.0.0_2026_10_09_ciszunetwork
**Definición:** protocolo obligatorio para el personal con mando (owner, dirección, gerencia,
administración): jerarquía de rangos, accesos a las consolas, matriz de permisos, subcargos
por proyecto, step-up, deberes y prohibiciones. Aplica a las consolas y a las acciones con
service_role.

---

## 1. Alcance

- **Consolas**: devcon (operación técnica y de ecosistema), staffcon (empleados), customerscon
  (clientes). Ver `CONSOLE_SECURITY_SYSTEM.md` (OTP por email, sesiones de 60 min, internet
  obligatorio, cierre remoto).
- **Webs**: acciones de staff sobre cuentas, roles/etiquetas (`user_roles`) y contenido.
- **Infraestructura**: deploys, CI, BD (service_role), secrets y kill switches.

## 2. Jerarquía y niveles

Los rangos viven en `archives/staff/data/staff.json` (`roles`, `empleados`). Nivel **menor =
más autoridad**; un rango solo gestiona rangos de nivel **mayor** (nunca igual o superior).

| Nivel | Rangos | Autoridad |
| --- | --- | --- |
| 0 | CEO (Ciszuko Antony) | Absoluta; único intocable |
| 1 | CTO · CCO · COO · CMO · CFO | Dirección de área |
| 2 | Gerentes | Su área/proyecto: crear/quitar/rangos |
| 3 | Supervisores | Equipo diario: crear/gestionar rangos inferiores |
| 4 | Administradores · RecursosHumanos | Corrección de datos; sin crear/quitar |
| 5 | Ciberseguridad · DevOps | Seguridad, CI/CD, infraestructura |
| 6 | Desarrolladores · UIUX · Diseñadores | Implementación |
| 7 | CommunityManagers · SoporteTecnico | Comunidad y soporte |
| 8 | Moderadores | Moderación (`MODERATION_PROTOCOLS.md`) |
| 9 | Betatesters | Pruebas; mínimo acceso |

**Accesos a consolas** (`org.accesos`): `devcon` ≤ 6, `customerscon` ≤ 7, `staffcon` ≤ 9.
En cada consola: contraseña de consola + **identidad (ID de empresa)** + **OTP al correo** +
sesión de 60 min + internet obligatorio.

## 3. Subcargos por proyecto (multiequipables)

- El rango global puede estar **acotado por proyecto** (`empleados[].subcargos`): p. ej.
  admin **solo** de `ciszubot`, betatester **solo** de `muzicmania`. `"*"` = todos (CEO).
- **Enforcement (opción D)**: las acciones con alcance de proyecto (deploy, cuentas de testing,
  roles/etiquetas) muestran las opciones con etiqueta `SIN PERMISO` y **deniegan** al ejecutar.
- Un admin de `ciszukoantony` solo gestiona perfiles/roles de `ciszukoantony`; para tocar otro
  proyecto necesita subcargo allí.

## 4. Matriz de permisos (resumen)

| Acción | Nivel mínimo | Notas |
| --- | --- | --- |
| Ver resúmenes y listados | 9 (según consola) | Solo lectura |
| Modificar datos de rangos inferiores | 4 | Con auditoría |
| Moderar (warn/mute/delete contenido) | 8 | Ver `MODERATION_PROTOCOLS.md` |
| Ban temporal / ip_ban / revoke_sessions | 4 | Con step-up; nunca al owner |
| Otorgar/quitar roles por web | 2 (según subcargo) | `user_roles`; auditado |
| Crear/quitar empleados y rangos | 3/2 | Jerarquía estricta |
| Deploy a producción | 6 (DevOps/Dev en su proyecto) | Con subcargo por web |
| Kill switch de sitios | 4 | Solo admin/owner; con nota |
| Eliminar cuentas (sistema/staff) | 0 | Solo owner/sistema; no apelable |
| Crear proyectos (devcon) | 0 | Solo owner |
| Acceso al vault/secretos | — | Por referencia (nunca por valor) |

## 5. Step-up (elevación temporal)

- Las acciones sensibles (bans, borrados, control de sitios, cambios de roles) exigen una
  **sesión de elevación** generada en la devcon (`staff_elevations`) y firmada con
  `STAFF_ELEVATION_SECRET`; dura **45 min** y queda auditada.
- Sin step-up vigente, la acción se rechaza aunque el rango la permita.

## 6. Deberes del staff con mando

1. **Auditar**: toda acción relevante deja rastro (`moderation_actions`, logs de consola,
   `logAudit` de las webs). Si no está registrado, no se hizo.
2. **Proteger secretos**: nunca imprimir, commitear ni compartir tokens; usar el vault
   (`VAULT_SYSTEM.md`) y `SECRET_TEMP.env` como puente.
3. **Respetar el repo público**: nada de datos personales ni credenciales en commits/docs.
4. **Documentar**: los cambios de sistema se reflejan en su `_SYSTEM` correspondiente.
5. **Coordinar** (multiagente): locking por archivo, no sobrescribir trabajo en caliente,
   preguntar antes de borrar (`AGENTS.md` §6.9).
6. **Apelaciones**: resolverlas en ≤72 h (`MODERATION_PROTOCOLS.md` §7).

## 7. Prohibiciones

- Sancionar/moderar sin evidencia o por conflicto personal.
- Tocar cuentas de rango igual/superior (el owner es **intocable**; ni entre admins).
- Compartir la contraseña de consola, la identidad o los OTP.
- Ejecutar deploys o cambios de BD fuera del flujo (CI/deploy workflows).
- Desactivar RLS, saltarse rate limits o exponer el schema interno.
- Usar el vault o los secretos de un empleado desde otra máquina/persona.

## 8. Incidentes y escalado

- **Incidente de seguridad** (cuenta comprometida, fuga, abuso): contener (revoke_sessions,
  kill switch si aplica) → notificar al owner → registrar en el registro de incidentes
  (`CIBERSECURITY_SYSTEM.md`).
- **Conflicto entre rangos**: decide el superior común; en empate, el owner.
- **Duda sobre permisos**: no ejecutar; consultar al owner.

## 9. Relación con otros sistemas

- `CONSOLE_SECURITY_SYSTEM.md` — OTP, sesiones, internet, cierre remoto de consolas.
- `MODERATION_PROTOCOLS.md` — sanciones y apelaciones.
- `STAFF_SYSTEM.md` / `EMPLOYEES_SYSTEM.md` — datos de staff, cargos y subcargos.
- `SECURITY_PROTOCOLS.md` / `DEVSECOPS_SYSTEM.md` / `VAULT_SYSTEM.md` — seguridad y secretos.
- `ANTICHEAT_SYSTEM.md` — sanciones automáticas y strikes.
- `ACCOUNT_SYSTEM.md` — cuentas, roles (`user_roles`) y eliminación.

_Última revisión: 09 oct 2026._ Relacionado: `CONSOLE_SECURITY_SYSTEM.md`,
`MODERATION_PROTOCOLS.md`, `STAFF_SYSTEM.md`, `EMPLOYEES_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `ANTICHEAT_SYSTEM.md`.
