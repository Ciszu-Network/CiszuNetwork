# KNOWLEDGE_SYSTEM — Estrategias de aprendizaje e investigación

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: KNOWLEDGE_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: estrategias de aprendizaje e investigación del ecosistema: fuentes
> primarias, búsquedas dirigidas, prueba empírica, cursos recomendados y hábitos de
> actualización.

Guía de cómo Ciszu Network (fundador único) aprende, investiga y se mantiene actualizado. Se aplica a desarrollo, diseño, marketing y gestión empresarial.

## Estrategias de investigación eficaz

1. **Empezar por fuentes PRIMARIAS y oficiales** antes que tutoriales genéricos:
   - Documentación oficial de herramientas reales del stack: Next.js, Tailwind, Supabase, Discord.js, Tauri, GitHub, Vercel, Cloudflare, PostHog, Spotify/nowpayments según sistema (ver `FULL_STACK_SYSTEM.md`).
   - Repos/CHANGELOGs en GitHub (issues, releases) para versionado real.
2. **Búsquedas dirigidas**: usar `rg` (ripgrep) para explorar código propio; websearch con operadores (`site:`, `lang:es|en`, rangos de fechas) para temas actuales.
3. **Prueba empírica antes de confiar**: el patrón de Ciszu es *verificar con fuentes externas* (curl a prod, queries reales a la BD con `dbvr`, salida del build) y no confiar en el propio estado. Aplicado a decisiones técnicas (lecciones en `AGENTS.md`: ETag de Cloudflare, mimetypes del CDN, 403 del edge Vercel).
4. **Registrar lo aprendido**: las lecciones viven en `AGENTS.md`, `SECURITY_PROTOCOLS.md` y los docs de `documentation/` (no en cabezas).

## Cursos y plataformas recomendadas

- **Desarrollo**: freeCodeCamp (ES), Roadmap.sh (roadmaps por rol), The Odin Project, Documentación oficial (ver arriba).
- **Frontend/Next.js**: docs de Next.js + Learn, Vercel Learn, Tailwind CSS docs.
- **BD/Supabase**: Supabase Docs + Guides; SQL reales con `dbvr`.
- **Diseño/marca**: tutoriales de Adobe Illustrator/Photoshop (identidad visual con masters `.ai`/`.psd` propios), teoría de color, tipografía (Geomanist).
- **Música/audio**: producción digital (AV), teoría básica — el ecosistema incluye MuzicMania con música propia.
- **Empresa/finanzas**: cursos de SENIAT (impuestos y facturación VE), SAREN (marcas/registro mercantil), CFA/Market basics — ver docs legales (`COMPANY_REGISTRATION_PLAN.md`, `FREELANCER_TAX_PLAN.md`).
- **IA/herramientas**: aprendizaje continuo de las herramientas de desarrollo y generación IA usadas (ver `TOOLS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`).

### Cursos de inglés oficiales de Ciszu Network

Cursos de idioma (inglés) vinculados al ecosistema. Los enlaces son **oficiales y
personales** (una sola activación); se guardan en el vault (`services/supabase/.env`)
como `EF_ENGLISH_ASSESSMENT_URL` y `SIMPLILEARN_ENGLISH_URL` y se resuelven al vuelo.

| Curso | Proveedor | Variable en vault | Estado |
|---|---|---|---|
| Cursor de inglés oficial de Ciszu Network | EF Corporate (assessment) | `EF_ENGLISH_ASSESSMENT_URL` | Activo |
| Inglés (aprendizaje) | Simplilearn | `SIMPLILEARN_ENGLISH_URL` | Pendiente |

- **EF Corporate — assessment de nivel**: permite medir el nivel de inglés de forma
  oficial (CEFR). URL en vault (`EF_ENGLISH_ASSESSMENT_URL`).
- **Simplilearn**: curso de inglés de la plataforma Simplilearn. URL en vault
  (`SIMPLILEARN_ENGLISH_URL`).
- Protocolo: usar las variables del vault al ejecutar las tareas de formación; nunca
  compartir estos enlaces públicamente (son de activación única/vinculados a la cuenta).

## Fuentes de información oficiales (Venezuela y tecnologías)

- SENIAT (tributos/certificación digital): `seniat.gob.ve`
- Registro Mercantil / SAREN: `saren.gob.ve`
- ONIDEX (documentos legales) / identidad
- Sitios oficiales de: Supabase, Vercel, GitHub, Cloudflare, Discord Developers, PostHog, top.gg/discordbotlist, nowpayments.

## Hábito de actualización

- Revisar dependabot (35/36 cerrado, queda glib) y advisories (`pnpm audit --prod`, `trivy`) como parte del ciclo de seguridad.
- Revisar releases de Next.js/Supabase/Discord.js al menos 1×/trimestre para decidir migraciones conscientes (ver `ERRORS_SYSTEM.md` y `CACHING_SYSTEM.md`).

