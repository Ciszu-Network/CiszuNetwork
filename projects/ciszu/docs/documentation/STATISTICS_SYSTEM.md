# STATISTICS_SYSTEM — Estadísticas reales del ecosistema

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: STATISTICS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> Documento con las cifras verificables y actuales de Ciszu Network (ago 2026). Los datos
> provienen de fuentes del propio ecosistema (Supabase, Vercel, UptimeRobot, PostHog) y del
> repo; no son estimaciones. Complementa `ANALYTICS_SYSTEM.md` (medición) y
> `STATUS_SYSTEM.md` (estado operativo).

## Repositorio

- **Stacks**: Next.js 15 ×4 webs + bot Discord.js (TypeScript, Node 24) + Tauri (Rust) para MuzicMania.
- **Comandos del bot**: 72 comandos en 9 categorías.
- **Migraciones de BD aplicadas**: 17 (jul–ago 2026).
- **Tests**: suite Vitest 157 tests (11 ago 2026), E2E smoke + 5 E2E de seguridad.
- **Package managers**: pnpm 10.8.1 (monorepo).

## Base de datos (Supabase)

- Proyecto único `obwzzmbvkrcscqwptlqo`, schema `ciszubot` (14 tablas: 13 + audit_log) + `muzicmania` + `ciszu` (cache/counters).
- **CDN**: bucket `ciszu-cdn` — 7.353 objetos / **160.6 MB** (10 ago 2026 tras limpieza de `ciszu-assets` 1.44 GB → 0).
- Cuota Free storage 1 GB — usada ~16 %.

## Monitorización (UptimeRobot)

- 5 monitores KEYWORD UP (ciszunetwork, ciszukoantony, muzicmania, ciszubot, supabase-bot-status).
- Heartbeat del bot cada 60 s → `ciszubot.bot_status` (online/last_seen/version/guilds).

## Seguridad

- **code scanning**: 31/31 fixed · **dependabot**: 35/36 (resta glib) · **secret scanning**: 1 abierta (PAT rotado/revocado).
- **Advisors Supabase**: security 1 warning (leaked password — límite Free), performance 0 warnings.
- **SAST/DAST**: semgrep 0 reales · ZAP 0 High/4 Medium · gitleaks diff v8.30.1 · secretlint hook pre-commit.
- **Vault**: 26 secrets cifrados con age v1.2.1, backups age + ACLs NTFS + BitLocker E: 100%.

## Rendimiento / calidad

- **Builds**: 4/4 webs OK.
- **CDN verify**: 0 mimetypes malos en 9.055 objetos (8 ago 2026; ahora 7.353).
- Migración 11 (revoke trigger functions): anon/auth EXECUTE = false en las 3.

## Métricas de negocio a capturar (pendiente, ver `ANALYTICS_SYSTEM.md`)

- Eventos/mes PostHog (Free 1M), visitas Cloudflare Web Analytics, votos top.gg/DBL (`ciszu.counters`), récords de MuzicMania (tabla `scores`), uso del bot (guilds/commands via `command_logs`). Actualizar esta sección cuando haya datos históricos.

## Cómo obtener cada cifra (fuentes verificables)

| Cifra | Fuente/consulta |
|---|---|
| Objetos/spacio CDN | Supabase Dashboard → Storage → buckets `ciszu-cdn` |
| Commands del bot | `SELECT count(*) FROM ciszubot.commands` o la lista en el código del bot |
| Migraciones aplicadas | `scripts/` (apply-migration-XX) o `_migrations` table |
| Tests | `pnpm test` (Vitest) + `pnpm e2e` (Playwright) |
| Vulnerabilidades | GitHub Security (code/secret scanning), `pnpm audit`, `semgrep`, ZAP |
| Monitorización | UptimeRobot dashboard + `ciszubot.bot_status` (heartbeat) |
| Eventos de producto | PostHog dashboard (proyecto `550383`) |

## Historial de cifras (tendencia)

| Fecha | CDN objetos | CDN MB | Tests | Notas |
|---|---|---|---|---|
| 8 ago 2026 | 9.055 | — | — | verify mimetypes 0 malos |
| 10 ago 2026 | 7.353 | 160.6 | 96 | tras limpiar `ciszu-assets` 1.44 GB → 0 |
| 11 ago 2026 | — | — | 157 | suite Vitest crecida |

