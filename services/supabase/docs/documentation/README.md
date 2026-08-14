# Documentación oficial — Supabase (services)

Esta carpeta (`docs/documentation/`) contiene la **documentación oficial** de la
infraestructura Supabase de Ciszu Network (`services/supabase/`). Es la fuente de verdad para
la base de datos, migraciones, auth, RLS, Storage/CDN y administración del proyecto
`obwzzmbvkrcscqwptlqo`.

## Estándar

La documentación sigue el **estándar de Ciszu Network** descrito en
`projects/ciszu/docs/documentation/DOCUMENTATION_SYSTEM.md`:

- Nombres de archivo en inglés, MAYÚSCULAS, separador `_`: `<NOMBRE>_<SUFIJO>.md`.
- Sufijos: `_SYSTEM` (mantener) · `_PLAN` (implementar) · `_PROTOCOLS` (normas).
- Cabecera estándar: Versión / Actualización / Identificador (···/ Definición).
- Contenido en español; ≥200 líneas salvo docs de estado e índices.
- No se usa el sufijo `_GUIDE` (las guías son `_PLAN`); no existen docs `AGENT_*`.

## Documentos

| Documento | Qué documenta |
|---|---|
| `TODO.md` | Tareas pendientes de la base de datos (solo lo edita Ciszuko Antony) |
| `README.md` | Este índice |

## Referencias

La documentación genérica de BD y seguridad vive en ciszu y se referencia, no se duplica:

- `projects/ciszu/docs/documentation/DB_SYSTEM.md` — esquemas, consultas, infraestructura.
- `projects/ciszu/docs/documentation/SECURITY_PROTOCOLS.md` — RLS, secretos, rate limit.
- `projects/ciszu/docs/documentation/DEVSECOPS_SYSTEM.md` — SAST/DAST, auditorías.
- `projects/ciszu/docs/documentation/VAULT_SYSTEM.md` — credenciales (nunca en docs).
- `projects/ciszu/docs/documentation/DOCUMENTATION_SYSTEM.md` — reglas de docs (estándar).

## Reglas

- Cambiar esta documentación = actualizar también las referencias cruzadas (paths,
  `docs/*.md`, scripts).
- No borrar secciones sin antes actualizar quien las referencia.
- **Nunca pegar credenciales aquí**: los secrets viven solo en `services/supabase/.env`
  (gitignored). Ver `SECURITY_PROTOCOLS.md` (ciszu).

_Última revisión: 14 ago 2026._ Relacionado: `DB_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`DOCUMENTATION_SYSTEM.md` (ciszu).