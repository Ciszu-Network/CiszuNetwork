# AI_AGENT_ORCHESTRATION_REPORT — Agentes y orquestación para multiplicar producción

**Versión:** 1.0
**Actualización:** 2026-11-14
**Identificador:** AI_AGENT_ORCHESTRATION_REPORT
**Definición:** investigación de herramientas, patrones y arquitectura para aumentar la
producción de Ciszu Network con agentes de modelos de IA, manteniendo control humano,
trazabilidad y costes acotados. No implica adopción ni instalación de todas las piezas.

---

## 1. Resumen ejecutivo

La palanca no es “tener un agente más potente”, sino **un sistema de agentes con límites
claros**: memoria, herramientas, sandbox, cola de trabajo, aprobación humana, observabilidad
y evaluación. Para Ciszu Network el mejor punto de partida no es reescribir el ecosistema:
es añadir una capa de orquestación sobre lo que ya existe (opencode, GitHub Actions, Supabase,
ntfy y los agentes de terminal).

Recomendación principal:

1. Mantener **opencode** como interfaz de ingeniería diaria.
2. Evaluar **Hermes Agent** como agente operativo persistente (memoria + skills + cron +
   gateway móvil), no como reemplazo del repo.
3. Usar **LangGraph + LangSmith** solo para pipelines de varios pasos que necesiten estado
   durable, interrupciones humanas y trazas.
4. Estandarizar herramientas con **MCP** y agentes externos con **A2A** cuando exista
   interoperabilidad real.
5. Medir cada flujo con **coste, latencia, tasa de éxito y ahorro de horas**; sin métricas,
   “más agentes” solo aumenta el ruido.

## 2. Capas de un sistema de agentes

```
Objetivo de negocio
  ↓
Orquestador (grafo/cola/cron)
  ↓
Agente(s) + modelo(s)
  ↓
Memoria + contexto + skills
  ↓
Herramientas (MCP/CLI/API) + sandbox
  ↓
Aprobación humana / políticas
  ↓
Observabilidad + evaluación + coste
```

| Capa | Pregunta que responde | Herramientas típicas |
|---|---|---|
| Interfaz | ¿Dónde trabaja el humano con el agente? | opencode, Hermes, Claude Code, Codex, Kilo |
| Orquestación | ¿Quién decide el siguiente paso? | LangGraph, CrewAI, AutoGen, Temporal |
| Herramientas | ¿Cómo toca el mundo? | MCP, CLI, APIs, GitHub Actions |
| Memoria | ¿Qué recuerda entre sesiones? | Hermes memory, Honcho, pgvector, archivos |
| Sandbox | ¿Dónde ejecuta sin dañar el host? | Docker, Daytona, Modal, E2B, Vercel Sandbox |
| Entrega | ¿Cómo habla con el humano? | Telegram, Discord, Slack, CLI, ntfy |
| Control | ¿Cuándo pide permiso? | approval gates, allowlists, RBAC |
| Calidad | ¿Cómo sabemos que sirve? | LangSmith, OpenTelemetry, evals, Sentry |

## 3. Herramientas destacadas

### 3.1 Hermes Agent (Nous Research)

Hermes Agent es un agente open source (MIT) con un **bucle de aprendizaje**: crea skills a
partir de experiencias, las mejora, conserva memoria, busca conversaciones pasadas y construye
un modelo del usuario a lo largo del tiempo. Su propuesta interesante para Ciszu no es el chat:
es convertirlo en un **operador persistente** con cron, gateway multi-plataforma y subagentes.

Puntos fuertes documentados:

- Memoria persistente + skills que evolucionan.
- Gateway para Telegram, Discord, Slack, WhatsApp, Signal y CLI.
- Cron/scheduler con entrega en cualquier plataforma.
- Subagentes aislados y paralelos.
- Backends de terminal: local, Docker, SSH, Modal, Daytona y Vercel Sandbox.
- Integración MCP y estándar de skills `agentskills.io`.
- Instalación nativa en Windows/Linux/macOS/Termux.
- Comandos útiles: `hermes doctor`, `hermes model`, `hermes gateway`, `hermes update`.

Riesgos: es un agente con acceso a terminal y secretos; exige sandbox, allowlist de comandos,
aprobación para operaciones destructivas y separación de credenciales. No debe recibir el vault
completo ni ejecutar deploys sin gate humano.

Uso recomendado en Ciszu: **operador de segunda línea** para tareas periódicas y avisos,
mientras opencode sigue siendo el ingeniero que edita el repo.

### 3.2 LangGraph + LangSmith

