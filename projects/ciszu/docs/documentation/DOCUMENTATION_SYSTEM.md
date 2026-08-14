# DOCUMENTATION_SYSTEM — Sistema de Documentación de los Proyectos (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: DOCUMENTATION_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que define **cómo funciona la documentación** del ecosistema: normas
> de cabecera, nomenclatura de archivos, sufijos y prefijos, reglas de formato, orden y
> organización, nivel de calidad y límites de líneas. Es el manual de referencia para crear,
> ampliar o replicar documentación en cualquier proyecto de Ciszu Network.

---

## 1. Propósito y alcance

Este documento establece las **reglas del propio sistema de documentación**. Se aplica a toda
carpeta `docs/documentation/` de los proyectos de Ciszu Network (hoy: el monorepo principal en
`projects/ciszu/docs/documentation/`). Su objetivo es que la documentación sea:

- **Consistente**: mismo formato, misma estructura, misma calidad en todos los archivos.
- **Verificable**: reglas automáticamente comprobables (líneas, cabecera, refs).
- **Replicable**: cualquier proyecto nuevo puede copiar este patrón completo.
- **Oficial**: la documentación es fuente de verdad (no basura de agentes), se revisa en
  commits como el resto del repo.

> Los docs de otros proyectos (muzicmania, ciszubot) usan todavía el sistema **antiguo**
> (amalgama sin cabecera ni nomenclatura). Este documento es el estándar **objetivo**; la
> migración se hace progresivamente, empezando por ciszu.

## 2. Ubicación y formato

| Aspecto | Regla |
|---|---|
| **Carpeta** | `docs/documentation/` dentro de cada proyecto |
| **Formato** | Markdown (`.md`) |
| **Idioma de contenido** | Español |
| **Idioma de nombres de archivo** | Inglés |
| **Encoding** | UTF-8 |
| **Line endings** | LF (evitar mezclas) |

- Un solo doc por tema/sistema. No duplicar información entre docs: las referencias cruzadas
  apuntan al doc fuente.

## 3. Nomenclatura de archivos

### 3.1 Formato del nombre

```
<NOMBRE>_<SUFIJO>.md
```

- **`<NOMBRE>`**: identificador corto del tema en **inglés, MAYÚSCULAS, separado por guiones
  bajos** (`_`). Sin espacios, sin acentos, sin guiones medios (`-`).
- **`<SUFIJO>`**: tipo de documento (ver §4).

### 3.2 Ejemplos

| Archivo | Tema |
|---|---|
| `FRONTEND_SYSTEM.md` | Sistema de frontend |
| `BACKEND_SYSTEM.md` | Sistema de backend |
| `SECURITY_PROTOCOLS.md` | Protocolos de seguridad |
| `COMPANY_REGISTRATION_PLAN.md` | Plan de registro de empresa |
| `DOCUMENTATION_SYSTEM.md` | Reglas de la documentación (este doc) |

### 3.3 Reglas del nombre

- **Siempre en mayúsculas**: `COLOR_SYSTEM.md`, no `color_system.md`.
- **Separador único**: guion bajo `_` (nunca `-` ni espacio).
- **Sin plurales innecesarios** ni abreviaturas ambiguas.
- **Único**: el nombre identifica unívocamente el doc (buscar duplicados antes de crear).

## 4. Sufijos de documento

| Sufijo | Significado | Uso |
|---|---|---|
| `_SYSTEM` | Sistema | Documenta un **sistema** existente (cómo funciona, reglas, estado): `DB_SYSTEM`, `AUTH_SYSTEM`, `FRONTEND_SYSTEM` |
| `_PLAN` | Plan | Documenta un **plan/roadmap/guía** de algo a implementar o decidir: `COMPANY_REGISTRATION_PLAN`, `RAG_VECTORS_PLAN` |
| `_PROTOCOLS` | Protocolos | Documenta **normas/procedimientos** obligatorios: `SECURITY_PROTOCOLS`, `SCHEDULE_PROTOCOLS` |
| `_HISTORY` / `_STATE` / `_STATUS` | Estado | Documentos vivos de estado/historial (convención especial) |