## Mapa de aprendizaje por área

| Área | Fuentes primarias | Práctica en el repo |
|---|---|---|
| Next.js | docs + Learn | webs `projects/*/website` |
| Tailwind v4 | docs | `globals.css` (@theme) |
| Supabase | docs + guides | migraciones, RLS, RPC |
| Discord.js | docs de Discord Developers | bot `ciszubot/discord-bot` |
| Tauri | docs Tauri v2 | MuzicMania src-tauri |
| Seguridad | OWASP, docs Supabase | `SECURITY_PROTOCOLS.md` |
| Diseño/marca | Illustrator/Photoshop | masters `.ai`/`.psd` propios |
| Música/audio | producción digital | tracks propios de MuzicMania |
| Legal VE | SENIAT, SAREN, SAPI | planes `*_PLAN.md` |

## Fuentes oficiales (enlaces de referencia)

- SENIAT: `seniat.gob.ve`
- Registro Mercantil / SAREN: `saren.gob.ve`
- ONIDEX (documentos legales)
- Supabase: `supabase.com/docs`
- Vercel: `vercel.com/docs`
- Cloudflare: `developers.cloudflare.com`
- Discord Developers: `discord.com/developers`
- PostHog: `posthog.com/docs`
- NOWPayments: `nowpayments.io`

## Buenas prácticas de investigación

1. **Primarias antes que tutoriales** — docs oficiales y CHANGELOGs.
2. **Búsqueda dirigida** — `rg` en el repo, websearch con operadores.
3. **Prueba empírica** — verificar con curl/build/queries, no confiar en estado local.
4. **Registrar lecciones** — en AGENTS.md y docs, no en la memoria de la sesión.
5. **Recursos en español e inglés** — el ecosistema es bilingüe.

## Ciclo de actualización recomendado

- **Quincenal**: dependabot, advisories (`pnpm audit --prod`, `trivy`).
- **Trimestral**: releases de Next/Supabase/Discord.js, revisar migraciones de framework.
- **Semestral**: revisar este doc y `FULL_STACK_SYSTEM.md` contra el stack real.

## Método de aprendizaje en la práctica (flujo)

