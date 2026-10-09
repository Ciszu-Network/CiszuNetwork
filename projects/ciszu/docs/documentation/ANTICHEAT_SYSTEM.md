# ANTICHEAT_SYSTEM — Ciszu Anti-Cheat (sistema reutilizable para videojuegos del ecosistema)

**Versión:** 1.0.0
**Actualización:** 2026-10-09
**Identificador:** ANTICHEAT_SYSTEM_V1.0.0_2026_10_09_ciszunetwork
**Definición:** sistema anti-trampas compartido ("Ciszu Anti-Cheat") para los videojuegos
del ecosistema (hoy **MuzicMania**, mañana cualquier otro juego). Detecta valores
alterados, puntuaciones imposibles, patrones de bot y comportamientos raros con un
**modelo de señales ponderadas**; es **invisible** hasta cruzar el umbral y entonces
actúa desde una **cuenta bot oficial del juego** con avisos, sanciones reales, strikes
y apelaciones. Incluye además el **estado de cuenta (roadmap)**, el **registro de
sanciones** y el **sistema de apelaciones** en soporte para TODAS las webs.

---

## 1. Principios

1. **Cada infracción cuenta, incluso la más leve** — pero pesa según su prioridad.
   Nada de sancionar por una sola señal débil.
2. **Invisible hasta el umbral** — el jugador no sabe que está siendo evaluado; no hay
   avisos ni cambios visibles mientras la puntuación esté por debajo del límite.
3. **Inteligente, no paranoica** — 3 niveles difíciles con 100% seguidos sin fallar es
   sospechoso; 1 nivel fácil al 100% es normal. El contexto (dificultad, racha,
   precisión del timing) cambia el peso de la misma señal.
4. **Escalonado** — la acción va de la advertencia al baneo/eliminación; nunca se salta
   pasos sin historial previo.
5. **Apelable** — toda sanción del anticheat (y las manuales) se puede apelar en Soporte.
6. **Reutilizable** — el motor es genérico (`game` como clave) y cada juego aporta sus
   reglas específicas en un perfil de detección.

## 2. Arquitectura

```
 Jugador ──► juego (MuzicMania) ──► POST /api/anticheat/signals ─┐
                                                                ▼
        ┌─────────────────────── motor (packages/utils o anticheat/) ───────────────┐
        │ 1. recibe SEÑAL (rule, weight, details)                                   │
        │ 2. aplica reglas del PERFIL DEL JUEGO (multiplicadores por dificultad,    │
        │    racha, precisión, historial)                                           │
        │ 3. acumula en anticheat.scores (score, level: clean→watch→suspicious)     │
        │ 4. si cruza el UMBRAL → level=flagged: crea sanción y actúa               │
        │ 5. guarda TODO (auditoría): anticheat.signals + anticheat.sanctions       │
        └───────────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┴─────────────────────┐
              ▼                                          ▼
   cuenta bot del juego                    usuario afectado
   "MuzicMania Anti-cheat"                (modal + email + estado de cuenta)
              │                                          │
              ▼                                          ▼
   sanciones (warn/mute/ban/delete)        Soporte → Apelaciones (siempre)
```

## 3. Señales (cada infracción cuenta)

Cada señal tiene `game`, `user_id`, `rule` (regla), `weight` (prioridad) y `details`
(contexto: dificultad, nivel, racha, timing…). El peso base lo multiplica el perfil
del juego según el contexto.

| Regla | Qué detecta | Peso base | Contexto que lo agrava |
| --- | --- | --- | --- |
| `perfect_streak` | 100% repetidos sin fallar | 15 | dificultad alta, rachas largas, niveles distintos |
| `impossible_score` | Puntuación por encima del máximo teórico del nivel | 50 | margen superado (porcentaje por encima del récord) |
| `speed_anomaly` | Terminar en un tiempo humanamente imposible | 40 | nivel conocido, tiempo por debajo del récord local |
| `value_tamper` | Valores alterados (precisión >100%, combos negativos, NaN) | 60 | reincidencia |
| `bot_pattern` | Cadencia de pulsaciones perfectamente uniforme (varianza ~0) | 30 | duración larga, repetición exacta entre partidas |
| `stat_outlier` | Racha de PBs consecutivos en sesiones cortas | 10 | muchos niveles distintos, sesión nueva |

> **Ejemplo MuzicMania**: `perfect_streak` en un nivel *fácil* ×1.0 = 15 pts; el mismo
> 100% en un nivel *difícil* ×2.0 = 30 pts; 3 seguidos en difíciles sin fallar suman 90
> (zona de acción), mientras que 3 perfectos sueltos en fáciles con fallos intermedios
> pueden quedarse en ~30 (invisible, solo observación).

## 4. Puntuación, niveles y umbrales

Se acumula en `anticheat.scores` por `(game, user_id)` con **decaimiento temporal**
(las señales pierden valor con los días, para no castigar para siempre):