### 4.1 Elección del sufijo

- ¿Es un sistema que **ya funciona** y hay que mantener? → `_SYSTEM`.
- ¿Es algo **planificado** (pasos, decisiones, roadmap)? → `_PLAN`.
- ¿Es un conjunto de **reglas obligatorias**? → `_PROTOCOLS`.
- ¿Es un **registro de estado** que se actualiza en cada sesión? → convención de estado (§7).

## 5. Cabecera estándar

Todo doc **debe** empezar con una cabecera de 6 líneas:

```
# <NOMBRE> — Título descriptivo (Ciszu Network)

Versión: X.Y.Z
Actualización: AAAA-MM-DD
Identificador: <NOMBRE>_V<X.Y.Z>_<AAAA>_<MM>_<DD>_ciszunetwork

> **Definición**: resumen de 1-2 líneas de qué documenta este doc.
```

### 5.1 Reglas de la cabecera

| Línea | Regla |
|---|---|
| **Título** | `# <NOMBRE>` (idéntico al nombre del archivo sin `.md`) + `—` + descripción + `(Ciszu Network)` |
| **Versión** | Semver `MAJOR.MINOR.PATCH`; `1.0.0` al crear, sube con cambios sustanciales |
| **Actualización** | Última fecha de modificación (formato `AAAA-MM-DD`) |
| **Identificador** | `<NOMBRE>_V<X.Y.Z>_<AAAA>_<MM>_<DD>_ciszunetwork` (derivado de la cabecera) |
| **Definición** | Bloque de cita (`>`) con el propósito del doc en 1-2 líneas |

### 5.2 Ejemplo de cabecera

```
# AUTH_SYSTEM — Sistema de Autenticación (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: AUTH_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta la autenticación (Supabase Auth, OAuth, sesiones JWT)
> de los proyectos de Ciszu Network: proveedores, flujos y reglas de seguridad.
```

## 6. Reglas de formato del contenido

### 6.1 Cabeceras de sección

- Secciones numeradas cuando el doc es secuencial/procedimental: `## 1.`, `## 2.`, …
- Secciones temáticas sin número en docs de referencia (ej. `## Tokens de estilo`).
- Una sola `#` (título). Solo una `##` a nivel superior de sección.

### 6.2 Elementos permitidos

| Elemento | Uso |
|---|---|
| Tablas | Para comparativas, inventarios, reglas, troubleshooting |
| Listas | Checklist (`- [ ]`), pasos ordenados (`1.`) |
| Bloques de código | Comandos, SQL, TS/JS, CSS (con lenguaje) |
| Citas (`>`) | Definiciones, avisos, resaltar decisiones |
| Negrita/cursiva | Énfasis moderado (claves, términos) |

### 6.3 Referencias cruzadas

- Se escriben con el **nombre exacto del archivo**: `` `DB_SYSTEM.md` ``.
- Al final del doc, línea de cierre con referencias relacionadas:
  ```
  _Última revisión: AAAA-MM-DD._ Relacionado: `X.md`, `Y.md`, `Z.md`.
  ```
- **Nunca** inventar un archivo que no exista; si el doc no existe aún, indicarlo con
  `(crear)` (ej. `PACKAGES_SYSTEM.md (crear)`).

### 6.4 Prohibiciones de formato

- Sin HTML en el markdown (salvo excepciones justificadas).
- Sin emojis en el contenido (regla general del repo).
- Sin líneas de cierre duplicadas ni cabeceras duplicadas.
- Sin contenido inventado: los hechos (cifras, rutas, versión) deben ser verificables.

## 7. Convención de docs de estado

Los docs `PROJECT_STATE.md` (unificado: resumen + detalle), `PROJECT_HISTORY.md` y `TODO.md` son **documentos
vivos** que se actualizan en cada sesión:

| Archivo | Contenido |
|---|---|
| `PROJECT_STATE.md` | Estado actual del proyecto (unificado: resumen ejecutivo + detalle por componente) |
| `PROJECT_HISTORY.md` | Changelog cronológico (historial) |
| `TODO.md` | Lista de tareas pendientes (solo edita Ciszuko Antony) |

- Suelen ser más cortos que 200 líneas; el límite de líneas no aplica a estos (excepción).
- Siguen el cierre `_Última revisión: ..._` cuando procede.

## 8. Organización y orden de la carpeta

Se organiza en **categorías** (secciones del `AGENTS.md`):

| Categoría | Sufijo predominante | Ejemplos |
|---|---|---|
| Sistemas | `_SYSTEM` | `DB_SYSTEM`, `AUTH_SYSTEM`, `FRONTEND_SYSTEM` |
| Arquitectura por capas | `_SYSTEM` | `FRONTEND_SYSTEM`, `BACKEND_SYSTEM`, `PACKAGES_SYSTEM` |
| Planes | `_PLAN` | `COMPANY_REGISTRATION_PLAN`, `RAG_VECTORS_PLAN`, `BRAND_PLAN` |
| Protocolos de contexto | `_PROTOCOLS` | `SCHEDULE_PROTOCOLS`, `SECURITY_PROTOCOLS` |
| Estado | especial | `STATUS`, `PROJECT_STATE`, `PROJECT_HISTORY`, `TODO` |

- Orden alfabético dentro de cada categoría.
- El índice global de docs vive en `AGENTS.md` (sección "Documentación técnica") y en
  `README.md` de la carpeta.

## 9. Nivel de calidad

### 9.1 Límite de líneas

- **Mínimo: 200 líneas** de contenido útil por doc de sistema/plan/protocolo.
- **Objetivo**: 200-260 líneas (evitar inflado artificial).
- **Excepciones**: docs de estado (`STATUS`, `PROJECT_STATE`, `PROJECT_HISTORY`, `TODO`),
  `README.md` e índices.
- El límite se verifica con un comando (ver §11). Un doc <200 líneas debe ampliarse con
  secciones útiles (tables, procedimientos, FAQ) antes de darlo por cerrado.

### 9.2 Criterios de "listo" de un doc

- [ ] Cabecera estándar completa y correcta (§5).
- [ ] Nombre de archivo con nomenclatura correcta (§3).
- [ ] ≥200 líneas de contenido (salvo excepción).
- [ ] Referencias cruzadas reales (sin archivos inventados).
- [ ] Línea de cierre `_Última revisión: ..._` con relacionados.
- [ ] Contenido verificado (no inventado) y en español.

### 9.3 Anti-patrones de documentación

| Anti-patrón | Evitar |
|---|---|
| Doc sin cabecera | Siempre llevar cabecera estándar |
| Doc de 40 líneas | Ampliar hasta ≥200 (si es sistema/plan) |
| Nombre con `-` o minúsculas | `SCHEMA_SYSTEM.md`, nunca `schema-system` |
| Cabecera duplicada | Una sola cabecera por archivo |
| Hechos inventados | Verificar con código/dashboard/salida real |
| Docs huérfanos | Todo doc referenciado desde AGENTS/otros docs |

## 10. Ciclo de vida de un documento

### 10.1 Crear

1. Detectar el tema (sistema/plan/protocolo) y comprobar que no exista.
2. Elegir sufijo correcto (§4) y nombre (`<NOMBRE>_<SUFIJO>.md`).
3. Escribir cabecera estándar (§5).
4. Desarrollar contenido hasta ≥200 líneas con secciones y tablas.
5. Añadir cierre con referencias relacionadas.
6. Registrar en `AGENTS.md` (categoría correcta) y en `README.md`.
7. Verificar con el script de control (§11).

### 10.2 Ampliar

- Si un doc <200 líneas: añadir secciones útiles sobre el tema (procedimientos, tablas de
  referencia, troubleshooting, FAQ, relación con otros sistemas). No inflar con relleno.

### 10.3 Renombrar

