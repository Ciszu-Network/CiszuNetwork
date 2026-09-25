# SCHEDULE_PROTOCOLS — Horario y agenda

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: SCHEDULE_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: horarios y agenda de trabajo recomendados para Ciszu Network (empresa
> unipersonal): horario base, cadencias, prioridades y agenda semanal tipo.

Guía de horarios y agenda de trabajo recomendados para Ciszu Network (empresa unipersonal). Flexible, pero con anclas para mantener constancia y sostener el bot 24/7 desde el PC.

## Horario base recomendado (día)

- **Mañana**: arranque suave (revisar notificaciones ntfy/UptimeRobot, estado del bot, deploys).
- **Bloque A (2–3 h)**: trabajo profundo (desarrollo, diseño, música).
- **Pausa activa**: mover la vista/cuerpo (ver `HEALTH_AND_SAFETY_PROTOCOLS.md`).
- **Bloque B (2–3 h)**: tareas de gestión (migraciones, CDN, seguridad, marketing, redes).
- **Tarde**: pruebas, revisión de metrics (PostHog, Vercel, UptimeRobot), contenido/planificación.
- **Cierre**: commit, push, backup (`backup-db.js`) cuando toque, aviso por push de fin de tarea.

**Zona de veto**: por la noche el PC puede apagarse para descansar — el bot muere con él. Para 24/7 real ver `VPS_PLAN.md` (recomendación de hosting).

## Agenda (cadencia)

- **Diario**: estado del bot (heartbeat `ciszubot.bot_status`), monitor UptimeRobot 5 endpoints, revisar ntfy.
- **Semanal**: `pnpm test`, `pnpm lint`, builds 4 webs, revisar dependabot/audit (`pnpm audit --prod`, `trivy`), revisar stats (PostHog ~1M/mes free), backups DB si aplica (`backup-db.js --scheduled`).
- **Mensual**: actualizar `AGENTS.md`/`TODO.md`, reintentar token/rotación pendientes (ver `VAULT_SYSTEM.md`, `tokens_a_rotar.md`), revisar to-dos legales.
- **Trimestral**: revisar migraciones de framework (Next/Supabase/Discord.js), plan de monetización, roadmap de fases legales (Fase 0→4, ver `COMPANY_REGISTRATION_PLAN.md`).

## Prioridades (matriz simple)

1. **Producción arriba** (webs + bot + CDN + DB).
2. **Seguridad** (advisors, audits, rate limits, rotaciones).
3. **Sistemas** (cache, monitorización, analítica).
4. **Contenido/producto** (música, juego, portfolio).
5. **Crecimiento** (marketing, comunidad, monetización).

## Agenda semanal tipo (propuesta)

| Día | Foco |
| --- | ---- |
| Lun | Seguridad/sistemas (pipeline DAST lunes 06:30 UTC) |
| Mar | Desarrollo producto (webs/música) |
| Mié | Marketing/contenido/redes |
| Jue | Desarrollo bot / nuevas features |
| Vie | Pruebas, build/prod, pendientes, plan semana siguiente |
| Sáb | Creativo (diseño, música) / experimentos |
| Dom | Descanso + planificación (mínimo) |

## Zona horaria y crones (recordatorio)

- Hora local: **UTC−4 (Falcón, Caracas)**.
- Crones en **UTC**: seguridad 06:00 UTC (= 02:00 local), DAST lunes 06:30 UTC (= 02:30).
- Al programar tareas manuales en la noche, considerar que el PC (y el bot) pueden apagarse.

## Transiciones de horario (reglas)

- **Sin cron en la madrugada local** salvo necesarios (uptime-watch cada 5 min es ligero).
- Los deploys manuales se hacen en horario de trabajo (no en zona de veto nocturna).
- Backups pesados (`backup-db.js`) en horario de baja actividad.

## Cómo adaptar la agenda

