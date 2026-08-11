# SCHEDULE — Horario y agenda

Guía de horarios y agenda de trabajo recomendados para Ciszu Network (empresa unipersonal). Flexible, pero con anclas para mantener constancia y sostener el bot 24/7 desde el PC.

## Horario base recomendado (día)

- **Mañana**: arranque suave (revisar notificaciones ntfy/UptimeRobot, estado del bot, deploys).
- **Bloque A (2–3 h)**: trabajo profundo (desarrollo, diseño, música).
- **Pausa activa**: mover la vista/cuerpo (ver `HEALTH.md`).
- **Bloque B (2–3 h)**: tareas de gestión (migraciones, CDN, seguridad, marketing, redes).
- **Tarde**: pruebas, revisión de metrics (PostHog, Vercel, UptimeRobot), contenido/planificación.
- **Cierre**: commit, push, backup (`backup-db.js`) cuando toque, aviso por push de fin de tarea.

**Zona de veto**: por la noche el PC puede apagarse para descansar — el bot muere con él. Para 24/7 real ver `VPS_247.md` (recomendación de hosting).

## Agenda (cadencia)

- **Diario**: estado del bot (heartbeat `ciszubot.bot_status`), monitor UptimeRobot 5 endpoints, revisar ntfy.
- **Semanal**: `pnpm test`, `pnpm lint`, builds 4 webs, revisar dependabot/audit (`pnpm audit --prod`, `trivy`), revisar stats (PostHog ~1M/mes free), backups DB si aplica (`backup-db.js --scheduled`).
- **Mensual**: actualizar `AGENTS.md`/`TODO.md`, reintentar token/rotación pendientes (ver `VAULT_SECURITY.md`, `tokens_a_rotar.md`), revisar to-dos legales.
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

_Última revisión: 11 ago 2026._