- Cambiar el nombre del archivo + la cabecera (título e identificador) + **todas las
  referencias** (docs, AGENTS, README, scripts).
- Buscar referencias con `rg "<NOMBRE>"` antes y después del cambio.
- Ejemplo real: `FULL_STACK.md` → `FULL_STACK_SYSTEM.md` (nombre, cabecera, identificador,
  refs en 11 archivos y AGENTS).

### 10.4 Retirar

- Avisar al usuario (nunca borrar sin permiso).
- Buscar referencias cruzadas y actualizarlas.
- Quitar de AGENTS/README.
- Registrar el retiro en `PROJECT_HISTORY`.

## 11. Verificación automática

Comando para comprobar cabecera y líneas de todos los docs:

```powershell
$doc='projects/ciszu/docs/documentation'
Get-ChildItem $doc/*.md | ForEach-Object {
  $c=(Get-Content $_.FullName).Count
  $h=[bool](Select-String $_.FullName -Pattern '^Versión:' -Quiet)
  "$($_.Name): $c líneas header=$h"
}
```

- `<200` con `header=True` → falta ampliar.
- `header=False` → falta cabecera (salvo docs de estado/README).
- También verificar refs: `rg "NOMBRE_DOC"` para detectar nombres desactualizados.

## 12. Sistema de replicación a otros proyectos

Ciszu Network tiene **un solo monorepo** con varios proyectos (ciszu, ciszukoantony,
muzicmania, ciszubot). Cada proyecto tiene su carpeta `docs/documentation/`. La documentación
de **ciszu es el modelo de referencia**; los demás proyectos se **replican** siguiendo reglas
de supervisión humana. Este sistema define cómo se hace esa replicación.

### 12.1 Principios de la replicación

| Principio | Regla |
|---|---|
| **Supervisada y semimanual** | Nunca reemplazo automático total. Se revisa **uno por uno**. |
| **Sin duplicación innecesaria** | Un documento solo se replica si el proyecto lo necesita **y tiene contenido propio**. |
| **Sin tocar listas de tareas** | `TODO.md` de cada proyecto queda **intacto** (solo lo edita Ciszuko Antony). |
| **ciszu = referencia** | ciszu sigue y será el proyecto con más docs. Los demás siguen el patrón. |
| **No replicar lo idéntico** | Si el doc no aporta nada distinto (ej. el propio `DOCUMENTATION_SYSTEM`), **no** se copia. |
| **No replicar planes de ciszu** | `TAX_PLAN`, `COMPANY_REGISTRATION_PLAN`, etc. viven en ciszu; los proyectos no los duplican. |

### 12.2 ¿Qué se replica? (criterio de decisión)

Un documento de ciszu se replica a otro proyecto si cumple **todas** estas condiciones:

1. **Aplica al proyecto** (el proyecto usa ese sistema o tema).
2. **Tiene contenido propio** que replicar (estado, historia, infraestructura del proyecto,
   reglas específicas), no solo una copia de lo genérico.
3. **No es un doc corporativo único** de ciszu (planes fiscales/legales, business, vault,
   etc.).
4. **Su ausencia sería una pérdida real** para el proyecto.

Ejemplos concretos:

| Tipo de doc | ¿Se replica? |
|---|---|
| Estado/historia del proyecto (`PROJECT_STATE`, `PROJECT_HISTORY`, `STATUS`, `TODO`) | **Sí** — contenido propio de cada proyecto; el `TODO` además queda **intacto** |
| Índice de la carpeta (`README.md`) | **Sí** — cada proyecto tiene el suyo (índice + referencia al estándar) |
| Infraestructura especializada del proyecto (`STACK`/`ARCHITECTURE`/`WORKFLOW` adaptados) | **Sí** — adaptado al proyecto (comandos, servicios, rutas reales) |
| Guías/protocolos específicos del proyecto (Tauri, marca personal, seguridad del bot, console debug) | **Sí** — contenido exclusivo del proyecto |
| Reglas corporativas idénticas (`CODE_PRINCIPLES`, `DEVSECOPS`, `SECURITY`, `TESTING`, `MONITORING`, `FRONTEND`, `BACKEND`, `FRAMEWORKS`, `STYLES`, `COLOR`, `ICON`, `FULL_STACK`) | **No como copia** — viven en ciszu y se **referencian**; solo se crea una variante en el proyecto si aporta algo distinto (con nombre propio, ej. `DISCORD_SECURITY_PROTOCOLS`) |
| `DOCUMENTATION_SYSTEM` | **No** — es el estándar global; vive solo en ciszu |
| Planes corporativos (`TAX_PLAN`, `RIF_PERSON_PLAN`, `COMPANY_REGISTRATION_PLAN`, `TRADEMARK_PLAN`, `INTERNATIONAL_LLC_PLAN`, `VPS_PLAN`) | **No** — ya están sujetados a ciszu |
| `VAULT_SYSTEM`, `BUSINESS_SYSTEM`, `PAYMENTS_SYSTEM` | **No** — son del ecosistema central (ciszu) |

> **Regla de oro**: si el documento sería **idéntico** al de ciszu, no se copia: se referencia
> (`` `SECURITY_PROTOCOLS.md` (ver ciszu) ``). Solo se replica lo que tiene contenido
> **propio y específico** del proyecto.

### 12.3 Prohibiciones durante la replicación

- **No borrar** `TODO.md` ni sus contenidos.
- **No tocar** documentación externa (fuera de `docs/documentation/` del propio proyecto):
  `docs/md/`, `docs/docx/`, `docs/pdf/`, `docs/txt/`, `docs/obs/`, READMEs de la raíz del
  repo, páginas de las webs, referencias externas. Eso se hace en una fase posterior.
- **No reemplazar** archivos de otros proyectos de forma masiva: cada cambio se lee y se
  justifica.
- **No duplicar** contenido idéntico que ya vive en ciszu (referencia, no copia).

### 12.4 Procedimiento de replicación (paso a paso)

1. **Inventariar** los docs actuales del proyecto destino (`docs/documentation/`).
2. **Clasificar** cada doc antiguo:
   - **Migrar**: se renombra a la nomenclatura nueva y se adapta (cabecera + contenido).
   - **Eliminar**: no aplica / es duplicado de ciszu / obsoleto.
   - **Mantener**: ya cumple el estándar (excepción: docs de estado).
3. **Definir la matriz destino** del proyecto (lista de docs que debe tener), siguiendo §12.2.
4. **Replicar**: para cada doc de la matriz, copiar/adaptar desde ciszu o migrar el antiguo.
   - Añadir **cabecera estándar** (§5) con el `<NOMBRE>` del proyecto destino.
   - Adaptar el **contenido** al proyecto (servicios reales, rutas, comandos).
   - Respetar **≥200 líneas** (salvo docs de estado).
5. **Actualizar referencias cruzadas** internas del proyecto (los docs que se renombran).
6. **Actualizar el `README.md`** del proyecto (índice por categorías).
7. **Registrar** los cambios en el `PROJECT_HISTORY` del proyecto.
8. **Verificar** con el script de control (§11) + búsqueda de refs rotas.

### 12.5 Matriz de replicación actual (estado objetivo)