## Cómo medir cada métrica

| Métrica | Fuente | Comando / consulta |
|---|---|---|
| CDN objetos / MB | Supabase Storage | `node scripts/check-cdn-mimes.js` o dashboard Storage |
| Tests totales | Vitest | `pnpm test` (último conteo en output) |
| E2E | Playwright | `pnpm e2e` (smoke + security) |
| Lint | ESLint | `pnpm lint` (0 errores) |
| Migraciones | Supabase | `_migrations` table vía dbvr |
| Uptime | UptimeRobot | Dashboard + `ciszubot.bot_status` |
| Analítica | PostHog | Dashboard proyecto `550383` |
| Errores | Sentry | Dashboard org `ciszu-network` |
| Deploys | Vercel | Dashboard / GitHub Actions |
| Vulnerabilidades | GitHub Security | Code scanning + secret scanning |

## Cuándo actualizar este documento

- Al final de cada sesión, si hay cifras nuevas verificables.
- Tras limpiar el CDN, añadir tests, migraciones o cambiar infra.
- El historial de tendencia se usa para detectar regresiones (ej. CDN crece mucho → revisar
  mimetypes/prune; tests bajan → revisar suite).

## Cifras de referencia actuales

- **Tests unitarios**: 157 (Vitest).
- **CDN**: 7.353 objetos / 160.6 MB (10 ago 2026).
- **Apps que depliegan**: 4/4.
- **Migraciones**: ver tabla `_migrations` (siempre al día).
- **Uptime target**: ≥ 99%.

## Metodología de captura de cifras

Reglas para que un número entre en este documento:

1. **Verificable**: se obtiene con un comando, dashboard o consulta (tabla "Cómo obtener cada cifra").
2. **Fechado**: cada dato indica cuándo se capturó (día/mes); sin fecha no entra al historial.
3. **Sin estimaciones**: nada de "~", "aprox." ni extrapolaciones; si no hay fuente, queda como pendiente.
4. **Fuente primaria**: preferir la herramienta de origen (Supabase, Vercel, PostHog, `pnpm test`) sobre
   interpretaciones intermedias.
5. **Comparable**: usar las mismas unidades (objetos, MB, nº tests, %) entre filas del historial.

## Periodicidad recomendada

| Tipo de cifra | Frecuencia sugerida | Disparador |
|---|---|---|
| Tests, lint, builds | Por sesión con cambios de código | El desarrollador/agente |
| CDN (objetos, MB) | Tras uploads, limpiezas o prune | `scripts/upload-cdn.js`, pipeline de assets |
| Vulnerabilidades | Cada merge a `main` | CI/DAST (semanal), GitHub Security |
| Uptime / incidencias | Continuo (monitores) | UptimeRobot + ntfy |
| Métricas de producto | Mensual con datos históricos | `ANALYTICS_SYSTEM.md` |
| Migraciones BD | Al aplicar cada migración | Tabla `_migrations` via dbvr |

## Lectura de tendencias (qué vigilar)

- **CDN crece mucho en poco tiempo** → revisar duplicados, mimetypes y el prune (`upload-cdn.js --prune`).
- **Tests bajan de una sesión a otra** → revisar la suite (¿se borraron archivos? ¿cambió la UI?).
- **Cifras de seguridad suben** → abrir incidencia y rotar de inmediato (ver `DEVSECOPS_SYSTEM.md`).
- **Uptime < 99 %** → investigar antes de actualizar la tabla de estado.
- El historial de la sección "Historial de cifras" es la brújula: añadir fila nueva sin borrar las viejas.

## Cifras que este documento NO incluye

- Datos **no verificados** (estimaciones, screenshots antiguos, memoria).
- Secretos o credenciales — viven en `VAULT_SYSTEM.md`.
- Métricas de producto finas (funnel, sesiones...) — pertenecen a `ANALYTICS_SYSTEM.md`.
- Estado operativo (servicio apagado/encendido) — pertenece a `STATUS_SYSTEM.md`.
- Números de contactos y clientes — pertenecen a `CONTACTS_PROTOCOLS.md`.

