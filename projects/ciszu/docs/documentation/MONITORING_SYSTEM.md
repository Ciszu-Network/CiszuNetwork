# MONITORING_SYSTEM — Sistema de monitoreo externo (UptimeRobot) — Ciszu Network

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: MONITORING_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de monitoreo externo del ecosistema con UptimeRobot: qué se
> vigila, configuración de los 5 monitores, alertas y evolución futura.

> **Estado**: ACTIVADO (10 ago 2026). Decisión revisada — ver `CLOUDFLARE_SYSTEM.md`
> (antes: "NO proceder por ahora", reabierta porque el monitoreo externo aporta alertas
> proactivas que el heartbeat local no da).
> Cuenta del usuario: UptimeRobot (login Google) — ver §4 para los checks exactos.

---

## 1. Qué cubre cada capa (y por qué hacen falta DOS)

| Capa | Qué detecta | Límite |
|---|---|---|
| **Heartbeat interno** (`ciszubot.bot_status`, cada 60s) | Bot apagado (la web lo marca tras `last_seen` > 3 min) | Solo funciona si el PC/bot está vivo para reportar — y nadie se entera si no abres la web |
| **UptimeRobot (externo, nuevo)** | Webs caídas, Supabase/PostgREST caído, respuestas con error, **alertas al móvil sin estar delante del PC** | Vigila desde fuera, 24/7, avisa por email/Telegram/ntfy |

El monitor externo NO sustituye al heartbeat: el heartbeat detecta "bot apagado" (lógica
`online && last_seen < 3 min` de la web), UptimeRobot detecta "el servicio no responde".
Ambos son necesarios.

---

## 2. Qué se vigila (5 monitores, free tier 50 disponibles)

| # | Monitor | Tipo | URL / config | Keyword | Por qué |
|---|---|---|---|---|---|
| 1 | ciszunetwork | HTTP(s) | `https://ciszunetwork.vercel.app` | `Ciszu Network` | Web principal |
| 2 | ciszukoantony | HTTP(s) | `https://ciszukoantony.vercel.app` | `Ciszuko Antony` | Portfolio |
| 3 | muzicmania | HTTP(s) | `https://muzicmania.vercel.app` | `MuzicMania` | Juego |
| 4 | ciszubot web | HTTP(s) | `https://ciszubot.vercel.app` | `CiszuBot` | Landing bot (estado en vivo) |
| 5 | Supabase bot_status | HTTP(s) + **custom headers** | `https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/bot_status?select=*&limit=1` | `"online":true` | Supabase/PostgREST vivos + fila existe |

