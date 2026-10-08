# MODERATION_PROTOCOLS — Normas de moderación y sanciones del ecosistema

**Versión:** 1.0.0
**Actualización:** 2026-10-09
**Identificador:** MODERATION_PROTOCOLS_V1.0.0_2026_10_09_ciszunetwork
**Definición:** protocolo obligatorio de moderación para las 4 webs y las consolas internas:
qué se sanciona, con qué herramientas, cómo se escala, cómo se registra y cómo se apela.
Aplica a sanciones **manuales** (staff) y **automáticas** (Ciszu Anti-Cheat).

---

## 1. Alcance

- **Wes**: ciszunetwork, ciszubot, ciszukoantony, muzicmania (perfiles, chats/foros, reseñas,
  comentarios, tickets y comunidad).
- **Consolas**: devcon (secciones `GESTIÓN DE USUARIOS` y `CONTROL DE SITIOS`), staffcon y
  customerscon según permisos.
- **Sistema automático**: Ciszu Anti-Cheat (`ANTICHEAT_SYSTEM.md`), que genera señales,
  sanciones y strikes.

## 2. Principios

1. **Proporcionalidad** — la sanción mínima suficiente; nunca la máxima "por si acaso".
2. **Evidencia** — toda sanción manual necesita motivo concreto y, cuando exista, referencia
   (mensaje, reseña, partida, captura, señal del anticheat).
3. **Trazabilidad** — toda acción queda en `public.moderation_actions` con actor, objetivo,
   acción y detalle. Sin registro no se considera aplicada.
4. **Apelación** — toda sanción (manual o automática) es apelable desde Soporte, salvo la
   eliminación no-manual (la tomó el sistema/staff, no el usuario).
5. **Mínima exposición** — al usuario se le comunica lo justo; los detalles internos y las
   señales del anticheat no se revelan (evita enseñar cómo evadir).
6. **Nunca por represalia** — prohibido sancionar por opiniones legítimas, críticas o disputas
   personales con el staff.

## 3. Herramientas y datos

| Recurso | Qué es | Dónde |
| --- | --- | --- |
| `public.sanctions` | Sanciones **manuales/live** (type, scope, reason, actor, expires_at, ip) | BD global |
| `anticheat.sanctions` | Sanciones **automáticas** del anticheat (`signal_ids`, `issued_by`) | Schema interno |
| `public.moderation_actions` | Auditoría de cada acción del staff (ban, mute, warn, ip_ban, delete_post…) | BD global |
| `public.user_roles` | Rol por web (`owner`, `admin`, `mod`, `bot`) | BD global |
| `public.staff_elevations` / step-up | Elevación temporal para acciones sensibles | devcon |
| `public.sanction_appeals` | Apelaciones (estados `open → reviewing → accepted | rejected`) | BD global |
| Kill switch de sitios | Bloqueo global de una web por incidente | devcon `CONTROL DE SITIOS` |

## 4. Tipos de sanción (manuales)

| Tipo | Alcance | Duración típica | Cuándo |
| --- | --- | --- | --- |
| `warn` | Cuenta | — (histórico) | Primera falta leve |
| `mute` | Cuenta (chat/comunidad) | 1 h – 7 días | Spam, provocación reiterada |
| `ban` | Cuenta (por web o global) | 7 días – permanente | Faltas graves o reincidencia |
| `ip_ban` | IP (con cautela) | según caso | Evasión de ban, ataques |
| `delete_review` / `delete_post` | Contenido | permanente | Contenido ilegal/ofensivo/spam |
| `edit_bio` / `edit_friends` | Perfil | permanente | Datos ofensivos o ilegales en perfil |
| `revoke_sessions` | Cuenta | inmediato | Cuenta comprometida |
| `site_control` | Web | según incidente | Kill switch (solo admin/owner) |

La **eliminación de cuenta por sistema/staff** (anticheat, strikes o decisión fundada del owner)
no es "una sanción más": es terminal y **no apelable** (ver `ANTICHEAT_SYSTEM.md` §7/§8).

## 5. Escalado

1. **Automático (anticheat)**: señales ponderadas → `flagged` → `warn → mute → ban → delete`
   según el umbral del juego y los strikes (3 zonas rojas = ban + eliminación; reset a 2 años).
2. **Manual**: warn → mute (o delete de contenido) → ban temporal → ban permanente.
   El escalado considera **historial activo** (`public.sanctions` + `anticheat.sanctions`).
