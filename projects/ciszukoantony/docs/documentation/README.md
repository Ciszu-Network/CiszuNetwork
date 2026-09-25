# Documentación oficial — Ciszuko Antony (Portfolio)

Esta carpeta (`docs/documentation/`) contiene la **documentación oficial** del portfolio de
**Ciszuko Antony** (Francisco García). La mantienen el equipo (agentes + CEO), se revisa en
commits como el resto del repo y es la fuente de verdad para arquitectura, stack, flujo de
trabajo, marca y estado del proyecto.

Los documentos siguen el **estándar de documentación de Ciszu Network**: nombres de archivo en
inglés, MAYÚSCULAS, separador `_`, sufijos `_SYSTEM`/`_PLAN`/`_PROTOCOLS`, cabecera
estándar y contenido en español. Las reglas del propio sistema de documentación viven en
ciszu: `projects/ciszu/docs/documentation/DOCUMENTATION_SYSTEM.md`.

## Índice

### Sistemas

| Documento | Qué documenta |
|---|---|
| `ARCHITECTURE.md` | Estructura del proyecto, layout del website y pipeline de documentación |
| `STACK_SYSTEM.md` | Stack tecnológico por capas, fuentes, redes y versionado |
| `WORKFLOW_SYSTEM.md` | Comandos, pipeline de docs, git, protocolos de sesión y troubleshooting |

### Planes

| Documento | Qué documenta |
|---|---|
| `BRAND_PLAN.md` | Identidad visual de marca, logos, tipografía, multimedia y checklist |
| `PROMPTS_PLAN.md` | Prompts de IA para redes, OBS, música y contenido |

### Estado

| Documento | Qué documenta |
|---|---|
| `PROJECT_STATE.md` | Estado actual del proyecto (unificado, resumen + detalle) |
| `PROJECT_HISTORY.md` | Changelog cronológico (historial) |
| `TODO.md` | Tareas pendientes (solo lo edita Ciszuko Antony) |

### Referencias a ciszu

Los estándares corporativos no se duplican en este proyecto; viven en
`projects/ciszu/docs/documentation/` y se referencian desde aquí:

- `SECURITY_PROTOCOLS.md` — Protocolos de seguridad (RLS, secretos, rate limit, CSP).
- `CODE_PRINCIPLES_PROTOCOLS.md` — Principios de ingeniería (DRY, KISS, YAGNI, SOLID).
- `DEVSECOPS_SYSTEM.md` — Seguridad integrada (SAST/DAST, shift-left).
- `DOCUMENTATION_SYSTEM.md` — Reglas del sistema de documentación (estándar).

## Reglas

- Cambiar esta documentación = actualizar también las referencias cruzadas (paths,
  `docs/*.md`, scripts).
- No borrar secciones sin antes actualizar quien las referencia.
- Todo doc de sistema/plan/protocolo debe tener **≥200 líneas** y cabecera estándar
  (excepto los docs de estado y este índice).
- Los docs de estado (`PROJECT_STATE.md`, `PROJECT_HISTORY.md`, `TODO.md`) se
  mantienen **intactos**.
- Contenido en español; identificador y cabecera según `DOCUMENTATION_SYSTEM.md` (ciszu).

_Última revisión: 14 ago 2026._ Relacionado: `DOCUMENTATION_SYSTEM.md` (ciszu),
`ARCHITECTURE.md`, `STACK_SYSTEM.md`, `WORKFLOW_SYSTEM.md`, `BRAND_PLAN.md`,
`PROMPTS_PLAN.md`, `PROJECT_STATE.md`.


