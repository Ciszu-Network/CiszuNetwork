# PROJECT_STATE — Estado de CiszuAI

Versión: 1.0.0
Actualización: 2026-10-02
Identificador: PROJECT_STATE_V1.0.0_2026_10_02_ciszunetwork

> **Definición**: estado actual del proyecto **CiszuAI** (capa de inteligencia artificial del
> ecosistema Ciszu Network: permisos de modelos Gemini para los agentes/IA de Ciszuko
> Antony). Documento vivo: se actualiza en cada sesión. Solo lo edita Ciszuko Antony.

## Naturaleza del proyecto

CiszuAI **no es una website**. Es la **capa de permisos de modelos de IA** (Google Gemini)
que habilita a los agentes del ecosistema (opencode/Kilo/Freebuff, etc.) a usar los modelos
LLM. Vive en el proyecto GCP **`gen-lang-client-0885445248`** (projectId `gen-lang-client-0885445248`,
nombre visual *CiszuAI*), no en un proyecto Vercel.

## Estado actual

| Componente | Estado | Notas |
|---|---|---|
| Proyecto GCP CiszuAI (`gen-lang-client-0885445248`) | ✅ Activo | Sin billing, dedicado a Gemini (`generativelanguage.googleapis.com`) |
| API de Generative Language | ✅ Habilitada | `generativelanguage.googleapis.com` + servicios asociados (`cloudaicompanion`, `geminicloudassist`) |
| Uso de modelos Gemini | ✅ Operativo | Permite a los agentes del ecosistema llamar a Gemini |
| Documentación oficial | ✅ Creada | Este archivo (`PROJECT_STATE.md`) |
| Carpeta en el monorepo | ✅ Creada | `projects/ciszuai/` |
| Billing | ❌ No | Sin necesidad: Gemini tiene free tier (modelos disponibles sin facturación) |

## Notas técnicas (02 oct 2026)

- El proyecto `gen-lang-client-0876617937` (también *CiszuAI*) está en **DELETE_REQUESTED**:
  es una copia antigua/duplicada; el activo es `gen-lang-client-0885445248`.
- `utilitarian-utility-94jp1` (sin nombre, con la cuenta de billing `01400A-193CC1-29BA63`
  ligada y roles free-tier) no se pudo borrar por API por falta de rol `owner`; está anotado
  para decisión manual del usuario.
- No hay API keys de Gemini expuestas en el repo: el acceso se da vía el proyecto y los
  permisos IAM correspondientes (ver `MODELS_LLM_SYSTEM.md` en la doc de ciszu).

## Próximos pasos

1. Decidir si el proyecto CiszuAI necesita datasets/APIs adicionales (BigQuery) o queda solo
   con Generative Language.
2. Limpieza manual (si se desea) del proyecto huérfano con billing.
3. Revisar si se quiere habilitar Gemini en los proyectos de las webs o mantenerlo aislado.

---

_Última revisión: 02 oct 2026._ Relacionados: `PROJECT_HISTORY.md` · `MODELS_LLM_SYSTEM.md` (ciszu) · `MODELS_SKILLS_SYSTEM.md` (ciszu).