**Headers del monitor #5** (PostgREST exige los 3):
```
apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Authorization: Bearer <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Accept-Profile: ciszubot
```
La anon key es **publishable** (pública por diseño, viaja en el bundle del navegador) — no
es un secret; vive en `.env.local` de las 4 webs (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Lo que NO se vigila con UptimeRobot**:
- Puerto local `:5000` del bot (statsServer) — está en el PC del usuario; un monitor
  externo no llega a localhost (queda cubierto por el heartbeat).
- Detección de bot apagado por fuera: el monitor #5 valida Supabase, no la vida del bot.
  La lógica `last_seen < 3 min` sigue siendo de la web. Cuando el bot pase a VPS 24/7,
  añadir un monitor sobre un endpoint del propio bot (Fase VPS, ver §5).

---

## 3. Configuración (una vez, ~30 min)

1. **Cuenta**: login con Google (ya creada por el usuario, 10 ago 2026).
2. **Crear los 5 monitores** de §2: My Settings → Add New Monitor → HTTP(s):
   - URL, intervalo 5 min (free), timeout 30s, keyword (si aplica) con alert on "contains".
   - Monitor #5: añadir los 3 headers en "Custom Headers".
3. **Alertas** (My Settings → Alert Contacts): email (ya configurado) + Telegram (bot
   @user1telegrambot, sin cuenta extra) + webhook ntfy (topic `ciszu-...`, método POST,
   formato JSON — notificaciones push al móvil junto al sistema existente).
4. **Status page pública** (opcional, 1 click): My Settings → Status Pages → crear una
   con los 5 monitores → URL `https://status.ciszunetwork.uptimerobot.com` (mostrarla en
   la web de ciszubot o footer cuando se quiera transparencia pública).
5. Verificar: apagar temporalmente una web en Vercel (o un keyword incorrecto) y
   confirmar que llega la alerta.

---

## 4. Estado verificado (10 ago 2026)

- 4 webs responden 200 en producción con los keywords confirmados por curl.
- Endpoint `bot_status` responde 200 con los 3 headers y el JSON contiene `"online":true`.
- Cuenta UptimeRobot del usuario lista; checks de §2 listos para crear.

---

## 5. Evolución futura

| Momento | Acción |
|---|---|
| **Bot en VPS 24/7** (toDo "24/7 pendiente") | Añadir monitor sobre el endpoint del bot en el VPS + alerta de proceso muerto |
| **Fase B Cloudflare (dominio propio)** | Cloudflare Uptime gratis en el dashboard para las 4 webs (el de UptimeRobot puede quedarse para Supabase/bot) |
| Caídas reales recurrentes | Revisar si hace falta Better Stack (mejor UI) o checks de más intervalos |

**Alternativas evaluadas**: Uptime Kuma (OSS, pero se auto-hospeda → en el PC del usuario
= inútil como monitor externo), Better Stack (free 10 checks/3 min, mejor UI), HetrixTools,
Pingdom (caro), Cloudflare Uptime (Fase B). UptimeRobot elegido por: gratis (50 checks),
sin tarjeta, login Google, alertas múltiples y status page.

> **Nota 2026-08-15**: Better Stack entró al stack por su **logging** (no por uptime).
> Los logs de server del ecosistema viajan con `@logtail/pino` desde
> `@ciszunetwork/utils/logger` (token `BETTERSTACK_TELEMETRY_TOKEN` en vault). El uptime
> sigue en UptimeRobot; las 10 monitores starter de Better Stack y su status page quedan
> como opción si UptimeRobot se queda corto.

---

## Referencias

- `CLOUDFLARE_SYSTEM.md` — tabla de capas + Fase B (Uptime de Cloudflare con dominio).
- `RAG_VECTORS_PLAN.md` — la otra tarea del toDo evaluada (Pinecone → pgvector).
- Heartbeat del bot: `AGENTS.md` → sección CiszuBot (bot_status cada 60s).

## Conceptos de monitoreo (contexto informático)

| Término | Definición |
|---|---|
| **Uptime** | Disponibilidad de un servicio |
| **Monitor** | Chequeo periódico de un endpoint |
| **HTTP(s) monitor** | Petición a una URL cada intervalo |
| **Keyword check** | Busca una cadena en la respuesta |
| **Status page** | Página pública de estado |
| **Heartbeat** | Señal interna de vida de un servicio |
| **Alert contact** | Destino de notificaciones (email, Telegram, webhook) |
| **Timeout** | Tiempo máximo de espera de respuesta |
| **Interval** | Frecuencia del chequeo |

## Cómo crear un monitor (resumen rápido)

1. Login Google → My Settings → Add New Monitor.
2. Tipo HTTP(s), URL, intervalo 5 min, timeout 30s.
3. Keyword si aplica (alert on contains).
4. Headers custom para el monitor de Supabase (apikey, Bearer, Accept-Profile).
5. Alert contacts: email + Telegram + webhook ntfy.

## Verificación manual

```bash
# webs (deben contener el keyword)
curl -s https://ciszunetwork.vercel.app | Select-String "Ciszu Network"
curl -s https://ciszubot.vercel.app | Select-String "CiszuBot"

# Supabase bot_status
curl -s "https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/bot_status?select=*&limit=1" `
  -H "apikey: <ANON>" -H "Authorization: Bearer <ANON>" -H "Accept-Profile: ciszubot"
```

## Alertas y escalado

| Evento | Notificación |
|---|---|
| Web caída | ntfy push + email + Telegram |
| Keyword no encontrado | Idem |
| Supabase/PostgREST caído | Idem |
| Bot apagado (heartbeat) | Detectado por la web (`last_seen`) — no por UptimeRobot |

## Pendientes futuros

- [ ] Bot en VPS → monitor sobre el endpoint del bot + alerta de proceso muerto.
- [ ] Fase B Cloudflare → Cloudflare Uptime en el dashboard.
- [ ] Status page pública opcional (transparencia).

## Tipos de checks en UptimeRobot

| Monitor | Cuándo / para qué |
|---|---|
| **HTTP(s)** | Petición GET a la URL; es la base de los 5 monitores actuales |
| **Keyword** | Valida que una cadena aparezca en el body (los 5 usan "contains") |
| **Ping** | Comprueba disponibilidad de una IP (útil si el bot pasa a VPS con IP propia) |
| **Port** | Comprueba un puerto TCP abierto (p.ej. `:5000` del panel del bot en VPS) |
| **Heartbeat** | El servicio llama a una URL cada N segundos (alternativa al keyword cuando haya endpoint propio del bot) |

Los **maintenance windows** permiten pausar alertas en ventanas conocidas (deploys,
migraciones) sin bajar el monitor.

## Elección de keywords

- Usar texto estable visible en el HTML (títulos u opengraph), no texto dinámico
  (fechas, contadores) para evitar falsos negativos.
- Keywords confirmados por curl: `Ciszu Network`, `Ciszuko Antony`, `MuzicMania`,
  `CiszuBot`, y `"online":true` en el JSON del monitor de Supabase.
- Con keyword "must NOT contain" se puede alertar cuando aparece algo anómalo (p.ej. un
  error stack en la respuesta) en vez de solo por ausencia.

## Cómo interpretar una caída

1. Confirmar con `curl` manual (§Verificación manual) si sigue caído o es un falso positivo.
2. Revisar Vercel (deploys fallidos, uso) y el status page de Supabase antes de tocar código.
3. Si es un 5xx del proyecto Vercel, los logs de la función y `ERRORS_SYSTEM.md` (Sentry)
   dan la causa de la excepción.
4. Distinguir los dos escenarios: web no responde (Vercel/Supabase) vs bot apagado
   (heartbeat interno — la lógica `last_seen < 3 min` de la web).

## Troubleshooting de monitores

| Problema | Solución |
|---|---|
| Falso positivo en keyword | Afinar el keyword a un texto estable (ver elección de keywords) |
| Monitor de Supabase siempre down | Verificar los 3 headers (§2) y que exista la fila en `bot_status` |
| Alertas que no llegan | Revisar Alert Contacts (email/Telegram/ntfy) y la bandeja de spam |
| Timeout con webs Vercel en cold start | Subir el timeout del monitor (free: máx 30s) |
| Doble alerta por el mismo evento | Aceptar: email/Telegram/ntfy son canales del mismo evento, no dos monitores |

## Relación con otros sistemas

- `ERRORS_SYSTEM.md` — Sentry captura errores runtime ("por qué explotó"); UptimeRobot
  detecta la caída del servicio ("está caído"). Complementarios.
- `ANALYTICS_SYSTEM.md` — PostHog/Cloudflare Analytics miden tráfico, no disponibilidad.
- `CLOUDFLARE_SYSTEM.md` — Fase B: Cloudflare Uptime puede complementar/sustituir para las webs.
- `VPS_PLAN.md` — cuando el bot vaya a VPS 24/7: monitor del endpoint del bot + alerta de
  proceso muerto.
- `SCHEDULE_PROTOCOLS.md` — ventanas de mantenimiento y horarios de verificación manual.

## Preguntas frecuentes

**¿Por qué monitor externo y además heartbeat?** El heartbeat solo avisa si alguien abre la
web; UptimeRobot avisa 24/7 sin estar delante del PC.

**¿Por qué no Uptime Kuma?** Es self-hosted: corriendo en el PC del usuario valdría igual
que nadie (si el PC cae, el monitor cae con él).

**¿Cuántos monitores caben en el free?** UptimeRobot free: 50. Se usan 5 (4 webs +
`supabase-bot-status`).

**¿Nueva web/CiszuBot API?** Añadir su monitor con el checklist de keyword y alertas
correspondiente.

_Última revisión: 13 ago 2026._ Relacionado: `CLOUDFLARE_SYSTEM.md`, `RAG_VECTORS_PLAN.md`,
`ERRORS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`, `SCHEDULE_PROTOCOLS.md`.