| Nivel (`level`) | Rango de score | Visibilidad | Acción |
| --- | --- | --- | --- |
| `clean` | 0–19 | Invisible | Nada |
| `watch` | 20–49 | Invisible | Solo se registra (el motor aprende el patrón) |
| `suspicious` | 50–79 | Invisible | Lista interna del staff (devcon) |
| `flagged` | ≥80 | **Acción** | Sanción escalonada + aviso |

- **Decaimiento**: `score = score * 0.9^(días sin nuevas señales)` (config por juego).
- **Umbral por juego**: MuzicMania 80; juegos futuros pueden ajustarlo.
- **Invisibilidad**: hasta `flagged`, ni el usuario ni la web muestran nada; el registro
  vive solo en el schema interno (`anticheat.*`, accesible únicamente por servicio).

## 5. La cuenta del anticheat (un bot del juego)

- El sistema actúa **como una cuenta oficial del proyecto**: p. ej. en MuzicMania,
  **`MuzicMania Anti-cheat @muzicmania_anticheat`**, con **rango `bot`** y la etiqueta
  **`anticheat`** (tag de perfil nueva).
- **Sin correo propio → usa `ciszunetwork@gmail.com`** (regla de cuentas del ecosistema).
- Esa cuenta **no se elimina** ni se puede sancionar/apelar (es sistema).
- **Categorización de bots** (nueva, extensible): `anticheat`, `moderation`, `music`,
  `support`, `utility`… Cada bot del ecosistema declara su categoría; el rango `bot` se
  mantiene pero el tag diferencia su función. El anticheat es la primera categoría
  implementada.

## 6. Sanciones y avisos (cuando cruza el umbral)

Escalada por defecto (configurable por juego):

1. **`warn`** — modal personalizado ("Ciszu Anti-Cheat") + email + item en el estado de
   cuenta (amarillo). Sin pérdida de acceso.
2. **`mute`** — silencio en chats/comunidad (para moderación futura), con aviso.
3. **`ban`** — bloqueo de la cuenta (scope por web/juego), aviso por email + modal.
4. **`delete`** — eliminación por el sistema (no manual): **no se puede apelar ni
   revivir** (la eliminación la tomó el sistema/staff, no el usuario; y sin cuenta no
   hay acceso a Soporte).

Todo queda en `anticheat.sanctions` (con `signal_ids` que la justifican) y visible en el
**historial de sanciones** del usuario. Las sanciones manuales siguen en
`public.sanctions` y comparten la misma UI y el mismo flujo de apelación.

## 7. Strikes (3 zonas rojas = fin)

- Cada vez que la cuenta entra en **zona roja** (sanción activa grave) suma **1 strike**
  (`anticheat.strikes`, máx. 3, con `expires_at = +2 años`).
- **3 strikes activos ⇒ baneo + eliminación** de la cuenta (por sistema).
- Los **strikes se reinician cada 2 años** (caducan individualmente).
- **Contador visible** en el estado de cuenta.
- **Card por strike (0–2)** con recomendaciones:
  - **0** — todo bien: recomendaciones generales de seguridad/config.
  - **1** — primer aviso serio: qué evita el segundo strike y consecuencias.
  - **2** — último aviso: riesgo inmediato de pérdida de cuenta.
  - **3** — no hay recomendación posible: la cuenta se banea/elimina.

## 8. Estado de cuenta (roadmap) — en la configuración de cuenta de cada web

Sección nueva en `/settings` (después del auth), estilo Discord, en todas las webs:

- **Barra de estado** verde → amarillo → rojo según los items activos:
  - **Verde** — todo correcto (o avisos ignorados conscientemente).
  - **Amarillo** — recomendaciones o configuración pendiente (sin sanción).
  - **Rojo** — sanción activa (apelable) o riesgo crítico.
  - **Mínimo / negro** — en peligro de eliminación o ya eliminada (no se mueve).
- **Mini-notificaciones en lista** explicando cada situación, con su título desde
  *"Muy buen estado"* hasta *"Estado fatal"*.
- **Botón directo de apelación** cuando la sanción es apelable (lleva a Soporte con la
  sanción preseleccionada).
- **Ignorar**: un aviso simple (nivel `recommendation`) se puede ignorar → la cuenta
  vuelve a verde (salvo que esté roja por otra razón).
- **Registro de ignorados y completados** + sección **"Qué te falta por hacer"**
  (tutorial): cada tarea completada llena su barra; se puede ignorar para siempre
  (desaparece).
- **Historial de sanciones** (actuales e históricas) visible en rojo.
- **Eliminación no manual**: la cuenta queda en el nivel mínimo y **sin botón de
  apelación** (sin acceso a Soporte).

Datos: `public.account_status_items` (RLS dueño) — `key`, `status` (`pending|done|ignored`),
`level` (`info|recommendation|warning|sanction|critical`), `title`, `detail`.

## 9. Apelaciones en Soporte (todas las webs, con o sin anticheat)

- Nueva categoría **"Apelación de sanción"** en el formulario de soporte.
- **Selección de sanción**: lista las sanciones **activas** de la cuenta (del anticheat y
  manuales, unificadas) para elegir cuál se apela; el sistema de soporte está
  **entrelazado con el anticheat** (lee `anticheat.sanctions` + `public.sanctions`).
