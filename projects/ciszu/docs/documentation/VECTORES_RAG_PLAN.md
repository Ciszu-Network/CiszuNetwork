# Plan de base de datos vectorial (RAG / búsqueda semántica) — Ciszu Network

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
- `MONITOREO_SISTEMA.md` — la otra tarea del toDo evaluada (monitoreo externo).
