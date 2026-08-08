# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

- [ ] Replantear si utilizar WebP o AVIF en vez de PNG, JPEG (JPE, JPG), TIFF, BMP Y GIF.
- [x] Sistema de caché con Redis — evaluado 8 ago 2026, diferido hasta métricas (ver plan abajo).

## Sistema futuro de caché (Redis y alternativas) — EVALUADO 8 ago 2026

> **Estado**: diferido. No es necesario hoy. Este es el plan de acción por fases,
> activado solo por métricas reales, con alternativas gratis (sin tarjeta) y sin
> romper los sistemas existentes.

### ¿Para qué sirve una caché como Redis?

Redis es una base de datos **en memoria** (key-value store) que guarda los datos en
RAM y los lee en **~0.5 ms** (vs 5–50 ms de Postgres), sin tocar disco. No es un
framework de la app: es un servicio de infraestructura independiente que se
conecta desde el código.

- **Volátil por diseño**: si muere, se regenera todo desde la fuente real.
- **Nunca es la fuente de verdad**: solo acelera lecturas repetidas.
- Casos de uso: lecturas repetidas, sesiones, rate-limiting, contadores atómicos.

### ¿Dónde se aplicaría en nuestro ecosistema? (solo si aparecen estos casos)

1. **Leaderboard de MuzicMania** — muchas peticiones GET a la misma consulta → cache TTL 60s.
2. **Dashboard OAuth de CiszuBot** — `getGuildsForUser` repetitivo → cache 60s.
3. **Rate-limiting** en `/api/auth` y el webhook `POST /api/votes` si hay abuso.
4. **Contadores activos** (votos top.gg) con `INCR` (incremento atómico).

### Fases (todas gratis y sin tarjeta de crédito, en orden de prioridad)

**Fase 1 — Caché dentro de la app (hoy ya posible, cero coste):**

- `unstable_cache` de Next.js (React Server Components) cachea las respuestas de
  fetch/Supabase en memoria del server; TTL configurable.
- ISR (ya usado en ciszubot con `revalidate = 60`) prerenderiza sin CDN extra.
- Quién lo necesita para los casos 1 y 2. Cubre el 90% del plan con cero infra.

**Fase 2 — Vercel KV (Upstash):** si la Fase 1 se queda corta (picos,
rate-limiting en Supabase expuesto). Gratis por el tier (≈10k operaciones/día,
suficiente para nuestro volumen). No requiere tarjeta de usuario final, se
conecta con el SDK de Vercel y se integra con `unstable_cache`.

**Fase 3 — Caché propia en Supabase (plan B sin servicios nuevos):**

- Tabla `cache` con clave + valor + expires_at en Postgres. Cero
  dependencia extra, TTL controlado. Más lenta que Redis pero cubre casos 1 y 2.

**Fase 4 — Redis self-host (DESCARTADA por ahora):** exige VPS, mantenimiento,
seguridad y pago de tarjeta → sobreingeniería total para el volumen actual.

**Reglas de seguridad (para no dañar nada existente):**

1. La caché **siempre** regenerable desde la fuente (si falla, volver a leer de
   la BD sin error visible).
2. TTL corto inicialmente (≤ 60s) — nunca mostrar datos viejos por más que TTL
   pequeño.
3. Invalidación manual: al escribir (nuevo score, config de guild) borrar la clave.
4. Separación de responsabilidades: CDN (assets), caché (lecturas dinámicas),
   Postgres (verdad única). Nunca mezclar.
5. Medir antes de invertir: sin métricas que lo justifiquen, no se toca nada.

**Conclusión**: hoy no hay nada que hacer (ISR + CDN + Service Worker de la
PDWA ya cachean lo necesario). El plan queda activado por métricas: si el
tráfico sube y aparece p95 > 200 ms, rate-limiting en Supabase o pico en
leaderboard → aplicar Fase 1 y evaluar Fase 2.
