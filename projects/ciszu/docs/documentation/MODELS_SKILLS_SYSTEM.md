# MODELS_SKILLS_SYSTEM — Galería de Skills del Agente OpenCode

Versión: 1.0.0
Actualización: 2026-08-31
Identificador: MODELS_SKILLS_SYSTEM_V1.0.0_2026_08_31_ciszunetwork

> **Definición**: sistema que documenta las **skills instalables** para el agente opencode
> (modelo DeepSeek V4 Flash, suscripción OpenCode Go): catálogo de las mejores skills
> gratuitas/open-source, cómo instalarlas, links de descarga y el estado del agente
> (vanilla → skills activas, MCP ausente).

---

## 1. Contexto: el agente y su estado

El agente de este ecosistema corre **opencode v1.18.21** (TUI en Windows) con el modelo
`opencode-go/deepseek-v4-flash`. Config: `E:\Ciszu Network\opencode.json` (raíz del
monorepo) + `C:\Users\fplay\.config\opencode\opencode.json` (global).

### 1.1 Estado antes de esta tarea (2026-08-31)

| Componente | Estado | Detalle |
|---|---|---|
| **Skills** | ❌ **Vanilla** | Solo existía `puck` (carpeta `E:\Ciszu Network\.opencode\skills\puck\`) |
| **MCP clients** | ❌ **Ausentes** | Sin `mcp:` en ningún `opencode.json` (ni raíz ni global). Verificado en `opencode.json`, `opencode.jsonc` y global |
| **LSP** | ✅ Activo | `"lsp": true` + `permission.lsp: allow` (ver `AGENTS.md` §6.7) |
| **Plugins** | ❌ Ausentes | Sin `plugin:` en config; carpeta `.opencode/plugins/` vacía |
| **Referencias** | ❌ Ausentes | Sin `references:` en config |

### 1.2 Estado después de esta tarea

| Componente | Estado | Detalle |
|---|---|---|
| **Skills** | ✅ **34 skills** | Instaladas en `E:\Ciszu Network\.opencode\skills\` (local, gitignored). 33 nuevas + `puck` existente |
| **MCP clients** | ❌ Ausentes (por diseño) | Se decide NO añadir MCP por ahora: las skills cubren las necesidades sin deps externas; MCP se evalúa en §8 |
| **Fuentes clonadas** | ✅ 4 repos | `clones/superpowers`, `clones/anthropic-skills`, `clones/jjmartres-opencode`, `clones/opencode-agents` (gitignored) |

> **Dónde viven**: las skills se cargan desde `.opencode/skills/<nombre>/SKILL.md`
> (proyecto), `~/.config/opencode/skills/<nombre>/SKILL.md` (global) o las compatibles
> `.claude/skills/` y `.agents/skills/`. Este repo usa la ruta de **proyecto**; está
> gitignored (`AGENTS.md` §6.4), es decir **solo local, no se comparten por git**.
> Requieren **reiniciar opencode** para que el loader las detecte (no son hot-reload).

---

## 2. Qué es una skill en opencode

Una **skill** (formato `SKILL.md`, estándar Agent Skills de Anthropic que opencode adopta)
es un folder con:

- `SKILL.md`: frontmatter YAML obligatorio (`name`, `description`) + cuerpo markdown con
  el procedimiento que el modelo carga **bajo demanda** vía la tool `skill`.
- Archivos auxiliares opcionales: scripts, prompts, referencias, plantillas.

```text
.opencode/skills/<nombre>/
├── SKILL.md          # obligatorio: name + description + instrucciones
└── <auxiliares>      # opcional: .md, .py, .js, .ttf, etc.
```

**Cómo decide el modelo**: la tool `skill` lista `<available_skills>` con nombre +
descripción; el agente invoca `skill({ name: "<nombre>" })` cuando la tarea coincide.
Las skills sin `description` no se muestran. El nombre debe coincidir con el folder
(expresión `^[a-z0-9]+(-[a-z0-9]+)*$`).

---

## 3. Galería de skills instaladas (34)

Fuentes principales (top del ecosistema opencode/Claude):
- **obra/superpowers** (~280k stars) — metodología de desarrollo dirigida por agentes.
- **anthropics/skills** (~172k stars) — skills oficiales de Anthropic (oficina, diseño, docs).
- **jjmartres/opencode** — skills y configs opencode de terceros.
- **darrenhinde/opencode-agents** (~4.8k stars) — framework opencode plan-first.
- **puck** — skill pre-existente del visual editor (React).

### 3.1 Metodología de desarrollo (superpowers) — 14

| Skill | Qué hace | Cuándo usarla |
|---|---|---|
| `brainstorming` | Explora intención, requisitos y diseño antes de implementar | Antes de cualquier trabajo creativo/feature |
| `writing-plans` | Escribe planes de implementación multi-paso | Con spec/requisitos antes de tocar código |
| `executing-plans` | Ejecuta planes escritos con checkpoints de revisión | Sesión aparte con plan de implementación |
| `subagent-driven-development` | Ejecuta planes con tareas independientes en la sesión actual | Cuando un plan tiene tareas paralelizables |
| `dispatching-parallel-agents` | Dispara 2+ tareas independientes sin estado compartido | Múltiples subtareas paralelas |
| `systematic-debugging` | Encuentra la causa raíz antes de proponer fixes | Cualquier bug/test fallido/comportamiento raro |
| `test-driven-development` | TDD: escribe tests antes del código de implementación | Implementar features/bugfixes |
| `verification-before-completion` | Ejecuta verificación real antes de afirmar "completado" | Antes de commitear/crear PRs/afirmar éxito |
| `requesting-code-review` | Pide y aplica revisiones de código formales | Al completar features/major changes |
| `receiving-code-review` | Procesa feedback de review con rigor técnico | Al recibir comentarios de revisión |
| `using-git-worktrees` | Aisla el workspace con worktrees o fallback nativo | Trabajo de feature aislado |
| `finishing-a-development-branch` | Decide cómo integrar el trabajo terminado | Implementación completa, tests verdes |
| `writing-skills` | Crea/edita/valida skills nuevas | Crear o mantener SKILL.md |
| `using-superpowers` | Guía maestra: cómo invocar skills (exige invocación antes de responder) | Inicio de cualquier conversación |

**Links de descarga**: repo `https://github.com/obra/superpowers` → carpeta `skills/`.
Skill individual (ej.): `https://github.com/obra/superpowers/tree/main/skills/systematic-debugging`.

### 3.2 Oficina y documentos (anthropics) — 4

| Skill | Qué hace | Cuándo usarla | Deps |
|---|---|---|---|
| `docx` | Crea/lee/edita documentos Word (.docx/.dotx) con formato profesional | Cualquier doc Word | `docx` (npm) + scripts python |
| `pdf` | Lee/extrae/combina/divide/rota/rellena formularios PDF | Cualquier operación con PDF | Python (pypdf, pdfplumber) + scripts |
| `pptx` | Crea/lee/edita presentaciones PowerPoint | Pitch decks, presentaciones | `pptxgenjs` (npm) + scripts |
| `xlsx` | Crea/lee/edita hojas de cálculo Excel/CSV | Tabular data como input/output | Python (openpyxl, pandas, markitdown) |

> Estas skills traen **scripts de soporte** (validación, thumbnails, relleno de formularios)
> y licencias. Al usarlas, el modelo escribe/instala las deps puntuales (`npm install`/
> `pip install`) solo si el require/import falla. Perfectas para el pipeline de docs
> `txt → md → docx → pdf` del ecosistema.

**Links de descarga**: repo `https://github.com/anthropics/skills` → carpeta `skills/`.
Skill individual (ej.): `https://github.com/anthropics/skills/tree/main/skills/docx`.

### 3.3 Diseño y marca (anthropics) — 4

| Skill | Qué hace | Cuándo usarla |
|---|---|---|
| `frontend-design` | Guía de diseño visual distintivo (tipografía, dirección estética) | Construir/rediseñar UI, evitar "templated" |
| `canvas-design` | Crea arte visual en .png/.pdf con filosofía de diseño (fuentes incluidas) | Posters, arte, diseño estático |
| `brand-guidelines` | Aplica colores y tipografía oficiales de una marca a artefactos | Cuando se requiera look-and-feel de marca |
| `webapp-testing` | Toolkit Playwright para probar apps web locales (screenshots, logs) | Verificar frontend, debug UI local |

**Links de descarga**: repo `https://github.com/anthropics/skills` → carpeta `skills/`.

### 3.4 Redacción y organización (jjmartres) — 7

| Skill | Qué hace | Cuándo usarla |
|---|---|---|
| `writing-clearly-and-concisely` | Prosa clara y profesional (reglas de Strunk) | Docs, commits, mensajes de error, reportes, UI text |
| `content-research-writer` | Investiga, cita fuentes, mejora hooks/outlines | Escritura de contenido de calidad |
| `humanizer` | Humaniza texto (más natural, menos robótico) | Contenido que debe sonar humano |
| `caveman-commit` | Commits de git simples y descriptivos | Commits de git |
| `file-organizer` | Organiza archivos/carpetas, encuentra duplicados, sugiere estructura | Tareas de limpieza/organización de archivos |
| `mermaid-diagrams` | Crea diagramas de software en Mermaid (clases, secuencia, flujo, ER) | Documentar/diseñar con diagramas |
| `skill-judge` | Evalúa calidad de SKILL.md contra especificaciones oficiales | Auditar/mejorar skills |

**Links de descarga**: repo `https://github.com/jjmartres/opencode` → carpeta `opencode/skills/`.
Skill individual (ej.): `https://github.com/jjmartres/opencode/tree/main/opencode/skills/mermaid-diagrams`.

### 3.5 Orquestación y contexto (darrenhinde) — 4

| Skill | Qué hace | Cuándo usarla |
|---|---|---|
| `context-manager` | Descubre, extrae, comprime y organiza contexto de proyecto | Gestionar contexto de sesión |
| `task-management` | CLI de gestión de subtasks con estado, dependencias y validación | Trackear features en subtasks |
| `project-orchestration` | Orquesta flujos multi-agente para features (planning, handoff, stages) | Desarrollo de features coordinado |
| `context7` | (No instalada — requiere MCP context7) | — |

**Links de descarga**: repo `https://github.com/darrenhinde/opencode-agents` → carpeta
`.opencode/skills/` (y `.opencode/skill/` para `project-orchestration`).

### 3.6 Editor visual pre-existente — 1

| Skill | Qué hace | Cuándo usarla |
|---|---|---|
| `puck` | Build con Puck, visual editor de React | Añadir/extender editor visual, debug de integraciones Puck |

---

## 4. Links de descarga: lotes completos

| Fuente | Link | Contenido |
|---|---|---|
| **superpowers** (obra) | `https://github.com/obra/superpowers` | 14 skills de metodología en `skills/` |
| **anthropic skills** | `https://github.com/anthropics/skills` | 19 skills oficiales en `skills/` (8 instaladas) |
| **jjmartres/opencode** | `https://github.com/jjmartres/opencode` | 22 skills opencode en `opencode/skills/` (7 instaladas) |
| **darrenhinde/opencode-agents** | `https://github.com/darrenhinde/opencode-agents` | Framework completo en `.opencode/` (4 instaladas) |
| **awesome-opencode** (índice) | `https://github.com/awesome-opencode/awesome-opencode` | Catálogo curado de plugins/themes/agents/recursos |
| **ecosistema opencode** (docs) | `https://opencode.ai/docs/ecosystem/` | Lista oficial de proyectos/plugins/agentes |
| **docs de skills** | `https://opencode.ai/docs/skills/` | Formato SKILL.md, descubrimiento, permisos |

**Instalación rápida de un lote** (git, shallow):

```bash
git clone --depth 1 https://github.com/obra/superpowers.git clones/superpowers
# copiar cada skill deseada: Copy-Item -Recurse clones/superpowers/skills/<name> .opencode/skills/<name>
```

---

## 5. Clones locales (protocolo)

Los repos de terceros se clonan en `E:\Ciszu Network\clones/<nombre>/` (gitignored),
según `AGENTS.md` §6.4 y `TOOLS_SYSTEM.md` §6.6. Estado actual (2026-08-31):

| Clon | Repo | Skills fuente | Comentario |
|---|---|---|---|
| `clones/superpowers` | obra/superpowers | metodología (14) | shallow, depth 1 |
| `clones/anthropic-skills` | anthropics/skills | oficina/diseño (8) | shallow, depth 1 |
| `clones/jjmartres-opencode` | jjmartres/opencode | redacción/org (7) | shallow, depth 1 |
| `clones/opencode-agents` | darrenhinde/opencode-agents | orquestación (4) | shallow, depth 1 |
| `clones/spiderfoot` | spiderfoot | — | pre-existente (OSINT) |
| `clones/onlook` | — | — | pre-existente (revisar vigencia) |

Regla: **uno por carpeta**, shallow, sin desatender el espacio de disco (C: y E: limitados).
Los clones son solo **fuente de instalación**; los cambios activos viven en
`.opencode/skills/`.

---

## 6. Cómo instalar / desinstalar una skill

### 6.1 Instalar (manual, sin comandos de red)

1. Clonar el repo fuente (ver §5) o descargar el folder de la skill.
2. Copiar el folder completo a `E:\Ciszu Network\.opencode\skills\<nombre>\`.
3. Verificar el `SKILL.md`: que el `name:` coincida con el folder y tenga `description:`.
4. **Reiniciar opencode** (el loader escanea al arranque).

### 6.2 Verificar validez

```powershell
$f = ".opencode\skills\<nombre>\SKILL.md"
Select-String -Path $f -Pattern "^name:","^description:"   # ambos obligatorios
```

Requisitos del loader: `SKILL.md` en MAYÚSCULAS exacto; `name` 1-64 chars, lowercase,
hiphens simples, coincidente con el folder; `description` 1-1024 chars.

### 6.3 Desinstalar

Borrar el folder `E:\Ciszu Network\.opencode\skills\<nombre>\` y reiniciar opencode.

### 6.4 Permisos (opcional)

Las skills se cargan con permiso `allow` por defecto. Para restringir por patrón:

```json
{
  "permission": {
    "skill": { "*": "allow", "internal-*": "deny" }
  }
}
```

---

## 7. MCP clients: estado y decisión

**Antes de esta tarea**: no había ningún MCP server configurado (ni raíz ni global).
**Después**: se mantiene **sin MCP** por decisión de diseño.

Razones:
- Las 34 skills cubren metodología, oficina, diseño, redacción y orquestación sin deps externas.
- MCP añade procesos/servidores en runtime y secretos por endpoint (riesgo de fuga en repo
  público; ver `SECURITY_PROTOCOLS.md`).
- El ecosistema ya usa herramientas nativas (Supabase, Discord, GitHub) vía comandos del
  plugin de voz y scripts, no vía MCP.

**Cuándo reconsiderar MCP** (futuro): si se necesita acceso estructurado en vivo a un
servicio externo (p. ej. una API de analytics, búsqueda semántica o un navegador
controlado). En ese caso se configuraría `"mcp": { "<name>": { "type": "local",
"command": [...], "enabled": true } }` (ver `opencode.json`). Skills que requieren MCP
puntual (como `context7`) se instalarán solo si se añade ese servidor.

---

## 8. Cómo añadir skills nuevas al catálogo

1. Identificar el repo fuente (verificar stars, licencia MIT/Apache, mantenimiento).
2. Clonar en `clones/` y revisar el `SKILL.md` (frontmatter válido, sin secretos).
3. Copiar a `.opencode/skills/`, validar nombre/descripción, reiniciar opencode.
4. Actualizar este doc: añadir la fila a la galería (§3) y al índice de clones (§5).
5. (Si el repo aporta el activo completo) actualizar §4 con el link de lote.

Reglas: gratis/open-source preferido; nunca instalar una lib de runtime sin confirmar con
Ciszuko (`AGENTS.md` §7.1); los secretos nunca van en skills (son markdown que se leen en
claro).

---

## 9. Notas de mantenimiento

- `.opencode/skills/` es **gitignored**: las skills son locales a este PC. Si se quiere
  versionarlas en el repo, hay que quitar esa entrada de `.gitignore` (no recomendado:
  repo público + riesgo de bloat).
- Las skills pueden quedarse desactualizadas vs su repo: revisar `clones/` con
  `git pull` ocasional y re-copiar las afectadas.
- La carpeta `clones/` está gitignored y puede limpiarse de skills no usadas.

---

## 10. Historial

| Fecha | Cambio |
|---|---|
| 2026-08-31 | Doc creada (v1.0.0). Estado vanilla verificado (solo skill `puck`, sin MCP). 33 skills instaladas desde 4 fuentes clonadas; `MODELS_SKILLS_SYSTEM.md` + enlace en `AGENTS.md` |

---

_Última revisión: 2026-08-31._ Relacionado: `OPENCODE_SYSTEM.md` (voz + comandos),
`MODELS_LLM_SYSTEM.md` (historial/facturación de modelos), `TOOLS_SYSTEM.md` (clones y
herramientas), `VAULT_SYSTEM.md`, `AGENTS.md` (raíz), `DOCUMENTATION_SYSTEM.md`.