- La apelación funciona **aunque la sanción sea manual** y aunque el anticheat no exista
  para ese juego.
- Estados: `open → reviewing → accepted | rejected` (resuelve staff). Datos:
  `public.sanction_appeals` (RLS: el dueño crea y ve las suyas; el staff resuelve).

## 10. Configuraciones de cuenta (paridad estilo Discord/Steam)

Secciones objetivo en `/settings` de cada web (se añaden las que falten):

| Sección | Contenido |
| --- | --- |
| Perfil | Nombre display, avatar, bio (según web) |
| Estado de la cuenta | Roadmap + strikes + historial + apelaciones (este sistema) |
| Privacidad | Visibilidad del perfil, datos, exportación |
| Seguridad | Contraseña, OTP, sesiones/dispositivos, cerrar sesiones, step-up |
| Notificaciones | Email, teléfono (si aplica), categorías (patrocinios, avisos…) |
| Video y voz | Preferencias del juego/reproductor (entrada, volumen, calidad) |
| Novedades | Changelog personalizado / novedades del ecosistema |
| Detalles / Información | Datos técnicos de la cuenta para soporte |
| Danger Zone | Eliminación de cuenta (flujo actual de 15 días) |

## 11. Modelo de datos (implementado — migración `20261009000001_anticheat_system.sql`)

| Tabla | Uso | Acceso |
| --- | --- | --- |
| `anticheat.signals` | Cada señal con su peso y contexto | Solo servicio |
| `anticheat.scores` | Puntuación acumulada + nivel por (juego, usuario) | Solo servicio |
| `anticheat.sanctions` | Sanciones del anticheat (con señales justificantes) | Solo servicio |
| `anticheat.strikes` | Strikes (1–3) con caducidad a 2 años | Solo servicio |
| `public.account_status_items` | Roadmap/tutorial: pendiente/hecho/ignorado | RLS dueño (S/I/U) |
| `public.sanction_appeals` | Apelaciones (anticheat o manuales) | RLS dueño (S/I); staff resuelve |

El schema `anticheat` **no se expone por PostgREST** (revocado a anon/authenticated, como
`internal`); el motor y las consolas lo usan con `service_role`.

## 12. Roadmap de implementación

| Fase | Contenido | Estado |
| --- | --- | --- |
| 1 | Schema BD + documentación (este doc) | ✅ 09 oct 2026 |
| 2 | Motor de señales/puntuación (módulo reutilizable + endpoint `POST /api/anticheat/signals`) y perfil de reglas de MuzicMania | ✅ 09 oct 2026 (8 tests) |
| 3 | Cuenta bot `muzicmania_anticheat` (rango bot + `bot_category=anticheat` en metadata) | ✅ 09 oct 2026 |
| 4 | UI: `AccountStatusPanel` (barra verde→rojo, roadmap, strikes + cards 0-3, sanciones con apelación, hechos/ignorados/reabrir) integrado en la configuración de cuenta de las 4 webs | ✅ 09 oct 2026 |
| 5 | Soporte: `SanctionAppeal` + API `/api/support/appeal` (sanciones activas unificadas anticheat+manual, sirve sin sanciones) y página `/appeal` en las 4 webs | ✅ 09 oct 2026 |
| 6 | Sanciones automáticas escalonadas (warn→mute→ban→delete) + strikes + aviso por email con marca | ✅ 09 oct 2026 |
| 7 | Secciones de cuenta COMPLETAS: Estado de la cuenta ✅, Información de la cuenta ✅, Novedades ✅ y **Video y voz ✅** (solo MuzicMania: volumen de música/efectos sincronizado BD ↔ juego vía `settings_controls.video_voice` + claves `audio_music_vol`/`audio_sfx_vol`; API `/api/auth/account/audio`). **SMS ✅ (preparado)**: teléfono en la cuenta (`user_metadata.phone`), preferencia `sms_enabled` en `notification_preferences`, abstracción `sendSms()` en `@ciszunetwork/utils` (env `SMS_API_URL`/`SMS_API_KEY`/`SMS_FROM`); envía cuando se configure un proveedor | ✅ (parcial) |

## 13. Relación con otros sistemas

- `ACCOUNT_SYSTEM.md` — cuentas, roles, sanciones (`public.sanctions`), eliminación 15 días.
- `SECURITY_PROTOCOLS.md` — RLS obligatoria, rate limits en el endpoint de señales.
- `DB_SYSTEM.md` — schemas y migraciones.
- `AUTH_SYSTEM.md` — la cuenta bot y el rango `bot` de los perfiles.
- `EMAILS_SYSTEM.md` — avisos de sanción por email.
- `DEV_CONSOLE_SYSTEM.md` — herramientas del staff (ver señales `suspicious`, strikes).
- MuzicMania — primer juego integrado (reglas `perfect_streak`, `speed_anomaly`, `bot_pattern`).

_Última revisión: 09 oct 2026._ Relacionado: `ACCOUNT_SYSTEM.md`, `DB_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `EMAILS_SYSTEM.md`, `DEV_CONSOLE_SYSTEM.md`.
