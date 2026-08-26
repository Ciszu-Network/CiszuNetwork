# STAFF_SYSTEM — Sistema de Gestión de Empleados (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-25
Identificador: STAFF_SYSTEM_V1.0.0_2026_08_25_ciszunetwork

> **Definición**: sistema que gestiona la **documentación y organización real de los empleados**
> de Ciszu Network: estructura de carpetas en `archives/staff/`, fuente de verdad en
> `staff.json`, generación automática de los 5 formatos (md/txt/csv/docx/pdf) por nivel
> (general → cargo → empleado) y la consola **STAFFCON** (TUI) para añadir, quitar, cambiar
> rango o modificar empleados con control de permisos y log de sesión. Tarea `TODO.md`.

---

## 1. Visión general

Ciszu Network es hoy un monorepo de una sola persona (Ciszuko Antony / Francisco García). Este
sistema convierte la **organización del personal** en algo tangible y automático: cada empleado
tiene un **ID de empresa** (CZ-XXX), una carpeta física dentro de su cargo, y su ficha
documentada en 5 formatos. La consola STAFFCON permite mantenerlo todo sin editar archivos a
mano, con **permisos por cargo** y **traza completa** en logs.

Relación con otros docs:
- `EMPLOYEES_SYSTEM.md` — el **modelo organizacional** (catálogo de cargos, escala de rangos,
  permisos, horarios, ciclo de vida). Este doc es el **mecanismo** (carpetas, formatos, consola).
- `ORGANIZATIONAL_SCALABILITY_PLAN.md` — estrategia a futuro para escalar (accesos mínimos,
  permisos por rol). Este sistema es la **base de datos de personal** que esa estrategia consume.
- `BUSINESS_SYSTEM.md` — el marco de negocio; la estructura organizativa operativa vive aquí.

| Componente | Rol | Ubicación |
|---|---|---|
| `archives/staff/` | Estructura de documentación de empleados (general/cargo/empleado + content) | `archives/staff/` |
| `staff.json` | **Fuente de verdad** de empleados y cargos | `archives/staff/data/staff.json` |
| `scripts/staffgen.js` | Generador de los 5 formatos por nivel | `scripts/staffgen.js` |
| `scripts/staffcon.js` | Motor de la STAFFCON (operaciones + permisos + logs) | `scripts/staffcon.js` |
| `scripts/staffpdf.py` | Conversión md→pdf (reportlab, reusa `txt2pdf.py`) | `scripts/staffpdf.py` |
| `test/website/debug/staffcon.ps1` | TUI de la Staff Console (estética devcon) | `test/website/debug/staffcon.ps1` |
| Log de sesión | Registro de cada acción (quién/qué/cuándo/sesión) | `test/website/debug/local-logs/staffcon-<fecha>.log` |

---

## 2. Estructura de `archives/staff/`

La regla es **de lo general a lo particular**: general → cargo → empleado. Cada nivel tiene su
carpeta `docs/` con los **5 formatos** y su carpeta `content/` para contenido visual.

```
archives/staff/
├── data/
│   └── staff.json                     # FUENTE DE VERDAD (la edita la STAFFCON)
├── docs/                              # GLOBAL
│   ├── STAFF_GLOBAL.{md,txt,csv,docx,pdf}
│   └── content/{images,videos,profile}      # organigrama, imagenes de la empresa
├── CEO/                               # CARGO (uno por cada rol, 20 en total)
│   ├── docs/
│   │   └── STAFF_CEO.{md,txt,csv,docx,pdf}
│   ├── content/{images,videos,profile}
│   └── FRANCISCO_GARCIA/              # EMPLEADO (uno por persona en ese cargo)
│       ├── docs/
│       │   └── EMPLEADO_FRANCISCO_GARCIA_CEO.{md,txt,csv,docx,pdf}
│       └── content/{images,videos,profile}
├── CTO/  ├── CCO/  ├── COO/  ├── CMO/  ├── CFO/
├── Gerentes/  ├── Supervisores/  ├── Administradores/
├── RecursosHumanos/  ├── Ciberseguridad/  ├── DevOps/
├── Desarrolladores/  ├── UIUX/  ├── Disenadores/  ├── QA/
├── CommunityManagers/  ├── SoporteTecnico/  ├── Moderadores/
└── Betatesters/
```

