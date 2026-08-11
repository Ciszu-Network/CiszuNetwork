# Sistema de monitoreo externo (UptimeRobot) — Ciszu Network

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

---

## Referencias

- `CLOUDFLARE_SYSTEM.md` — tabla de capas + Fase B (Uptime de Cloudflare con dominio).
- `RAG_VECTORS_PLAN.md` — la otra tarea del toDo evaluada (Pinecone → pgvector).
- Heartbeat del bot: `AGENTS.md` → sección CiszuBot (bot_status cada 60s).