LangGraph es un framework de orquestación de bajo nivel para agentes con estado. Sus piezas
clave son ejecución durable, interrupciones human-in-the-loop, memoria corta/larga y trazas
con LangSmith. Es la opción más defendible cuando un flujo tiene ramas, reintentos, esperas y
necesita reanudar tras un fallo.

Encaja en: pipeline de contenido (investigar → redactar → revisar → publicar), triage de
incidencias, generación/verificación de changelogs, auditorías programadas.

No encaja para: una tarea puntual de “arregla este bug”; para eso un agente de terminal es
más simple.

### 3.3 OpenAI Agents SDK / Responses

Útil si se estandariza en modelos OpenAI: handoffs entre agentes, guardrails, sesiones y
tracing. La ventaja es la integración con el ecosistema OpenAI; la desventaja es el acoplamiento
al proveedor. Para Ciszu, que ya usa DeepSeek/OpenCode Go y Gemini para voz, no debe ser la
capa única.

### 3.4 CrewAI

Framework de “crews” con roles y tareas. Muy rápido para prototipos y demos de varios agentes;
menos determinista para producción crítica. Bueno para experimentos de marketing/contenido,
no para flujos que tocan pagos o producción.

### 3.5 Microsoft AutoGen / Agent Framework

Enfoque conversacional multiagente, fuerte en investigación y patrones de colaboración.
Requiere disciplina de costes y evaluación; no es necesario para el tamaño actual de Ciszu.

### 3.6 Temporal / Prefect / Dagster / Windmill

No son “agentes”, son **orquestadores de workflows duraderos**. Son la mejor opción para
cron, ETL, backups, informes y tareas que deben reintentarse de forma determinista. Un agente
puede ser un paso dentro del workflow, no el workflow entero.

Para Ciszu, GitHub Actions + Supabase ya cubre la mayoría; Temporal/Prefect se justifican
cuando haya workflows de horas o necesidad de reanudación exacta.

### 3.7 MCP y A2A

- **MCP (Model Context Protocol)**: estándar para exponer herramientas/recursos a agentes.
  Permite conectar base de datos, navegador, repositorio, ticketing y APIs sin reinventar
  integraciones.
- **A2A (Agent-to-Agent)**: protocolo para que agentes de distintos frameworks se descubran y
  deleguen tareas. Útil cuando convivan Hermes, opencode, un agente de soporte y un orquestador.

Regla: MCP para **herramientas**, A2A para **agentes**. No usar MCP como excusa para dar al
agente acceso total a la base de datos.

### 3.8 Sandboxes y ejecución

- **Docker local**: simple, pero el agente comparte el host si se configura mal.
- **Daytona / Modal / E2B / Vercel Sandbox**: entornos efímeros, buen aislamiento y escala.
- **SSH**: útil para VPS, pero no es un sandbox; es acceso privilegiado.

Para tareas de código, la combinación recomendada es **worktree + contenedor + secretos
inyectados por referencia**, nunca el vault montado.

### 3.9 Observabilidad y evaluación

- **LangSmith**: trazas de agentes LangGraph, evaluación de trayectorias.
- **OpenTelemetry + Langfuse**: alternativa vendor-neutral para trazas, coste y latencia.
- **Sentry**: errores de runtime; no sustituye trazas de agente.
- **PostHog**: comportamiento de producto, no calidad de agente.
- **Supabase**: métricas de negocio y estado de workflows.

Métricas mínimas por flujo:

| Métrica | Objetivo |
|---|---|
| Tasa de éxito sin intervención | >70% en tareas repetitivas |
| Coste por tarea | visible y con presupuesto |
| Latencia p50/p95 | según criticidad |
| Intervenciones humanas | descendentes con el tiempo |
| Errores repetidos | <5% tras aprendizaje |
| Horas ahorradas | medida contra línea base manual |

## 4. Arquitectura recomendada para Ciszu

### Fase 1 — Agent Ops (sin nuevas plataformas)

- opencode para código y auditorías.
- GitHub Actions para cron, CI y deploys.
- Supabase como estado/colas/observabilidad de negocio.
- ntfy para alertas.
- `AGENTS.md` + skills + docs como contexto compartido.
- Sandbox local (Docker) y worktrees para trabajo aislado.

### Fase 2 — Operador persistente

- Hermes Agent en un VPS pequeño o sandbox, conectado a Telegram/Discord.
- Memoria y skills separadas por proyecto.
- Cron para informes, backups, revisión de incidencias y resúmenes.
- Aprobación humana obligatoria para deploys, pagos, borrados y cambios de DB.

### Fase 3 — Pipelines con estado

- LangGraph para 2–3 flujos de alto valor:
  1. Investigación → borrador → verificación → publicación de contenido.
  2. Incidencia → diagnóstico → parche propuesto → tests → PR.
  3. Auditoría semanal → hallazgos → tareas → seguimiento.