| Doc | ciszu | ciszukoantony | muzicmania | ciszubot |
|---|---|---|---|---|
| `README` (índice) | ✅ | ✅ replicar | ✅ replicar | ✅ replicar |
| `PROJECT_STATE` / `PROJECT_HISTORY` / `TODO` (estado unificado en un solo doc) | ✅ | ✅ propio (intactos) | ✅ propio (intactos) | ✅ propio (intactos) |
| `ARCHITECTURE` / `WORKFLOW` adaptados al proyecto | ✅ | ✅ | ✅ | ✅ |
| `STACK` (específico) | ✅ | ✅ | ✅ | ✅ |
| Guías/protocolos exclusivos del proyecto | ✅ | `BRAND_PLAN` | `TAURI_SYSTEM`, `SVG_CENTERING_PLAN`, `DOC_EXPORT_PROTOCOLS` | `DISCORD_SECURITY_PROTOCOLS` |
| `CODE_PRINCIPLES`, `DEVSECOPS`, `SECURITY_PROTOCOLS` (copias idénticas) | ✅ | ❌ (referencia) | ❌ (referencia) | ❌ (referencia) |
| `FRONTEND/BACKEND/FRAMEWORKS/STYLES/COLOR/ICON/FULL_STACK` genéricos | ✅ | ❌ si idéntico | ❌ si idéntico | ❌ si idéntico |
| `PACKAGES_SYSTEM`, `DB_SYSTEM` | ✅ | ❌ (consumen los de ciszu) | ❌ (solo si BD propia relevante) | ❌ (solo si BD propia relevante) |
| `DOCUMENTATION_SYSTEM` | ✅ | ❌ | ❌ | ❌ |
| `TAX_PLAN` y planes corporativos | ✅ | ❌ | ❌ | ❌ |
| `VAULT_SYSTEM`, `BUSINESS_SYSTEM`, `PAYMENTS_SYSTEM` | ✅ | ❌ | ❌ | ❌ |

> La matriz se actualiza a medida que se replica. La regla general: **se replica lo que aporta
> contenido específico; lo idéntico se referencia a ciszu**.

### 12.6 Cierre de la replicación

Al terminar la replicación de un proyecto:

- [ ] Todos los docs destino cumplen cabecera y ≥200 líneas.
- [ ] Sin docs antiguos sin migrar (renombrados o eliminados).
- [ ] Sin duplicados de ciszu.
- [ ] `README.md` del proyecto actualizado.
- [ ] `TODO.md` intacto.
- [ ] Refs cruzadas internas correctas.
- [ ] Cambios registrados en el `PROJECT_HISTORY` del proyecto.

## 13. Preguntas frecuentes

**¿Los títulos internos van en mayúsculas también?** Sí: `# FRONTEND_SYSTEM — ...`.

**¿Un doc puede tener dos sufijos?** No. Un doc = un sufijo que refleja su tipo.

**¿El identificador debe coincidir con el nombre del archivo?** Sí, el prefijo `<NOMBRE>`
debe ser idéntico al del nombre del archivo (sin `.md`).

**¿Cuándo subir la versión?** Cambios sustanciales → `MINOR`; correcciones → `PATCH`;
reestructuración mayor → `MAJOR`. El identificador se actualiza en consecuencia.

**¿Los docs de otros proyectos deben ser ≥200 líneas también?** Sí, al migrarlos al sistema
nuevo. Mientras sigan el sistema antiguo no aplica la regla, pero el objetivo es migrarlos.

**¿`TODO.md` puede tener cabecera?** No es obligatorio: es un archivo de trabajo editado
solo por Ciszuko Antony.

## 14. Resumen ejecutivo

- La documentación es **oficial, consistente y verificable**: cabecera estándar, nombres en
  inglés MAYÚSCULAS con `_`, sufijos `_SYSTEM`/`_PLAN`/`_PROTOCOLS`, contenido en español.
- No se usa el sufijo `_GUIDE`; las guías se documentan como `_PLAN`.
- No existen documentos `AGENT_*` en los proyectos: la documentación es oficial, no de agentes.
- Todo doc de sistema/plan/protocolo debe tener **≥200 líneas** y cierre con referencias.
- Los cambios de nombre/cabecera/refs se hacen de forma atómica (archivo + header + refs).
- Este doc es la **plantilla de replicación** para otros proyectos y el estándar que
  reemplaza el sistema antiguo de documentación.

_Última revisión: 13 ago 2026._ Relacionado: `FRONTEND_SYSTEM.md`, `BACKEND_SYSTEM.md`,
`PACKAGES_SYSTEM.md`, `WORKFLOW_SYSTEM.md`, `STATUS_SYSTEM.md`, `AGENTS.md`.