1. Elegir bloques según energía (mañana = deep work; tarde = gestión).
2. Respetar el corte nocturno (ver `HEALTH_AND_SAFETY_PROTOCOLS.md`).
3. Mover tareas de gestión a días con pipeline automático ya cubierto.
4. Registrar en `TODO.md` cualquier desviación que afecte al bot 24/7.

## Rutina diaria detallada (hora por hora)

| Hora (local UTC−4) | Bloque | Detalle |
|---|---|---|
| 07:30–08:00 | Arranque | Estado del bot (`ciszubot.bot_status`), ntfy, UptimeRobot, deploys pendientes |
| 08:00–11:00 | Deep work A | Desarrollo/diseño/música (máximo enfoque) |
| 11:00–11:15 | Pausa activa | Estirar, agua, vista a lo lejos |
| 11:15–13:00 | Gestión A | Migraciones, CDN, seguridad, correo |
| 13:00–14:00 | Almuerzo | Desconexión de pantallas |
| 14:00–16:00 | Gestión B / pruebas | Builds, tests, metrics (PostHog, Vercel) |
| 16:00–17:30 | Contenido | Redes, contenido, planificación |
| 17:30–18:00 | Cierre | Commit, push, backup si toca, plan del día siguiente |

La tabla es un molde, no una camisa de fuerza: ajustar bloques según energía y día
(ver agenda semanal). Lo importante es preservar al menos un bloque de deep work
diario y el corte nocturno (ver `HEALTH_AND_SAFETY_PROTOCOLS.md`).

## Técnicas de productividad

- **Time blocking**: asignar bloques del calendario a tareas concretas; reduce la
  fatiga de decidir "qué hago ahora".
- **Pomodoro adaptado**: 25–50 min de foco + 5–10 de pausa (ver
  `HEALTH_AND_SAFETY_PROTOCOLS.md` para el protocolo completo).
- **Deep work**: la tarea más importante se hace al inicio de la jornada, sin
  notificaciones; es el bloque que más mueve el proyecto.
- **Batch de comunicaciones**: revisar ntfy/correo/redes en ventanas fijas, no en
  cada interrupción.
- **Un solo objetivo por bloque**: si una tarea se alarga, cerrarla o re-agendarla
  en vez de arrastrarla entre bloques.

## Priorización rápida diaria

Al empezar cada jornada, responder en orden:

1. ¿Hay algo roto en producción? (estado del bot, UptimeRobot, alerts ntfy).
2. ¿Qué es lo más valioso que puedo terminar hoy? (un entregable visible).
3. ¿Qué pendiente de seguridad vence pronto? (dependabot, audits, rotaciones).
4. ¿Qué tarea mecánica aprovecho en mi ventana de baja energía?

Si lo primero está bien, el día se enfoca en los puntos 2 y 3; lo mecánico va al
final de la jornada.

## Gestión de interrupciones y notificaciones

- Configurar alertas de ntfy solo para eventos reales (caídas, errores, backups
  fallidos); evitar notificaciones que solo informan.
- En bloques de deep work: silenciar notificaciones del sistema y del móvil.
- Ante una alerta crítica (endpoint DOWN, error en prod): atenderla de inmediato,
  registrar la incidencia y retomar el bloque donde se dejó.
- Revisar UptimeRobot y el estado del bot como parte del arranque y del cierre,
  no durante el deep work.

## Ventanas de mantenimiento (baja actividad)

| Operación | Ventana recomendada |
|---|---|
| Deploys manuales | Horario de trabajo (nunca en zona de veto nocturna) |
| Migraciones de BD | Horario de baja actividad (mañana temprano) |
| Backups pesados (`backup-db.js`) | Horario de baja actividad |
| Reinstalaciones/actualizaciones del PC | Fin de semana, con margen para revertir |
| Limpieza de CDN | Con plan previo y verificación posterior |

Regla general: nada destructivo sin un punto de restauración y sin avisar (ver
`WORKFLOW_SYSTEM.md`).

## Energía y cronotipo

- Identificar el pico natural de energía: si es por la mañana, mover el deep work
  ahí; si es por la tarde, invertir los bloques.
