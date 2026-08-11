# CORS — Sistema, verificación y plan de implementación futura (11 ago 2026)

> **Doc maestro del matiz "CORS" del toDo de BD** (`services/supabase/docs/documentation/toDo.md`).
> Conclusión verificada: **CORS NO es aplicable en la API REST de Supabase** (ni hoy ni en
> ningún plan). Este documento explica por qué, qué protección real sustituye al CORS, dónde
> SÍ sería aplicable y **el plan para implementarlo cuando sea necesario** (Cloudflare Fase B
> / API routes propias).

---

## 1. Qué es CORS y qué protege (y qué NO)

**CORS (Cross-Origin Resource Sharing)** es un mecanismo del **navegador**, no de red:

- Decide qué **páginas web** pueden **leer** la respuesta del backend cuando el navegador del
  usuario hace una petición cross-origin (fetch/XMLHttpRequest).
- **NO protege contra** llamadas no-navegador: `curl`, scripts de servidor, bots, apps de
  escritorio (Tauri), Postman, etc. Un atacante con `curl` llama al backend igual aunque
  CORS sea restrictivo.
- Por eso "configurar CORS para que solo CiszuNetwork haga peticiones" **no es una medida de
  seguridad real** contra ataques — es una medida de confort para navegadores.

## 2. Estado verificado en Supabase (11 ago 2026)

Verificación real con OPTIONS a PostgREST:

```
OPTIONS https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/
→ 200
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,TRACE,CONNECT
```

- **`Access-Control-Allow-Origin: *` fijo** en la API REST (PostgREST). Es decisión de diseño
  de Supabase: **no existe opción** en Dashboard ni en la Management API para restringir
  orígenes de la REST. No es limitación del plan Free — el producto no lo implementa.
- La allowlist de orígenes que ofrece Supabase solo existe en **Realtime** (websockets).

### La protección real que sustituye al CORS (YA implementada, migración 16)

| Capa | Qué hace |
|---|---|
| **JWT** | Sin token válido no hay sesión (anon sin JWT no pasa del deny-all) |
| **RLS deny-all + policies por uid** | 28/28 tablas con RLS; cada policy decide qué puede leer/escribir cada rol (`(SELECT auth.uid())`) |
| **Rate limits** (`@ciszunetwork/utils`) | Endpoints mutantes: 10–30/min por IP → 429 |
| **API routes server-side** | Datos personales NUNCA vía PostgREST anon → rutas propias en Vercel con service_role + rate limit |

→ "Solo CiszuNetwork puede hacer peticiones al backend" se cumple por estas capas: un POST
anónimo sin JWT → `permission denied` (RLS); un POST con JWT de otro usuario → policy lo
rechaza. El origen del navegador es irrelevante.

## 3. Dónde SÍ es aplicable (referencia futura)

| Lugar | Aplicable | Estado hoy |
|---|---|---|
| **Supabase Realtime** (websockets) | Sí — allowlist de orígenes en Dashboard → Realtime | No se usa realtime (sin acción) |
| **Supabase Auth (OAuth)** | Parcial — `Site URL` + `Allowed redirect URLs` controlan los redirects de terceros | Ya configurado (Discord OAuth dashboard) |
| **Supabase Storage** | Config CORS por bucket (uploads desde navegador) | Buckets públicos por diseño (sin acción) |
| **API routes propias (Vercel)** | **SÍ — validar `Origin`/`Referer` en rutas mutantes** | Opcional hoy; rate limits + auth ya cubren |
| **Cloudflare Fase B (dominio propio)** | **SÍ — WAF rules + rate limiting edge** (filtrado a nivel de red) | Pendiente de dominio (Fase B CLOUDFLARE_SISTEMA.md) |

## 4. Plan de implementación futura (CUÁNDO y CÓMO)

> Este plan solo se ejecuta cuando haya necesidad real (dominio propio, APIs abiertas a
> terceros, auditoría externa que lo exija). Hoy NO hay acción pendiente.

### Fase 1 — API routes propias (sin dominio, aplicable YA si se quisiera)
En las rutas de Vercel que mutan datos (`/api/*` POST), validar el origen:
```ts
// helper opcional en @ciszunetwork/utils (futuro)
const origin = request.headers.get('origin');
const allowed = new Set(['https://ciszunetwork.vercel.app', 'https://ciszukoantony.vercel.app', 'https://muzicmania.vercel.app', 'https://ciszubot.vercel.app']);
if (origin && !allowed.has(origin)) return new Response('Forbidden', { status: 403 });
```
- Verificar `Referer` como fallback para clientes sin `Origin` (Tauri, nativos).
- Mantener los rate limits existentes (no duplicar responsabilidad).

### Fase 2 — Cloudflare (dominio propio, Fase B del sistema Cloudflare)
- Al mover DNS a Cloudflare con proxy: añadir **WAF rule** de "validate origin/referer" para
  las rutas `/api/*` de cada web (solo los dominios de Ciszu Network permitidos).
- **Rate limiting edge** de Cloudflare (gratis hasta 10k req/mes) como capa global antes de
  llegar a Vercel — complementa al rate limit en memoria de `@ciszunetwork/utils`.
- Ver `CLOUDFLARE_SISTEMA.md` (Fase B requiere dominio propio, pendiente).

### Criterios de activación (¿cuándo hacer Fase 1 o 2?)
- [ ] Se abre una API pública consumible por terceros (p.ej. stats del bot vía REST).
- [ ] El dashboard de ciszubot pasa a multi-origen (dominio real + vercel.app).
- [ ] Auditoría externa o cliente exige restricción de orígenes en las API routes.
- [ ] Se implementa la Fase B de Cloudflare (dominio).

## 5. Cómo re-verificar el estado

```bash
# CORS de PostgREST (debe seguir ACAO: *)
curl -s -i -X OPTIONS "https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/" -H "apikey: <anon>"
# Grants anon (debe seguir limpio — solo lo público intencional)
dbvr sql -ds=supabase "SELECT grantee, table_schema, table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee='anon'"
# RLS activo (28/28)
dbvr sql -ds=supabase "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname IN ('muzicmania','ciszubot','ciszunetwork','public')"
```

---
**Conclusión**: CORS en Supabase REST = inaplicable por diseño del producto; la seguridad
real ya está (JWT + RLS + rate limits + API routes). Si algún día se necesita filtrado por
origen, es en las API routes de Vercel (Fase 1) o en Cloudflare (Fase 2), no en PostgREST.