- **Nivel general** (`docs/`): lista TODOS los empleados (activos e historial de bajas), los 20
  cargos con su nivel y la jerarquía. El `content/images` global es donde se colocan los
  **diseños de organigrama** de toda la empresa.
- **Nivel cargo** (`<cargo>/docs/`): ficha del cargo (nivel, responsabilidades, horario,
  permisos) + sus miembros activos.
- **Nivel empleado** (`<cargo>/<EMPLEADO>/docs/`): ficha del empleado **en ese cargo**
  (datos personales, contacto, redes, supervisor). Un empleado con varios cargos tiene su
  carpeta replicada en cada uno (el fundador aparece en los 20).

### 2.1 Carpetas `content/`

En cada nivel existe `content/{images,videos,profile}` (con `.gitkeep` para persistir en git):

| Carpeta | Contenido |
|---|---|
| `images/` | Imágenes del nivel: organigrama (global), banners/logos del cargo, foto/identidad del empleado |
| `videos/` | Videos del nivel: presentaciones, demos, reels |
| `profile/` | Perfiles visuales: avatares, portadas, foto de perfil del empleado |

---

## 3. Los 5 formatos por nivel

Cada carpeta `docs/` contiene exactamente 5 archivos con la misma base de nombre:

| Formato | Contenido |
|---|---|
| `.md` | Fuente legible (markdown), con cabecera Versión/Actualización/Identificador |
| `.txt` | Versión texto plano (derivada del md, sin markdown) |
| `.csv` | Datos estructurados (1 fila por empleado; en el nivel empleado, 1 fila única) |
| `.docx` | Documento Word (pandoc) |
| `.pdf` | Documento PDF (reportlab vía `scripts/staffpdf.py`) |

Todos se regeneran desde `staff.json` con `scripts/staffgen.js`. No se editan a mano: **cualquier
cambio se hace en la STAFFCON** y la generación se dispara automáticamente.

---

## 4. Fuente de verdad: `staff.json`

Es el único archivo que se edita (siempre a través de la STAFFCON). Esquema:

```jsonc
{
  "schemaVersion": "1.0.0",
  "actualizacion": "2026-08-25",
  "org": { "nombre", "fundador", "pais", "sede", "correo", "idioma", "prefijoId": "CZ" },
  "roles": [
    {
      "carpeta": "CEO",            // nombre de carpeta (ASCII, sin espacios)
      "nombre": "CEO",
      "displayName": "Director Ejecutivo",
      "nivel": 0,                  // 0 = mayor autoridad, 9 = base
      "permisos": { "anadir": true, "quitar": false, "rango": false, "modificar": true },
      "descripcion": "...",
      "responsabilidades": ["..."],
      "horario": "..."
    }
  ],
  "empleados": [
    {
      "id": "CZ-001",              // nunca se reutiliza
      "nombres": "Francisco",
      "apellidos": "Garcia",
      "telefono": "",
      "correo": "...",
      "direccion": "...",
      "redes": [],
      "cargo": "CEO",              // cargo principal
      "cargos": ["CEO", "CTO", ...], // cargos que ocupa (define sus carpetas)
      "supervisor": null,          // ID del que lo añadió (null = fundador)
      "fechaIngreso": null,
      "estado": "activo",          // activo | inactivo
      "registroBaja": null         // { eliminadoPor, fecha, motivo, datosPrevio }
    }
  ]
}
```

### 4.1 Reglas del modelo

1. **ID autoincremental** (`CZ-002`, `CZ-003`...): el motor asigna el siguiente libre. Un ID de
   baja **nunca se reutiliza**.
