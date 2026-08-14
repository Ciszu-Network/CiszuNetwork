# CORS — Sistema, verificación y plan de implementación futura (11 ago 2026)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: CORS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: documento maestro del matiz "CORS" del toDo de BD. Conclusión verificada:
> CORS NO es aplicable en la API REST de Supabase; explica por qué, qué protección real
> sustituye al CORS y el plan para implementarlo cuando sea necesario.

> **Doc maestro del matiz "CORS" del toDo de BD** (`services/supabase/docs/documentation/TODO.md`).
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
| **Cloudflare Fase B (dominio propio)** | **SÍ — WAF rules + rate limiting edge** (filtrado a nivel de red) | Pendiente de dominio (Fase B CLOUDFLARE_SYSTEM.md) |

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
- Ver `CLOUDFLARE_SYSTEM.md` (Fase B requiere dominio propio, pendiente).

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

## Conceptos de CORS (contexto informático)

| Término | Definición |
|---|---|
| **CORS** (Cross-Origin Resource Sharing) | Mecanismo del navegador para leer respuestas cross-origin |
| **Origin** | Origen de una petición (esquema + dominio + puerto) |
| **Cross-origin** | Petición entre orígenes distintos |
| **Preflight (OPTIONS)** | Petición previa para pedir permisos CORS |
| **Access-Control-Allow-Origin** | Cabecera que permite un origen |
| **Same-origin policy** | Regla del navegador: solo leer del mismo origen por defecto |
| **WAF** (Web Application Firewall) | Filtro de tráfico a nivel de red |
| **JWT** | Token de sesión firmado |
| **RLS** | Filtrado de filas en BD por usuario |

## Preguntas frecuentes

**¿CORS protege contra ataques?** No realmente: solo aplica a navegadores. curl/bots/scripts
lo ignoran. La protección real son JWT + RLS + rate limits.

**¿Supabase permite restringir orígenes en REST?** No. `Access-Control-Allow-Origin: *`
es fijo en PostgREST. La allowlist solo existe en Realtime.

**¿Cuándo implementar filtrado por origen?** Solo con dominio propio, APIs públicas para
terceros, o requisito de auditoría (ver criterios de activación en §4).

**¿Ya estamos protegidos sin CORS?** Sí: RLS deny-all + policies por uid, rate limits,
API routes server-side y JWT cubren el acceso real.

## Resumen de acciones

| Acción | Estado |
|---|---|
| Verificar estado CORS de PostgREST | ✅ ACAO `*` (conclusión registrada) |
| Documentar protección real (JWT/RLS/rate limit) | ✅ Este documento |
| Plan Fase 1 (API routes con validación de origen) | ⏳ Opcional, solo si aplica criterio |
| Plan Fase 2 (WAF Cloudflare con dominio) | ⏳ Pendiente de dominio (Fase B) |

## El flujo CORS en detalle

Cuando un navegador hace una petición cross-origin con métodos que requieren preflight
(PUT, PATCH, DELETE, custom headers, `Content-Type: application/json`), primero envía un
**preflight**: un OPTIONS con cabeceras `Access-Control-Request-Method` y
`Access-Control-Request-Headers`. Si el servidor responde con 200 y las cabeceras
`Access-Control-Allow-*` correctas, el navegador emite la petición real. Las peticiones
"simples" (GET/POST con headers estándar y body textual) no llevan preflight.

En PostgREST todo fetch con `apikey`/`Authorization` provoca preflight — por eso la
verificación de §2 usa OPTIONS. Mientras el preflight devuelva `Access-Control-Allow-Origin: *`
(el caso verificado), los navegadores dejan pasar la petición desde cualquier origen, y la
decisión de permitir o negar queda en las capas JWT + RLS + rate limits.

## Cabeceras CORS relevantes

| Cabecera | Función |
|---|---|
| `Access-Control-Allow-Origin` | Orígenes permitidos para leer la respuesta (`*` = cualquiera) |
| `Access-Control-Allow-Methods` | Métodos permitidos en el preflight |
| `Access-Control-Allow-Headers` | Headers de petición permitidos (p.ej. `apikey`, `authorization`) |
| `Access-Control-Allow-Credentials` | Permite cookies/credenciales cross-origin |
| `Access-Control-Expose-Headers` | Headers de respuesta visibles al navegador |
| `Vary: Origin` | Hace cacheable la respuesta según el `Origin` |

> Nota: `Access-Control-Allow-Credentials: true` con `Allow-Origin: *` es inválido por
> especificación — si algún día se usan cookies en las API routes propias (Fase 1), esa ruta
> debe devolver el origen concreto, no `*`.

## Troubleshooting de CORS

| Síntoma | Causa | Solución |
|---|---|---|
| Error "No 'Access-Control-Allow-Origin'" en consola | El servidor no devuelve la cabecera | Verificar con `curl -i -X OPTIONS` y corregir la ruta propia |
| Preflight 4xx/5xx | El endpoint OPTIONS no está soportado | En Next.js route handlers el runtime responde OPTIONS automáticamente |
| `Access-Control-Allow-Origin: *` visible | Comportamiento esperado de PostgREST | No cambiar; la protección real es JWT + RLS (§2) |
| Bloqueo por CORS policy al usar cookies | `Allow-Credentials` se combinó con `*` | Devolver el origen concreto en la ruta afectada |

## Relación con otros sistemas

- `SECURITY_PROTOCOLS.md` — RLS, rate limits y JWT son la capa de protección real (§2);
  CORS nunca debe tratarse como control de acceso.
- `BACKEND_SYSTEM.md` — las API routes de Vercel son el lugar donde SÍ aplica validar
  `Origin`/`Referer` (Fase 1).
- `CLOUDFLARE_SYSTEM.md` — Fase B: WAF rules y rate limiting edge como filtro por origen
  a nivel de red (Fase 2).
- `CDN_SYSTEM.md` — el bucket `ciszu-cdn` es público por diseño; CORS no aplica ahí.
- `DOMAINS_SYSTEM.md` — los orígenes finales de la allowlist dependerán de los dominios
  definitivos (Fase B).

## Checklist de filtrado por origen (solo si aplica Fase 1/2)

- [ ] Confirmar que la ruta es mutante o consume un servicio externo (si no, no filtres).
- [ ] Leer `Origin`; si viene, validar contra la allowlist. Usar `Referer` como fallback
      para clientes sin `Origin` (Tauri, nativos).
- [ ] No bloquear peticiones sin `Origin` (downloads, iframes, curl) sin probar el flujo real.
- [ ] Mantener rate limits y auth por encima del filtro de origen (no duplicar responsabilidad).
- [ ] Verificar con `curl` desde un Origin ajeno (debe fallar/403) y desde uno permitido.

_Última revisión: 13 ago 2026._ Relacionado: `BACKEND_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`CLOUDFLARE_SYSTEM.md`, `DOMAINS_SYSTEM.md`, `CDN_SYSTEM.md`.