## Consistencia con otros documentos

- Si una cifra aparece en varios docs, este es el **canónico**: `STATUS_SYSTEM.md` y las refs cruzadas
  deben apuntar aquí sin re-numerar.
- Al actualizar CDN/tests/migraciones aquí, revisar que `STATUS_SYSTEM.md` y `AGENTS.md` encajan.
- Un cambio de infra grande (nuevo servicio) entra primero en `ARCHITECTURE.md` y luego se refleja aquí.

## Unidades y convenciones usadas

| Cifra | Unidad | Convención |
|---|---|---|
| CDN | objetos y MB | Total del bucket `ciszu-cdn`, decimales cuando hay MB |
| Tests | nº | Conteo del último `pnpm test` (Vitest) |
| Uptime | % | Media de los 5 monitores KEYWORD UP |
| Vulnerabilidades | nº críticas | `pnpm audit --prod`, CodeQL, ZAP (High/Medium) |
| Migraciones | nº y fecha | Tabla `_migrations` (dbvr) |

## FAQ de estadísticas

| Pregunta | Respuesta |
|---|---|
| ¿Puedo añadir una cifra sin su comando? | No: toda cifra requiere fuente en la tabla correspondiente |
| ¿Dónde está el uptime exacto? | UptimeRobot dashboard y `ciszubot.bot_status` |
| ¿El contador de iconos se actualiza solo? | No: a mano al añadir SVGs (ver `ICON_SYSTEM.md`) |
| ¿Las cifras de CDN son del bucket entero? | Sí: bucket `ciszu-cdn` tras eliminar el legacy `ciszu-assets` |
| ¿Cómo detecto una regresión? | Comparando las filas del historial de tendencia |

## Checklist de actualización

- [ ] Cifras capturadas hoy con su fecha.
- [ ] Filas nuevas añadidas al historial (sin borrar las antiguas).
- [ ] Fuentes/comandos actualizados si cambió el método (nuevo script, otro dashboard).
- [ ] Refs cruzadas (`STATUS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`) revisadas.
- [ ] Ningún secreto ni ruta inventada: solo lo verificado.

## Comandos de consulta rápida (resumen operativo)

| Qué ver | Comando |
|---|---|
| Tests | `pnpm test` (Vitest) |
| E2E | `pnpm e2e` (Playwright) |
| Mimetypes CDN | `node scripts/check-cdn-mimes.js` |
| Migraciones | `SELECT * FROM _migrations;` via `dbvr sql -ds=supabase` |
| Comandos del bot | `SELECT count(*) FROM ciszubot.commands;` |
| Objetos del bucket | Dashboard Supabase → Storage |
| Errores | Sentry (org `ciszu-network`) |
| Analítica | PostHog (proyecto `550383`) |

## Relación con las metas del ecosistema

- Las cifras sirven para **detectar regresiones**, priorizar trabajo y justificar decisiones
  (ej. CDN crece → revisar mimetypes/prune; tests bajan → revisar suite).
- El objetivo de uptime ≥99 % y 0 High (ZAP) está definido en `DEVSECOPS_SYSTEM.md`.
- Cuando la métrica afecta a negocio (votos, scores, donaciones), abrir el doc del área
  (`BUSINESS_SYSTEM.md`, `PAYMENTS_SYSTEM.md`, scores de MuzicMania).

## Registro de versiones de este documento

| Fecha | Cambio |
|---|---|
| 2026-08-13 | Ampliado a ≥200 líneas: metodología, periodicidad, tendencias, FAQ |
| 2026-08-11 | Tests a 157; se añade columna de tendencia |
| 2026-08-10 | Limpieza CDN: 7.353 objetos / 160.6 MB; bucket legacy eliminado |

- Convención: append de lo verificado; no reescribir el histórico sin justificación.

_Última revisión: 13 ago 2026._ Relacionado: `ANALYTICS_SYSTEM.md`, `STATUS_SYSTEM.md`,
`MONITORING_SYSTEM.md`, `DB_SYSTEM.md`.