- No planificar tareas exigentes en los bajos de energía (la media tarde post-
  almuerzo suele ser buena ventana para tareas mecánicas: limpieza, revisión de
  métricas).
- Respetar los días de descanso: el domingo mínimo es intencional y forma parte de
  la sostenibilidad (ver `HEALTH_AND_SAFETY_PROTOCOLS.md`).

## Seguimiento de la agenda (métricas)

- Registrar al cierre: bloques de deep work completados, tareas del día y alertas
  atendidas.
- Revisar semanalmente: pendientes arrastrados, días sin descanso, horas de trabajo
  reales. Ajustar la agenda si hay desviaciones repetidas.
- Actualizar `TODO.md` con lo hecho y lo pendiente; es la memoria operativa de la
  agenda.

## Festivos y planificación anual

- Considerar los días no laborables de Venezuela (ver
  `GEOGRAPHIC_CONTEXT_PROTOCOLS.md`) al planificar lanzamientos y mantenimientos.
- Usar los puentes y festivos para tareas creativas o de aprendizaje (no para
  operaciones de riesgo).
- Planificar una revisión trimestral de la agenda completa contra el roadmap
  (Fase 0→4, ver `COMPANY_REGISTRATION_PLAN.md`).

## Calendario mensual tipo

| Semana | Foco principal |
|---|---|
| 1 | Seguridad y sistemas (cadencias cumplidas, auditorías pendientes) |
| 2 | Desarrollo de producto (features, música, mejoras) |
| 3 | Marketing, contenido, comunidad (lanzamientos, canales) |
| 4 | Cierre: pruebas, build/prod, revisión de métricas, plan del mes siguiente |

Objetivo: que en un mes se toquen todos los frentes sin saturar ninguno. Ajustar
según hitos (lanzamientos, roadmaps legales de `COMPANY_REGISTRATION_PLAN.md`).

## Contingencia ante imprevistos

1. **Incidente en prod** (endpoint DOWN, bot offline): atender primero, registrar
   y re-planificar el resto del día.
2. **Corte de energía / DNS** (ver `GEOGRAPHIC_CONTEXT_PROTOCOLS.md`): preservar
   el trabajo guardando y haciendo commit; operar de forma remota si la nube sigue
   arriba.
3. **Enfermedad o baja energía**: mover el día a tareas mecánicas y descansar;
   ninguna cadencia justifica agotarse (ver `HEALTH_AND_SAFETY_PROTOCOLS.md`).
4. **Desviaciones que afectan el bot 24/7**: registrarlas en `TODO.md` y
   evaluar el plan de `VPS_PLAN.md` si se vuelven recurrentes.

## Preguntas frecuentes (FAQ)

**¿Puedo saltarme el corte nocturno si el bot depende del PC?**
Sí, técnicamente el bot funciona; pero el objetivo es no normalizar trasnochos.
El plan de `VPS_PLAN.md` es la solución real para el 24/7 sin sacrificar descanso.

**¿Qué hago si un bloque de deep work se interrumpe?**
Anotar la tarea y el punto exacto, atender la interrupción si es crítica o
reagendar, y retomar el bloque. No intentar "compensar" perdiendo pausas.

**¿La agenda semanal es obligatoria?**
No: es una propuesta de anclas. Lo obligatorio es proteger el deep work diario,
el corte nocturno y la cadencia de seguridad (diaria/semanal) del repo.

**¿Cómo sé si la agenda está funcionando?**
Con las métricas de seguimiento: si los pendientes arrastrados bajan y hay días de
descanso respetados, la agenda funciona; si no, ajustar bloques o prioridades.

_Última revisión: 13 ago 2026._ Relacionado: `GEOGRAPHIC_CONTEXT_PROTOCOLS.md`,
`HEALTH_AND_SAFETY_PROTOCOLS.md`, `WORKFLOW_SYSTEM.md`, `VPS_PLAN.md`.