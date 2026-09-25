# RAG_VECTORS_PLAN — Plan de base de datos vectorial (RAG / búsqueda semántica) — Ciszu Network

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: RAG_VECTORS_PLAN_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: plan de base de datos vectorial para RAG/búsqueda semántica. Estado: plan
> a futuro (aprobado 10 ago 2026). Decisión: **pgvector en Supabase**, NO Pinecone.

> **Estado**: PLAN A FUTURO (aprobado 10 ago 2026). Sin implementación por ahora.
> Decisión: **pgvector en Supabase** (nuestra BD actual), NO Pinecone.
> Origen: toDo "Considerar Pinecone como base de datos de vectores" (resuelto con este
> análisis).

---

## 1. Qué es esto (terminología)

- **Embeddings**: números que representan el *significado* de un texto/audio/imagen
  (generados por modelos de IA). P.ej. "canción nostálgica con synth" y "un tema ochentero"
  quedan cerca matemáticamente, aunque no compartan palabras.
- **Búsqueda semántica / vectorial**: buscar por significado, no por palabras exactas.
- **RAG (Retrieval-Augmented Generation)**: darle a un LLM contexto extraído de tus
  documentos (ej. reglas del server) para que responda con datos reales en vez de alucinar.
- **BD vectorial**: guarda y consulta embeddings por similaridad (cercanía).

---

## 2. Decisión: pgvector (Supabase) — NO Pinecone

| Criterio | pgvector (Supabase) | Pinecone |
|---|---|---|
| Coste hoy | **$0** (plan actual, extensión incluida) | Free 2GB ~300K vectores, SOLO prueba (429 al superar reads) |
| Coste producción | $0 Free / $25 Pro (8GB, **queries ilimitadas**) | **Standard $50/mes mínimo** (aunque el uso valga $5) + $0.33/GB + $16-18/M reads |
| Integración | Vectores **junto a los datos relacionales**, SQL, RLS (`auth.uid()` funciona) | Servicio aparte, sin SQL/joins, eventual consistency |
| Rendimiento | Iguala o supera a Pinecone hasta ~10-20M vectores (benchmarks Supabase 2023-2026) | Gana a **cientos de millones/billones** de vectores o QPS extremo — escala que Ciszu no alcanza |
| Operación | HNSW + tuning (poco, en nuestro volumen) | Cero operación (serverless) — la única ventaja real, y solo a escala masiva |
| Migración futura | — | Cambiar cliente/URL (nodo de n8n o similar), NO reescritura |

**Conclusión corto plazo**: Pinecone es 2-3× el coste de toda nuestra infraestructura.
**Conclusión largo plazo**: incluso con crecimiento agresivo (cientos de miles de vectores)
pgvector aguanta; el punto donde Pinecone gana no existe en ningún caso de uso nuestro.

---

## 3. Casos de uso reales (disparadores de implementación)

| # | Caso | Dónde | Vectores estimados |
|---|---|---|---|
| 1 | **Búsqueda semántica de canciones** ("algo épico para la noche" → tracks de Genesis Neon) | MuzicMania (página/library + API) | Decenas-cientos (1 por track) → con fragmentos, miles |
| 2 | **RAG del bot de Discord** (responder con las reglas, guías y docs reales del server) | Bot ciszubot | Miles (fragmentos de docs) |
| 3 | Búsqueda del portfolio/CDN por descripción ("el logo rosa del isotype") | ciszukoantony | Miles |
| 4 | Memoria de sesiones del agente IA (opencode) | Interno | Especulativo, después de 1-3 |

**Embeddings**: generar con modelos gratis/baratos — Gemini `text-embedding-004` (gratis
por API key existente `GEMINI_API_KEY`) o Hugging Face (gratis). Coste ≈ $0 en nuestra
escala. Sin embeddings no hay vector search (son el insumo).

---

## 4. Implementación futura (pasos, cuando haya disparador)

1. Activar extensión en Supabase: `create extension if not exists vector;` (migración).
2. Tabla por caso de uso (p.ej. `muzicmania.track_embeddings`):
   `track_id uuid references tracks, embedding vector(768/1536), content text, metadata jsonb`
   + `ENABLE ROW LEVEL SECURITY` + policy (deny-all; los reads públicos por policy si el
   caso lo requiere — checklist de seguridad de AGENTS.md aplica).
3. Índice HNSW: `create index ... using hnsw (embedding vector_cosine_ops);`
4. Función de búsqueda (INVOKER, search_path fijo, sin EXECUTE anon salvo necesidad):
   `match_tracks(query_embedding vector, match_count int)` → `ORDER BY embedding <=> query`.
5. Job de generación de embeddings (script) + endpoint con rate limit
   (`createRateLimiter`) + caché (sistema multi-tienda existente).

---

## 5. Alternativas evaluadas

- **Pinecone**: descartado (ver §2). Queda como escape hatch a escala masiva.
- **Qdrant / Weaviate / Milvus**: motores dedicados self-hosted o cloud — coste, operación
  y sin ventaja sobre pgvector en nuestro volumen (Qdrant self-hosted ~$150-300/mes infra).
- **Chroma**: solo prototipado local.
- **Cloudflare Vectorize**: requiere tarjeta para activar (igual que R2) + sin SQL/RLS.
- **pgvectorscale / Timescale**: optimización futura dentro de Postgres si el volumen crece.

Regla (igual que el plan de auth): **no añadir un servicio nuevo mientras el stack actual
cubra**; pgvector es el stack actual.

---

## 6. Cuándo activar