1. **Definir el objetivo** en una frase medible ("poder migrar la cache a una
   política eviction LRU", "publicar el primer release de MuzicMania en NSIS").
2. **Explorar fuentes primarias** (docs oficiales del stack — ver `FULL_STACK_SYSTEM.md`).
3. **Reproducir en el repo** un ejemplo mínimo del tema antes de integrarlo.
4. **Verificar empíricamente** con herramientas externas (build, curl, `dbvr`).
5. **Registrar la lección** en el doc correspondiente o en `AGENTS.md`.
6. **Enseñar/refrescar**: reexplicar el tema (a un README, a una nota) confirma
   que se entendió y deja material reusable.

## Búsqueda dirigida: operadores y ejemplos

- `site:supabase.com rls` → solo resultados del dominio oficial.
- `lang:es OR lang:en next.js 15 migración` → contenido bilingüe.
- `intitle:changelog next.js` → changelogs oficiales.
- Rangos de fechas: `supabase postgres after:2025-01-01` → solo contenido reciente.
- En el código propio: `rg -n "createRateLimiter" packages/` para localizar usos.
- Guardar consultas útiles y repetibles como notas para reusar en temas similares.

## Evaluación crítica de fuentes

Antes de confiar en una fuente, verificarla:

1. **Autoridad**: ¿es documentación oficial, un mantenedor o un blog anónimo?
2. **Actualidad**: ¿fue escrita para la versión del stack en uso? (Next.js 15,
   Tailwind 4, Supabase actual, Discord.js v14+, Tauri v2).
3. **Reproducibilidad**: ¿se puede probar en el repo sin romper nada?
4. **Consistencia**: ¿coincide con los docs oficiales y con lo que hace el código
   real del proyecto?
5. **Desinformación**: desconfiar de "tips mágicos" sin verificación; aplicar la
   regla empírica de Ciszu (verificar con fuentes externas, nunca confiar en el
   propio estado — lecciones en `AGENTS.md`).

## Toma de notas y organización del conocimiento

- Las notas técnicas viven en `projects/ciszu/docs/documentation/` y en
  `AGENTS.md`; no en la memoria de sesión ni en chats perdidos.
- Convención de nombres: `*_SYSTEM`, `*_PLAN`, `*_PROTOCOLS` (ver `AGENTS.md`).
- Cada lección nueva debe tener: contexto (qué se intentaba), causa raíz, solución
  y referencia (archivo/línea o URL oficial).
- Revisar periódicamente las notas: borrar obsoletas, fusionar repetidas y marcar
  las pendientes de validar.

## Plantilla de ficha de aprendizaje

```
Tema: <qué se aprendió>
Contexto: <dónde aplica en el repo>
Fuente: <URL oficial / sección de docs / lección del repo>
Validación: <comando o prueba que lo confirma>
Aplica a: <proyectos o sistemas del repo>
```

Usar esta ficha al registrar lecciones para que sean útiles meses después.

## Ciclo aprender–hacer–revisar (retroalimentación)

1. **Aprender**: estudiar la fuente primaria (bloque corto y enfocado).
2. **Hacer**: implementar un cambio real en el repo (feature, fix, mejora).
3. **Revisar**: comparar con el resultado esperado; si falla, iterar.
4. **Consolidar**: registrar la lección y actualizar el doc correspondiente.

Este ciclo convierte la teoría en conocimiento operativo y evita el "aprender por
aprender".

## Comunidades y redes de aprendizaje

- Comunidades de hispanohablantes de desarrollo (Discord, Telegram), foros
  oficiales de los stacks y repos con issues activos.
- Canales de cambios: changelogs de los proyectos y cuentas oficiales en redes.
- Participar leyendo issues resueltos: expone problemas reales y sus soluciones,
  más valiosos que tutoriales superficiales.
- El ecosistema propio (Discord Lounge, bots) también es fuente de aprendizaje
  sobre producto y comunidad.

## Errores comunes de investigación

1. **Confiar en tutoriales desactualizados** para versiones nuevas del stack.
2. **No verificar en producción**: asumir que el estado local refleja el real.
3. **Copiar sin entender**: pegar código sin probar ni adaptar.
4. **No documentar**: aprender algo y no dejarlo registrado se pierde con la
   sesión.
5. **Sesgo de confirmación**: buscar solo fuentes que confirman la hipótesis.

## Checklist de investigación (pre-flight)

- [ ] Objetivo claro y medible
- [ ] Fuentes primarias identificadas (docs oficiales)
- [ ] Búsqueda con operadores (site:, rangos de fechas, idioma)
- [ ] Plan de verificación empírica (build/curl/query)
- [ ] Zona de documentación destino (doc existente o nuevo)
- [ ] Tiempo acotado para la investigación (no caer en rabbit holes)

## Materiales de referencia rápida por tema

| Tema | Referencia primaria | Doc del repo relacionado |
|---|---|---|
| Frontend/Next.js | docs + Learn oficiales | `projects/*/website` |
| Estilos/Tailwind | docs Tailwind v4 | `globals.css` (@theme) |
| BD/RLS/RPC | Supabase Docs + Guides | `DB_SYSTEM.md`, `AUTH_SYSTEM.md` |
| Bot | Discord Developers | `ciszubot/discord-bot` |
| Desktop | docs Tauri v2 | MuzicMania src-tauri |
| Seguridad | OWASP + docs de plataformas | `SECURITY_PROTOCOLS.md` |
| Pagos | docs NOWPayments/PayPal | `PAYMENTS_SYSTEM.md` |

Esta tabla evita redes de búsqueda: ir directo a la fuente primaria de cada tema.

## Plan semanal de aprendizaje

- **Lunes**: 30 min — revisar dependabot/advisories y changelogs relevantes.
- **Miércoles**: 30–45 min — bloque de "aprender haciendo" (una técnica nueva
  aplicada al repo: RPC nuevo, política RLS, feature Tauri).
- **Viernes**: 15–30 min — consolidar notas de la semana (fichas, actualización
  de docs) y planear el siguiente tema.
- **Ante un tema crítico** (migración mayor, security advisory): dedicar más
  tiempo puntual y documentar el resultado en el doc del sistema afectado.

El aprendizaje no compite con el roadmap: se integra como mejora concreta del
repo (ver `WORKFLOW_SYSTEM.md`).

## Preguntas frecuentes (FAQ)

**¿Cómo sé si una fuente es confiable para el stack actual?**
Compara su fecha y versión con la del stack real (`FULL_STACK_SYSTEM.md`) y prueba el
ejemplo en el repo. Si no cuadra con los docs oficiales, descartarla.

**¿Cuándo crear un doc nuevo vs. ampliar uno existente?**
Si el tema pertenece a un sistema ya documentado, ampliar ese doc. Solo crear uno
nuevo si es un sistema distinto y sigue la convención de nombres de `AGENTS.md`.

**¿Cómo recupero conocimiento que olvidé?**
Busca en los docs con `rg` (p. ej. `rg -n "rate limit" documentation/`) y en el
historial de `AGENTS.md`. La práctica de registrar lecciones existe precisamente
para esto.

**¿Qué hago con información pendiente de validar?**
Marcarla como pendiente en `TODO.md` con referencia a la fuente; no escribirla
como hecho confirmado en los docs hasta verificarla empíricamente.

_Última revisión: 13 ago 2026._ Relacionado: `FULL_STACK_SYSTEM.md`, `TOOLS_SYSTEM.md`,
`WORKFLOW_SYSTEM.md`, `CODE_PRINCIPLES_PROTOCOLS.md`.