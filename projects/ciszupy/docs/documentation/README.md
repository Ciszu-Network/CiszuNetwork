# Documentación oficial — CiszuPy

Carpeta `documentation/` del proyecto **CiszuPy** (paquete Python + CLI). Contiene la documentación oficial del proyecto, mantenida por el equipo (agentes + CEO) y revisada en commits como el resto del repositorio.

## Estándar de documentación

La documentación sigue el estándar de Ciszu Network descrito en `DOCUMENTATION_SYSTEM.md` (ciszu): nombres en inglés en MAYÚSCULAS con sufijos `_SYSTEM`/`_PLAN`/`_PROTOCOLS`, cabecera con versión/actualización/identificador, contenido en español y referencias cruzadas con `` `NOMBRE.md` ``.

## Índice por categorías

### Sistemas
| Documento | Descripción |
| --- | --- |
| `ARCHITECTURE.md` | Arquitectura del paquete: estructura `src/`, módulos, entrypoints y flujos |
| `STACK_SYSTEM.md` | Pila tecnológica: Python 3.10+, Poetry, Typer, Rich, Keyboard |
| `WORKFLOW_SYSTEM.md` | Flujo de trabajo: build, test, publish a PyPI/TestPyPI |

### Protocolos
| Documento | Descripción |
| --- | --- |
| `DISCORD_SECURITY_PROTOCOLS.md` | Seguridad para releases y publicación de paquetes |

### Planes
| Documento | Descripción |
| --- | --- |
| `BRAND_PLAN.md` | Identidad visual del paquete: logos, iconos, documentación |
| `IMPLEMENTATION_PLAN_PROTOCOLS.md` | Plan de implementación y publicación |
| `PRD_PROTOCOLS.md` | Requisitos de producto |
| `TRD_PROTOCOLS.md` | Requisitos técnicos |
| `UIDBUXDB_PROTOCOLS.md` | Diseño UI/UX y experiencia de CLI |
| `WORKFLOW_APP_PROTOCOLS.md` | Protocolos de flujo de app |

### Estado
| Documento | Descripción |
| --- | --- |
| `PROJECT_STATE.md` | Estado actual del proyecto |
| `PROJECT_HISTORY.md` | Historial de hitos |
| `TODO.md` | Tareas pendientes |

## Referencias ciszu

| Documento | Descripción |
| --- | --- |
| `SECURITY_PROTOCOLS.md` | Seguridad genérica del ecosistema |
| `CODE_PRINCIPLES_PROTOCOLS.md` | Principios de código (DRY, KISS, YAGNI, SOLID) |
| `DEVSECOPS_SYSTEM.md` | SAST/DAST y shift-left |
| `DOCUMENTATION_SYSTEM.md` | Estándar del sistema de documentación |

## Reglas

- Cambiar esta documentación = actualizar también las referencias cruzadas.
- No borrar secciones sin antes actualizar quién las referencia.
- No borrar ni modificar los docs de estado/TODO salvo en el flujo de trabajo establecido.
- Los docs nuevos deben cumplir el estándar de `DOCUMENTATION_SYSTEM.md` y superar las ~200 líneas para sistemas/plan/protocolo.
