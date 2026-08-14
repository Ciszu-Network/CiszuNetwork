# Documentación oficial — MuzicMania

Esta carpeta (`docs/documentation/`) contiene la **documentación oficial** del proyecto
**MuzicMania** (juego de ritmo: web Next.js 15 + app desktop Tauri + Supabase schema
`muzicmania`). La mantiene el equipo (agentes + CEO), se revisa en commits como el resto del
repo y es la fuente de verdad para decisiones, arquitectura, estándares y estado.

## Estándar de documentación

Todos los docs siguen el estándar de Ciszu Network: nombres en inglés/mayúsculas con sufijo
`_SYSTEM`/`_PLAN`/`_PROTOCOLS`, cabecera con versión/actualización/identificador,
definición de 1-2 líneas y contenido en español. Las reglas completas viven en
`` `DOCUMENTATION_SYSTEM.md` `` (ver ciszu).

## Índice por categorías

### Sistemas

| Doc | Descripción |
|---|---|
| `` `TAURI_SYSTEM.md` `` | Integración desktop con Tauri v2 (webview shell, builds, MSI/NSIS, releases) |
| `` `ICON_SYSTEM.md` `` | Sistema de iconos SVG del juego (sprites, `icons:build`, uso con `<use>`) |

### Planes

| Doc | Descripción |
|---|---|
| `` `BRAND_PLAN.md` `` | Identidad visual del juego: logos, paleta, tipografía y multimedia |
| `` `SVG_CENTERING_PLAN.md` `` | Patrón CSS para centrar `<use>` en contenedores circulares/badges |

### Protocolos

| Doc | Descripción |
|---|---|
| `` `DOC_EXPORT_PROTOCOLS.md` `` | Exportación de documentación oficial (nomenclatura, txt/md/docx/pdf, script `export-docs.js`) |

### Estado

| Doc | Descripción |
|---|---|
| `` `PROJECT_HISTORY.md` `` | Historial del proyecto |
| `` `PROJECT_STATE.md` `` | Estado actual del proyecto |
| `` `TODO.md` `` | Pendientes y roadmap |

> Los docs de estado (`PROJECT_HISTORY.md`, `PROJECT_STATE.md`, `TODO.md`) se mantienen
> intactos como fuente de verdad del avance.

## Referencias Ciszu Network

Documentación corporativa/genérica no duplicada aquí; vive en
`projects/ciszu/docs/documentation/`:

| Doc | Tema |
|---|---|
| `` `SECURITY_PROTOCOLS.md` `` (ver ciszu) | Seguridad obligatoria en implementaciones |
| `` `CODE_PRINCIPLES_PROTOCOLS.md` `` (ver ciszu) | Principios de ingeniería (DRY, KISS, YAGNI, SOLID) |
| `` `DEVSECOPS_SYSTEM.md` `` (ver ciszu) | SAST/DAST y shift-left |
| `` `IT_GLOSSARY_PROTOCOLS.md` `` (ver ciszu) | Glosario técnico |
| `` `INSTALLERS_SYSTEM.md` `` (ver ciszu) | Packaging e instaladores del ecosistema |
| `` `FULL_STACK_SYSTEM.md` `` (ver ciszu) | Stack global del ecosistema |
| `` `STYLES_SYSTEM.md` `` (ver ciszu) | Estándares de estilos |
| `` `COLOR_SYSTEM.md` `` (ver ciszu) | Sistema de color |
| `` `VAULT_SYSTEM.md` `` (ver ciszu) | Credenciales y secretos |

## Reglas

- Cambiar esta documentación = actualizar también las referencias cruzadas (paths,
  `docs/*.md`, scripts).
- No borrar secciones sin antes actualizar quién las referencia.
- La documentación es oficial: se revisa en commits y no es basura de agentes.
- Los doc de sistema/protocolo/guía deben cumplir el mínimo de líneas del estándar.