| Disparador | Acción |
|---|---|
| Se pide "buscar canciones por descripción/vibra" en MuzicMania | Implementar caso 1 con pgvector (~medio día) |
| El bot necesita responder con contexto de docs | Implementar caso 2 (RAG) con pgvector |
| Cualquiera de los dos funciona y el volumen crece >20M vectores | Re-evaluar Pinecone/Qdrant (improbable) |

---

## Referencias

- Benchmarks y comparativa 2026: supabase.com/blog/pgvector-vs-pinecone ·
  selfhost.dev/blog/pgvector-vs-pinecone/ · apicalculators.com/blog/vector-database-cost-comparison-2026.
- Precios Pinecone: pinecone.io/pricing (Starter 2GB gratis; Standard $50/mes mínimo).
- `MONITORING_SYSTEM.md` — la otra tarea del toDo evaluada (monitoreo externo).

## Glosario de vectores (contexto informático)

| Término | Definición |
|---|---|
| **Embedding** | Vector numérico del significado de un texto |
| **Vector** | Lista de números (dimensión 768/1536/3072) |
| **Similitud coseno** | Métrica de cercanía entre vectores |
| **HNSW** | Índice de grafos para búsqueda rápida |
| **RAG** | Generación aumentada por recuperación |
| **pgvector** | Extensión de vectores para Postgres |
| **Query vector** | Embedding de la consulta |
| **Top-K** | N resultados más cercanos |

## Comparativa rápida de motores

| Motor | Coste | SQL/RLS | Veredicto |
|---|---|---|---|
| **pgvector (Supabase)** | $0 | ✅ | **ELEGIDO** |
| Pinecone | $50/mes | ❌ | Escape hatch a escala masiva |
| Qdrant/Weaviate/Milvus | $150-300/mes | Parcial | Sin ventaja en nuestro volumen |
| Cloudflare Vectorize | Requiere tarjeta | ❌ | Descartado |
| Chroma | Gratis | — | Solo prototipado local |

## Cuándo NO implementar

- No hay caso de uso solicitado (búsqueda semántica no pedida todavía).
- Sin disparador de §3 (búsqueda de canciones o RAG del bot).
- El stack actual (Postgres) cubre sin servicio extra.

## Fases de implementación (cuando haya disparador)

| Fase | Acción |
|---|---|
| 1 | `create extension vector;` (migración) |
| 2 | Tabla con embedding + RLS + policy |
| 3 | Índice HNSW (`vector_cosine_ops`) |
| 4 | Función `match_*` (INVOKER, search_path fijo) |
| 5 | Job de embeddings + endpoint con rate limit + caché |

## Diseño técnico de la tabla de embeddings (referencia)

```sql
create table if not exists muzicmania.track_embeddings (
  id uuid primary key default gen_random_uuid(),
  track_id uuid references tracks(id),
  embedding vector(768),          -- según el modelo elegido
  content text,                    -- texto/fragmento indexado
  metadata jsonb,                  -- título, artista, estilo, fechas
  created_at timestamptz default now()
);
alter table muzicmania.track_embeddings enable row level security;
```

> La dimensión (768/1536/3072) depende del modelo de embeddings elegido; definir antes de
> crear el índice. Seguridad: aplicar RLS y políticas por comando (ver `SECURITY_PROTOCOLS.md`).

## Elección del modelo de embeddings

| Modelo | Dimensión | Coste | Nota |
|---|---|---|---|
| Gemini `text-embedding-004` | 768 | Gratis (key existente) | Primera opción |
| Modelos HF (embeddings) | Varía | Gratis | Alternativa open source |
| Modelos de pago (OpenAI/Cohere) | 1536/3072 | De pago | No necesario en esta escala |

Regla: empezar con el modelo gratis y el mismo para todo el corpus; cambiar de modelo
invalida los embeddings existentes (requiere reindexar).

## Preguntas frecuentes

**¿Cuánto cuesta indexar la música de MuzicMania?** Con el modelo gratis, ≈ $0 en nuestra
escala (decenas-cientos de vectores).

**¿El RAG del bot necesita credenciales nuevas?** No necesariamente: usa la BD Supabase
existente y un LLM ya disponible; el pipeline lo define el caso 2 (§3).

**¿Pinecone puede reemplazar a pgvector luego?** Sí, como escape hatch; el cambio es de
cliente/URL, no reescritura (ver §2).

**¿Qué es Top-K?** El número de resultados más cercanos que devuelve la búsqueda (p.ej.
5-10 fragmentos para el contexto del bot).

## Criterios de aceptación (cuando se implemente)

- [ ] Extensión activada y migración aplicada.
- [ ] Tabla con RLS habilitado y policy por comando.
- [ ] Índice HNSW creado y usado por el planner (EXPLAIN).
- [ ] Función de búsqueda INVOKER con search_path fijo.
- [ ] Endpoint con `createRateLimiter` y caché.
- [ ] Prueba de búsqueda semántica con resultados relevantes.
- [ ] Coste de embeddings ≈ $0 verificado.

## Relación con otros sistemas

| Sistema | Relación |
|---|---|
| `DB_SYSTEM.md` | Postgres/pgvector sobre la BD Supabase actual |
| `SECURITY_PROTOCOLS.md` | RLS y policies obligatorias en cada tabla |
| `MONITORING_SYSTEM.md` | Monitoreo del pipeline (misma tarea del toDo) |
| `CACHING_SYSTEM.md` | Caché del endpoint de búsqueda |

_Última revisión: 13 ago 2026._ Relacionado: `MONITORING_SYSTEM.md`, `DB_SYSTEM.md`,
`BACKEND_SYSTEM.md`, `SECURITY_PROTOCOLS.md`.