- LangSmith u OpenTelemetry para trazas y evaluación.

### Fase 4 — Interoperabilidad

- MCP para herramientas internas (Supabase read-only, GitHub, docs, browser).
- A2A solo si hay más de un framework conviviendo.
- Catálogo de skills versionado en el repo y política de instalación.

## 5. Playbook para multiplicar producción

| Flujo | Entrada | Agente | Salida | Gate |
|---|---|---|---|---|
| Triage de issues | Issues/alertas | opencode + Hermes | diagnóstico priorizado | humano decide |
| Content factory | Brief | LangGraph + modelo | borrador + fuentes + imágenes | revisión editorial |
| Release QA | PR/commit | opencode | tests, riesgos, changelog | CI + humano |
| Soporte | Ticket | Hermes/opencode | respuesta y etiqueta | humano en casos sensibles |
| Growth analytics | Métricas | agente de datos | informe y experimentos | decisión de negocio |
| Mantenimiento | Cron | Hermes/GH Actions | informe, backup, alerta | automático permitido |

Reglas de multiplicación:

1. Automatizar primero lo **repetitivo y verificable**.
2. Cada flujo debe tener una salida binaria (PR, informe, ticket, alerta).
3. Un agente no debe aprobar su propio trabajo destructivo.
4. Separar investigación, ejecución y revisión en pasos.
5. Medir antes/después; retirar flujos que no ahorren tiempo.

## 6. Seguridad y costes

- Mínimo privilegio: tokens de solo lectura por defecto; escritura solo con gate.
- Secretos por referencia (vault/entorno), nunca en prompts, skills o logs.
- Sandbox para código no confiable y para instalar dependencias.
- Aprobación humana para `git push`, deploy, migraciones, pagos y borrados.
- Límites de tokens/tiempo por tarea y alertas al 50/75/90%.
- Registrar proveedor/modelo por tarea para auditar coste y calidad.
- Evitar frameworks que envíen todo el repo al modelo sin necesidad.
- Evaluar prompt injection en contenido externo (webs, issues, PDFs, emails).
- Usar allowlist de comandos MCP/terminal y revisar skills antes de instalarlas.

## 7. Roadmap 30/60/90

### 30 días

- Consolidar `AGENTS.md`, skills y comandos portables.
- Medir 3 flujos manuales y definir línea base.
- Probar Hermes en sandbox con un solo canal y sin secretos de producción.
- No añadir un orquestador nuevo hasta tener métricas.

### 60 días

- Poner en marcha 2 flujos con Hermes/opencode y aprobación humana.
- Añadir trazas OpenTelemetry/Langfuse o LangSmith a los flujos elegidos.
- Estandarizar MCP read-only para Supabase/GitHub/docs.
- Presupuesto mensual por flujo y alertas.

### 90 días

- Evaluar LangGraph para el flujo con más ramas.
- A2A solo si conviven dos o más frameworks.
- Revisar ROI: horas ahorradas, coste, errores, intervención humana.
- Documentar qué se queda, qué se retira y qué se pospone.

## 8. Veredicto

Para Ciszu Network, **Hermes Agent + opencode + GitHub Actions/Supabase** es la combinación
con mejor relación valor/riesgo a corto plazo. LangGraph entra cuando exista un flujo de
varios pasos con estado y necesidad de reanudación; CrewAI/AutoGen quedan como laboratorio.
La prioridad no es “más agentes”, sino **menos trabajo manual repetitivo con trazabilidad**.

## 9. Fuentes

- Hermes Agent (Nous Research): https://github.com/NousResearch/hermes-agent
- Hermes Agent docs: https://hermes-agent.nousresearch.com/docs/
- LangGraph: https://github.com/langchain-ai/langgraph
- LangGraph docs: https://docs.langchain.com/oss/python/langgraph/
- Model Context Protocol: https://modelcontextprotocol.io/
- Agent2Agent (A2A): https://a2a-protocol.org/
- OpenTelemetry: https://opentelemetry.io/
- Temporal: https://temporal.io/
- Prefect: https://www.prefect.io/
- CrewAI: https://github.com/crewAIInc/crewAI
- Microsoft AutoGen: https://github.com/microsoft/autogen
- OpenAI Agents SDK: https://github.com/openai/openai-agents-python

_Última revisión: 14 nov 2026._ Relacionado: `OPENCODE_SYSTEM.md`, `MODELS_LLM_SYSTEM.md`,
`MODELS_SKILLS_SYSTEM.md`, `MCP_PROTOCOLS.md`, `GLOBAL_SYSTEM.md`, `AGENTS.md`.