2. `cargos` define dónde vive la carpeta del empleado. `cargo` es el principal (identidad).
3. El **fundador** (`supervisor: null`, hoy CZ-001) no se puede quitar ni cambiar de rango.
4. Una **baja** conserva el registro (y los datos completos en el `.txt` de su carpeta).

---

## 5. STAFFCON — la consola

### 5.1 Arquitectura

```
staffcon.ps1 (TUI)  ──>  scripts/staffcon.js (motor)  ──>  staff.json
        │                      │   (valida identidad + permisos)
        │                      └──> scripts/staffgen.js (regenera docs de los niveles tocados)
        └──> local-logs/staffcon-<fecha>.log   (todo queda registrado)
```

- **TUI**: `test/website/debug/staffcon.ps1` — estética devcon (paleta neon, menús con flechas).
- **Motor**: `scripts/staffcon.js` — subcomandos `login|list|roles|add|remove|rank|modify`.
- **Generador**: `scripts/staffgen.js` — regenera solo los niveles afectados (rápido, ~3-4s).

### 5.2 Ingreso

1. **Password global** (la misma que la dev console, leída del vault
   `services/supabase/.env` → `DEVCON_PASSWORD`; nunca hardcodeada ni mostrada).
2. **Identidad**: menú para indicar quién eres por ID de empresa (`CZ-001` = Francisco García).
   Según los permisos de tu cargo podrás (o no) operar. La identidad puede cambiarse desde el
   menú principal.

### 5.3 Menú principal

| Opción | Qué hace |
|---|---|
| **Resumen** | Empleados actuales, rangos, información y ubicación exacta (nivel, cargo, carpetas) |
| **Añadir empleado** | Nombres, apellidos, teléfono, correo, dirección, ID auto, redes, cargo y supervisor |
| **Quitar empleado** | Baja: ID conservado, docs re-editadas como registro de baja |
| **Cambiar rango** | Ascender/descender/colocar un cargo (mueve la carpeta del empleado) |
| **Modificar datos** | Cualquier campo excepto el rango |
| **Otras herramientas** | Abrir carpetas, logs, regenerar docs, ver JSON |
| **Manual / Información** | Ayuda y créditos |
| **Salir** | Cierra la consola (los cambios ya están guardados y regenerados) |

### 5.4 Permisos (matriz)

| Cargo (nivel) | Añadir | Quitar | Cambiar rango | Modificar |
|---|---|---|---|---|
| CEO (0) | ✅ | ✅ | ✅ | ✅ |
| CTO/CCO/COO/CMO/CFO (1) | ✅ | — | — | ✅ |
| Gerentes (2) | ✅ | ✅ | ✅ | ✅ |
| Supervisores (3) | ✅ | ✅ | ✅ | ✅ |
| Administradores (4) | — | — | — | ✅ |
| Recursos Humanos (4) | — | — | — | ✅ |
| Resto (5-9) | — | — | — | — |

**Regla de jerarquía**: un cargo de nivel N solo gestiona cargos de nivel **mayor que N**
(números más altos = menos autoridad). Nadie se gestiona a sí mismo. El fundador es inmutable en
quitar/rango. La validación final la hace siempre el motor (`staffcon.js`), no la TUI.

---

## 6. Operaciones y efecto en los archivos

### 6.1 Añadir empleado

1. Se valida identidad + permiso `anadir` + jerarquía del cargo destino.
2. Se asigna el siguiente ID (`CZ-XXX`), se crea el registro en `staff.json` (`cargos=[cargo]`,
   `supervisor` = quien lo añade).
3. El generador crea `archives/staff/<cargo>/<NOMBRE_APELLIDOS>/` con sus 5 formatos y su
   `content/`, y actualiza los docs **global** y del **cargo** (el empleado aparece en ambos).
4. Queda registrado en el log.

### 6.2 Quitar empleado (baja)