3. **Nunca** se aplica `ban`/`delete` por una primera falta leve sin historial.

## 6. Flujo operativo (sanción manual)

1. **Detectar** — reporte de usuario, revisión de reseñas/foro, señal `suspicious` del
   anticheat en la devcon, o incidente de seguridad.
2. **Verificar** — leer el contenido/captura/partida; comprobar historial de sanciones y rol
   del objetivo (nunca sancionar a un rango superior o igual sin autorización del owner).
3. **Registrar y aplicar** — consola correspondiente (o SQL del staff vía service_role): la
   fila en `public.sanctions` **y** la entrada en `moderation_actions` (mismo motivo).
4. **Notificar** — email al usuario (marca Ciszu Network) + modal/estado de cuenta (rojo) con
   el motivo genérico y el enlace a Soporte → Apelación.
5. **Seguir** — la apelación se resuelve en `sanction_appeals` (staff); aceptarla revoca o
   reduce la sanción y también se audita.

## 7. Apelaciones

- **Siempre disponibles** (con o sin anticheat) en la categoría `Apelación de sanción` de
  Soporte; el formulario **preselecciona las sanciones activas** de la cuenta (unificando
  `public.sanctions` y `anticheat.sanctions`).
- Estados: `open` (usuario) → `reviewing` (staff asignado) → `accepted` (revoca/ajusta) o
  `rejected` (mantiene). Toda transición se audita.
- Plazo objetivo de respuesta: **72 h**. Una sanción no revisada en 7 días escala al owner.
- **No apelable**: eliminación por sistema/staff (sin acceso a Soporte por definición).

## 8. Quién puede moderar

| Rol | Alcance | Límites |
| --- | --- | --- |
| `mod` | Contenido y usuarios de **su web** | Mute/warn/delete de contenido; no bans permanentes |
| `admin` | Su web (o proyectos de su subcargo) | Ban temporal/permanente, ip_ban, revoke_sessions; no toca owner |
| `owner` | Todo el ecosistema | Todo, incluida eliminación de cuenta |

- **Nunca** se modera a un rango igual/superior; los pares se coordinan con el owner.
- Las acciones sensibles exigen **step-up** (código de elevación de la devcon) y quedan con
  `actor` explícito.

## 9. Auditoría y privacidad

- `moderation_actions` guarda: acción, actor, objetivo, motivo, detalle, IP del actor y fecha.
- Las sanciones muestran al usuario el **motivo** y la **duración**; el detalle interno
  (señales exactas, IPs, notas del staff) no se expone.
- Retención: las sanciones se conservan como historial (el usuario las ve en su estado de
  cuenta cuando está en rojo); los datos personales se rigen por `SECURITY_PROTOCOLS.md`.

## 10. Automatización y kill switch

- El anticheat actúa **solo** al cruzar el umbral (invisible antes), con la cuenta bot oficial
  del juego (`@muzicmania_anticheat`).
- El **kill switch** de sitios (devcon) solo lo activan admin/owner y se documenta en el
  registro de incidentes.

## 11. Prohibido

- Sancionar sin evidencia o sin registrar la acción.
- Modificar/borrar sanciones sin dejar rastro (editar `moderation_actions`).
- Usar IP bans por comodidad: solo por evasión o ataques, con nota.
- Revelar al usuario las señales exactas del anticheat o datos de otros usuarios.
- Moderar por conflicto personal o por críticas legítimas.

## 12. Relación con otros sistemas

- `ANTICHEAT_SYSTEM.md` — señales, sanciones automáticas, strikes y apelaciones.
- `ACCOUNT_SYSTEM.md` — cuentas, roles, eliminación y recuperación (15 días).
- `ADMIN_PROTOCOLS.md` — jerarquía, accesos y matriz de permisos del staff.
- `SECURITY_PROTOCOLS.md` — RLS, rate limits y datos sensibles.
- `DEV_CONSOLE_SYSTEM.md` — herramientas de moderación en la consola (usuarios, sitios).
- `EMAILS_SYSTEM.md` — avisos de sanción con marca.

_Última revisión: 09 oct 2026._ Relacionado: `ANTICHEAT_SYSTEM.md`, `ACCOUNT_SYSTEM.md`,
`ADMIN_PROTOCOLS.md`, `SECURITY_PROTOCOLS.md`, `DEV_CONSOLE_SYSTEM.md`.
