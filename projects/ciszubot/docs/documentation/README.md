# Documentación oficial — CiszuBot

Carpeta `documentation/` del proyecto **CiszuBot** (bot de Discord + landing web + base de datos Supabase). Contiene la **documentación oficial** del proyecto, mantenida por el equipo (agentes + CEO) y revisada en commits como el resto del repositorio.

> **Nota sobre estado**: los docs de estado y TODO (`PROJECT_STATE.md`, `PROJECT_HISTORY.md`, `TODO.md`) se mantienen **intactos** en cada migración de documentación; solo cambian con el flujo de trabajo del proyecto.

## Estándar de documentación

La documentación sigue el estándar de Ciszu Network descrito en `DOCUMENTATION_SYSTEM.md` (ciszu): nombres en inglés en MAYÚSCULAS con sufijos `_SYSTEM`/`_PLAN`/`_PROTOCOLS`, cabecera con versión/actualización/identificador, contenido en español y referencias cruzadas con `` `NOMBRE.md` ``.

## Índice por categorías

### Sistemas
| Documento | Descripción |
| --- | --- |
| `ARCHITECTURE.md` | Arquitectura real: estructura del monorepo, componentes (bot + web + DB), flujos, modelo de datos y decisiones de diseño |
| `STACK_SYSTEM.md` | Pila tecnológica por capas: Next.js 15, Discord.js v14 + TypeScript, Supabase, Docker y herramientas |
| `WORKFLOW_SYSTEM.md` | Flujo de trabajo: comandos pnpm, Docker, pipeline de docs, git, protocolos de sesión y troubleshooting |

### Protocolos
| Documento | Descripción |
| --- | --- |
| `DISCORD_SECURITY_PROTOCOLS.md` | Seguridad específica de Discord: token, invite/permisos, rate limits, datos de usuarios y verificación de comandos |

### Planes
| Documento | Descripción |
| --- | --- |
| `BRAND_PLAN.md` | Identidad visual del bot: logos, paleta, tipografía, banners, flyers y thumbnails |

### Estado
| Documento | Descripción |
| --- | --- |
| `PROJECT_STATE.md` | Estado actual del proyecto y pendientes (intacto) |
| `PROJECT_HISTORY.md` | Historial de hitos (intacto) |
| `TODO.md` | Lista de tareas pendientes (intacto) |

## Referencias ciszu

Estándares y planes corporativos aplicables a este proyecto (viven en `projects/ciszu/docs/documentation/`):

| Documento | Descripción |
| --- | --- |
| `SECURITY_PROTOCOLS.md` | Seguridad genérica del ecosistema (RLS, rate limits, secretos, XSS, SQLi) |
| `CODE_PRINCIPLES_PROTOCOLS.md` | Principios de código (DRY, KISS, YAGNI, SOLID) |
| `DEVSECOPS_SYSTEM.md` | SAST/DAST y shift-left |
| `DOCUMENTATION_SYSTEM.md` | Estándar del propio sistema de documentación |
| `VPS_PLAN.md` | Plan de hosting 24/7 del bot (recomendación Oracle Free Tier) |

## Reglas

- Cambiar esta documentación = actualizar también las referencias cruzadas (paths, `docs/*.md`, scripts).
- No borrar secciones sin antes actualizar quién las referencia.
- No borrar ni modificar los docs de estado/TODO salvo en el flujo de trabajo establecido.
- No crear duplicados de los docs corporativos de ciszu: referenciarlos.
- Los docs nuevos deben cumplir el estándar de `DOCUMENTATION_SYSTEM.md` (ciszu) y superar las ~200 líneas para sistemas/plan/protocolo.
- El bot está implementado en TypeScript (v3.2.0, 72 comandos, 9 categorías): los docs deben reflejar el estado actual, nunca estados obsoletos.