1. Validación: permiso `quitar`, jerarquía, no a sí mismo, no al fundador.
2. `estado` → `inactivo` y se guarda `registroBaja` (quién, fecha, motivo, snapshot completo).
3. La **carpeta del empleado persiste** (el ID nunca se reutiliza) pero su `docs/` se re-edita:
   - `md`, `csv`, `docx`, `pdf` → **registro de baja mínimo** (ID, nombre, fecha, motivo, quién).
   - `txt` → conserva el **historial completo** del exempleado por seguridad.
4. Los docs **global** y del **cargo** dejan de listarlo como activo; pasa al historial de bajas.

### 6.3 Cambiar rango

1. Validación: permiso `rango`, jerarquía del cargo destino, no a sí mismo, no al fundador.
2. La carpeta del empleado se **mueve** al nuevo cargo (`<cargo nuevo>/<NOMBRE>/`); se eliminan
   las carpetas de los cargos anteriores.
3. Se regeneran global, cargo anterior, cargo nuevo y la ficha del empleado.

### 6.4 Modificar datos

1. Validación: permiso `modificar`, jerarquía, no a sí mismo.
2. Campos modificables: `nombres`, `apellidos`, `telefono`, `correo`, `direccion`, `redes`,
   `supervisor`, `fechaIngreso`. **El rango no** (se cambia con «Cambiar rango»).
3. Si cambian nombres/apellidos, las carpetas del empleado se **renombran**.

---

## 7. Logs de sesión

Cada acción (exitosa o denegada) se escribe en `test/website/debug/local-logs/staffcon-<fecha>.log`
con formato:

```
[YYYY-MM-DD HH:MM:SS] <sesión> actor=<ID> accion=<add|remove|rank|modify> <detalle>
```

La sesión se genera al entrar (`staffcon-<fecha>-<uuid>`) y permite reconstruir quién hizo qué
en cada uso de la consola.

---

## 8. Seguridad

1. **Repo público**: `archives/staff/` contiene datos personales del equipo. Solo se commitea lo
   que Ciszuko autorice; los datos completos de contacto viven en local (el vault y esta carpeta
   están gitignored; se añaden con `git add -f` cuando se decide publicar la plantilla).
2. **Password**: global (misma que la dev console, del vault `DEVCON_PASSWORD`), nunca en código
   ni en logs.
3. **Permisos por cargo** validados en el motor (no confiar en la TUI).
4. **Sin secretos**: nunca incluir tokens/keys en `staff.json` ni en los docs.
5. **IDs permanentes**: un ID de baja nunca se reutiliza (trazabilidad).

---

## 9. Flujo de trabajo diario

1. Ciszuko o un supervisor ejecuta `.\test\website\debug\staffcon.ps1`.
2. Password + identidad (su ID).
3. «Añadir empleado» con los datos del nuevo miembro → se crea carpeta y docs automáticamente.
4. Para actualizar datos → «Modificar datos». Para cambiar de equipo → «Cambiar rango».
5. Si alguien deja la organización → «Quitar empleado» con motivo.
6. Los docs de `archives/staff/` quedan siempre regenerados; el organigrama visual se coloca en
   `archives/staff/content/images/`.

---

## 10. Referencias

- `EMPLOYEES_SYSTEM.md` — modelo organizacional (cargos, escala, permisos, horarios, ciclo de vida).
- `ORGANIZATIONAL_SCALABILITY_PLAN.md` — escalabilidad de la organización.
- `BUSINESS_SYSTEM.md` — marco de negocio.
- `TOOLS_SYSTEM.md` — herramientas del ecosistema.
- `LOCAL_TESTING_PROTOCOLS.md` y `DEV_CONSOLE_SYSTEM.md` — consolas TUI del ecosistema.
- `SECURITY_PROTOCOLS.md` — reglas de seguridad obligatorias.

---

_Última revisión: 25 ago 2026._ Relacionado: `EMPLOYEES_SYSTEM.md`, `ORGANIZATIONAL_SCALABILITY_PLAN.md`, `BUSINESS_SYSTEM.md`.