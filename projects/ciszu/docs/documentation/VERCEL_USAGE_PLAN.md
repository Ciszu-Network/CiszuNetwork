# VERCEL_USAGE_PLAN — Límites, pausa y prevención de consumo

**Versión:** 1.0
**Actualización:** 2026-11-10
**Identificador:** VERCEL_USAGE_PLAN
**Definición:** diagnóstico y plan operativo para la pausa por fair use de Vercel, causas del consumo, recuperación y reglas para no volver a exceder los límites del plan Hobby.

---

## 1. Estado actual

El equipo `Ciszu Network` quedó pausado por Vercel:

- Motivo principal: **Fluid Active CPU**.
- Consumo: **6h 45m / 4h** en los últimos 30 días.
- ISR Writes: **270K / 200K**.
- Build Time: **102h / 100h**.
- Pausa: desde el **7 de noviembre de 2026**.
- Fin estimado: **7 de diciembre de 2026**.
- Las cuatro webs responden **HTTP 402** mientras dure la pausa.
- Los deploys están bloqueados con `Your Team exceeded our fair use limits and has been blocked`.

Vercel no pausa por un solo deploy: el equipo acumuló consumo de cómputo, revalidaciones ISR y builds durante 30 días.

## 2. Qué mide cada límite

### 2.1 Fluid Active CPU

Tiempo de CPU realmente ejecutado por funciones Fluid, no tiempo de espera de red. Un endpoint que espera Supabase no consume CPU mientras espera, pero sí consume al serializar, renderizar, validar y procesar respuestas.

Consumo actual: **6h 45m**. Límite Hobby: **4h**.

### 2.2 ISR Writes

Cada revalidación de una página ISR escribe una nueva entrada en la caché. `revalidate = 60` implica reescribir la página cada minuto, multiplicado por regiones, rutas y demanda.

Consumo actual: **270K**. Límite Hobby: **200K**.

### 2.3 Build Time

Tiempo de construcción de deployments. Cuatro webs desplegando en cada push, más reintentos automáticos, multiplican el coste.

Consumo actual: **102h**. Límite Hobby: **100h**.

## 3. Causas identificadas

### 3.1 ISR writes

- `projects/ciszubot/website/src/app/page.tsx` tenía `revalidate = 60` y un `fetch` con `next.revalidate = 60`.
- `projects/ciszu/website/src/app/donate/page.tsx` tenía `revalidate = 300`.
- Las páginas de changelog mantienen `revalidate = 3600`, que es razonable.

La home del bot era la principal fuente de reescrituras: una página cada minuto, en varias regiones, durante 30 días.

### 3.2 Build time

Los cuatro workflows de deploy se disparaban en **cualquier push a main**, sin filtros de rutas. Un cambio de documentación, un cambio del bot o un cambio de MuzicMania provocaba hasta cuatro builds completos del monorepo.

Además, `ensure-deploys.yml` relanzaba deploys fallidos cada hora. Durante la pausa, esos reintentos solo consumían Actions y llamadas a Vercel sin posibilidad de éxito.

### 3.3 Fluid Active CPU

Las fuentes principales son:

- Funciones API con `force-dynamic` y varias consultas a Supabase por request.
- Polling de depuración cada 60 segundos para usuarios autenticados.
- Polling de salas de multijugador cada 2,5–4 segundos y chat global cada 5 segundos.
- Endpoints públicos sin caché de CDN (`packages`, `items`, `levels`, `official`).
- Renderizado dinámico de dashboards y páginas con sesión.
- Reintentos y builds no relacionados con el tráfico real.

El objetivo no es eliminar funciones, sino reducir invocaciones y hacer que las rutas públicas usen la caché de Vercel.

## 4. Correcciones aplicadas

### 4.1 ISR

- Home de CiszuBot: `revalidate` de **60 → 3600** (y el fetch interno igual).
- Donate de CiszuNetwork: `revalidate` de **300 → 3600**.

Esto reduce las reescrituras de la home del bot de 1.440/día a 24/día por región.

### 4.2 Builds

- Cada workflow de deploy tiene ahora filtros `paths`:
  - `deploy-ciszunetwork-website.yml` solo con cambios de `projects/ciszu/website`, paquetes, shared y lockfiles/config raíz.
  - `deploy-ciszubot-website.yml` solo con cambios de `projects/ciszubot/website`, paquetes y raíz.
  - `deploy-ciszukoantony-website.yml` solo con cambios de `projects/ciszukoantony/website`, paquetes y raíz.
  - `deploy-muzicmania-website.yml` solo con cambios de `projects/muzicmania/website`, paquetes y raíz.
- Un cambio de documentación ya no dispara ningún deploy.
- Un cambio aislado de una web solo construye esa web.

### 4.3 Pausa controlada

- Variable de repositorio `VERCEL_PAUSED=true`.
- Los cuatro workflows de deploy y `ensure-deploys.yml` tienen `if: vars.VERCEL_PAUSED != 'true'`.
- Mientras la cuenta esté pausada, no se intenta desplegar ni se reintenta cada hora.
- Para reanudar cuando Vercel lo permita:

```bash
gh variable set VERCEL_PAUSED --body "false"
gh workflow run deploy-muzicmania-website.yml -f environment=production
```

### 4.4 CPU y funciones

- `DebugProvider` ya no consulta `/api/debug/status` cada 60s para todos: solo consulta si el usuario está autorizado y cada **300s**.
- Polling de salas multijugador: **10s** para la lista, **5s** para la sala.
- Chat global de la sala: **15s**; el chat de sala usa Realtime.
- `GET /api/shop/packages`: caché pública **300s**.
- `GET /api/shop/items`: caché pública **120s** para anónimos; privada para usuarios con sesión.
- `GET /api/levels`: caché pública **120s** para exploración; privada para `mine/admin`.
- `GET /api/levels/official`: caché pública **300s**.
- Impresiones de anuncios: pasan de la función `/api/ads/impression` a INSERT directo en Supabase (`ciszunetwork.ads_impressions`), eliminando una invocación de Vercel por cada anuncio mostrado.

## 5. Acción inmediata

La pausa no se puede levantar con código. Hay dos caminos:

1. **Upgrade a Vercel Pro** (recomendado si las webs deben estar online ahora). Pro elimina la pausa de Hobby y da límites de producción. Hay que revisar el coste y configurar alertas de gasto.
2. **Esperar al 7 de diciembre de 2026** y desplegar con los cambios de reducción ya aplicados.

No se debe crear otra cuenta/team para evadir la pausa: puede violar los términos y fragmentar el proyecto.

## 6. Prevención

### 6.1 Antes de cada deploy

- Verificar que el cambio pertenece a la web que se va a desplegar.
- No hacer pushes de documentación esperando deploy.
- No usar `workflow_dispatch` para probar producción si no hay cambio funcional.
- Un solo deploy por cambio relevante.

### 6.2 Presupuesto mensual

- Fluid CPU: mantener < 2h/mes (50% del límite Hobby).
- ISR writes: mantener < 100K/mes (50%).
- Build time: mantener < 50h/mes (50%).
- Deployment storage: < 7GB.
- Functions storage: < 8GB.

Si se supera el 60% de cualquier métrica, revisar antes de hacer más cambios.

### 6.3 Reglas de diseño

- Preferir static/ISR de larga duración (`3600` o `86400`) sobre `revalidate` corto.
- No poner `revalidate = 60` en páginas de contenido que no cambia cada minuto.
- APIs públicas: `s-maxage` + `stale-while-revalidate`.
- APIs privadas: `no-store` consciente y sin polling agresivo.
- Polling de estado: 10–60s según criticidad; Realtime cuando sea posible.
- Debug: solo staff autorizado, intervalo ≥5 min.
- Todo endpoint POST: rate limit, idempotencia y sin bucles de reintento.
- Evitar `force-dynamic` en páginas que pueden ser estáticas.
- No usar Vercel Functions para servir assets ni para proxies que el CDN puede resolver.

### 6.4 Alertas

- Configurar alertas de uso en el dashboard de Vercel al 50%, 75% y 90%.
- Revisar el uso cada lunes.
- Revisar los logs de funciones por rutas con más CPU si se dispone de Observability Plus.
- Si se contrata Pro, definir un presupuesto de gasto y alertas de facturación.

## 7. Consecuencias de no corregirlo

- Pausa total de las cuatro webs hasta el siguiente ciclo.
- Deploys bloqueados.
- Pérdida de tráfico, confianza y conversiones.
- Riesgo de bloqueo repetido cada mes.
- Imposibilidad de usar Vercel para producción mientras el consumo supere el fair use.
- Coste de migración de emergencia a otro proveedor.

## 8. Runbook de recuperación

1. Confirmar que Vercel levantó la pausa o que se contrató Pro.
2. Setear `VERCEL_PAUSED=false` en GitHub.
3. Verificar que los deploys tienen `paths` y que no hay pushes pendientes.
4. Revisar `pnpm audit` y CI.
5. Desplegar una sola web primero (MuzicMania o la de menor riesgo).
6. Verificar 200, funciones críticas y logs.
7. Desplegar el resto.
8. Revisar el uso a las 24h y 72h.
9. Si el consumo vuelve a subir, desactivar features no críticas antes de tocar límites.

## 9. Relacionados

- `STORE_ECONOMY_PLAN.md` — economía y tienda.
- `STORE_ECONOMY_PHASE1_IMPLEMENTATION_PLAN.md` — implementación de tienda.
- `PROJECT_STATE.md` — estado vivo.
- `TODO.md` — hoja de ruta de Ciszuko Antony.
- `MONITORING_SYSTEM.md` — uptime y alertas.

---

_Última revisión: 10 nov 2026. Pausa activa hasta el 7 de diciembre; `VERCEL_PAUSED=true` evita reintentos._
