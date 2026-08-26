# CUSTOMERS_SYSTEM — Sistema de Gestión de Clientes (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-25
Identificador: CUSTOMERS_SYSTEM_V1.0.0_2026_08_25_ciszunetwork

> **Definición**: sistema que gestiona la **documentación y organización real de los clientes**
> (customers) de Ciszu Network: estructura de carpetas en `archives/customers/`, fuente de
> verdad en `customers.json`, generación automática de los 6 formatos (md/txt/csv/xlsx/docx/pdf)
> global y por cliente, y la consola **CUSTOMERSCON** (TUI) para añadir, quitar o modificar
> clientes con log de sesión. Es la versión simplificada de `STAFF_SYSTEM`: **sin cargos ni
> prioridad**. Tarea `TODO.md`.

---

## 1. Visión general

Ciszu Network trabaja para clientes reales (tareas universitarias, arreglos de consolas,
diseños, proyectos). Cada cliente tiene un **ID de empresa** (`CL-XXX`), un **asunto** (el
trabajo o encargo) y su propia carpeta documentada en 6 formatos. La consola CUSTOMERSCON
permite llevar el registro sin editar archivos a mano.

Antecedente: **hubo un sistema de customers anterior** que se eliminó y su contenido se perdió.
Este sistema lo reconstruye de forma ordenada y automática. Los primeros clientes registrados:

| ID | Cliente | Asunto |
|---|---|---|
| CL-001 | Maria Felix | Tarea universitaria |
| CL-002 | Nelger Lugo | Arreglo de una 3DS |

| Componente | Rol | Ubicación |
|---|---|---|
| `archives/customers/` | Estructura de documentación de clientes | `archives/customers/` |
| `customers.json` | **Fuente de verdad** de clientes | `archives/customers/data/customers.json` |
| `scripts/customersgen.js` | Generador de los formatos | `scripts/customersgen.js` |
| `scripts/customerscon.js` | Motor de la CUSTOMERSCON (operaciones + logs) | `scripts/customerscon.js` |
| `tools/consoles/customerscon.ps1` | TUI de la Customers Console | `tools/consoles/customerscon.ps1` |
| Log de sesión | Registro de cada acción | `tools/consoles/local-logs/customerscon-<fecha>.log` |

---

## 2. Estructura de `archives/customers/`

A diferencia de staff, **no hay cargos ni niveles**: global → cliente.

```
archives/customers/
├── data/
│   └── customers.json                 # FUENTE DE VERDAD (la edita la CUSTOMERSCON)
├── docs/                              # GLOBAL
│   └── CUSTOMERS_GLOBAL.{md,txt,csv,xlsx,docx,pdf}
├── content/{images,videos,profile}    # contenido global (organigrama de clientes, logos)
├── MARIA_FELIX/                       # CLIENTE (carpeta por nombre)
│   ├── docs/
│   │   └── CUSTOMER_MARIA_FELIX.{md,txt,csv,xlsx,docx,pdf}
│   ├── content/{images,videos,profile}
│   └── asunto/                        # carpeta adicional: archivos del trabajo/encargo
└── NELGER_LUGO/
    ├── docs/
    │   └── CUSTOMER_NELGER_LUGO.{md,txt,csv,xlsx,docx,pdf}
    ├── content/{images,videos,profile}
    └── asunto/
```

- **Nivel global** (`docs/`): lista TODOS los clientes (activos e historial de bajas) con su
  asunto. El `content/images` global sirve para logos/diseños de la empresa.
- **Nivel cliente** (`<CLIENTE>/docs/`): ficha del cliente (datos personales, asunto, contacto,
  redes).
- **Carpeta adicional `asunto/`**: archivos del trabajo o encargo (entregables, documentos,
  referencias). Cada cliente la tiene.

### 2.1 Carpetas `content/`

| Carpeta | Contenido |
|---|---|
| `images/` | Imágenes del cliente o del nivel global |
| `videos/` | Videos del cliente o del nivel global |
| `profile/` | Perfiles visuales: avatares, portadas, fotos |

---

## 3. Los formatos por nivel

Cada carpeta `docs/` contiene 6 archivos con la misma base de nombre:

| Formato | Contenido |
|---|---|
| `.md` | Fuente legible (markdown) con cabecera Versión/Actualización/Identificador |
| `.txt` | Versión texto plano (derivada del md) |
| `.csv` | Datos estructurados (global: 1 fila por cliente; cliente: 1 fila única) |
| `.xlsx` | **Versión Excel estilizada** (colores de marca, bordes, celdas, autofiltro) |
| `.docx` | Documento Word (pandoc) |
| `.pdf` | Documento PDF (reportlab vía `scripts/staffpdf.py`) |

Todos se regeneran desde `customers.json` con `scripts/customersgen.js` (reutiliza los helpers
de `staffgen.js`). No se editan a mano: se usa la CUSTOMERSCON.

---

## 4. Fuente de verdad: `customers.json`

```jsonc
{
  "schemaVersion": "1.0.0",
  "actualizacion": "2026-08-25",
  "org": { "nombre", "fundador", "pais", "sede", "correo", "idioma", "prefijoId": "CL" },
  "customers": [
    {
      "id": "CL-001",                  // nunca se reutiliza
      "nombres": "Maria",
      "apellidos": "Felix",
      "asunto": "Tarea universitaria", // el trabajo/encargo
      "telefono": "",
      "correo": "",
      "direccion": "",
      "redes": [],
      "fecha": null,
      "estado": "activo",              // activo | inactivo
      "registroBaja": null             // { eliminadoPor, fecha, motivo, datosPrevio }
    }
  ]
}
```

Reglas:
1. **ID autoincremental** `CL-002`, `CL-003`... El motor asigna el siguiente libre. Un ID de
   baja **nunca se reutiliza**.
2. `asunto` describe el trabajo/encargo del cliente.
3. Una **baja** conserva el registro (y los datos completos en el `.txt` de su carpeta).

---

## 5. CUSTOMERSCON — la consola

### 5.1 Arquitectura

```
customerscon.ps1 (TUI)  ──>  scripts/customerscon.js (motor)  ──>  customers.json
        │                      │   (valida y muta)
        │                      └──> scripts/customersgen.js (regenera docs de los clientes tocados)
        └──> local-logs/customerscon-<fecha>.log   (todo queda registrado)
```

- **TUI**: `tools/consoles/customerscon.ps1` — estética devcon/staffcon (paleta neon, menús
  con flechas).
- **Motor**: `scripts/customerscon.js` — subcomandos `list|summary|add|remove|modify`.
- **Generador**: `scripts/customersgen.js` — regenera solo los clientes afectados (rápido).

### 5.2 Ingreso

1. **Password global** (la misma que devcon/staffcon, leída del vault
   `services/supabase/.env` → `DEVCON_PASSWORD`; nunca hardcodeada ni mostrada).
2. **Identidad**: menú para indicar quién eres por ID de empresa (CZ-XXX). El operador queda
   registrado en el log (actor) con cada acción.
3. **Acceso por rango**: la CUSTOMERSCON se abre solo para empleados de nivel ≤ 7 (definido en
   `staff.json` → `org.accesos.customerscon`). Los cargos de mayor número (Moderadores, Beta
   Testers) no pueden operarla. Cualquier operación con la password queda trazada por el actor.

### 5.3 Menú principal

| Opción | Qué hace |
|---|---|
| **Resumen / supervisar** | Clientes actuales (activos + bajas), asunto y ubicación exacta |
| **Añadir cliente** | Nombres, apellidos, asunto, teléfono, correo, dirección, fecha. ID auto `CL-XXX` |
| **Quitar cliente** | Baja: ID conservado, docs convertidas a registro de baja |
| **Modificar / editar** | Cualquier campo del cliente |
| **Herramientas adicionales** | Abrir carpetas, logs, regenerar docs, ver JSON |
| **Manual / Información** | Ayuda y créditos |
| **Salir** | Cierra la consola (los cambios ya están guardados) |

---

## 6. Operaciones y efecto en los archivos

### 6.1 Añadir cliente

1. Se validan nombres y apellidos (obligatorios).
2. Se asigna el siguiente ID (`CL-XXX`) y se crea el registro en `customers.json`.
3. El generador crea `archives/customers/<NOMBRE>/` con su `docs/` (6 formatos), su `content/`
   y su carpeta `asunto/`, y actualiza los docs **globales**.
4. Queda registrado en el log.

### 6.2 Quitar cliente (baja)

1. `estado` → `inactivo` y se guarda `registroBaja` (quién, fecha, motivo, snapshot completo).
2. La **carpeta del cliente persiste** (el ID nunca se reutiliza) pero su `docs/` se re-edita:
   - `md`, `csv`, `docx`, `pdf` → **registro de baja mínimo** (ID, nombre, asunto, fecha, motivo).
   - `txt` → conserva el **historial completo** del cliente por seguridad.
3. Los docs **globales** dejan de listarlo como activo; pasa al historial de bajas.

### 6.3 Modificar / editar

Campos modificables: `nombres`, `apellidos`, `asunto`, `telefono`, `correo`, `direccion`,
`redes`, `fecha`. Si cambian nombres/apellidos, la carpeta del cliente se **renombra**.

---

## 7. Logs de sesión

Cada acción se escribe en `tools/consoles/local-logs/customerscon-<fecha>.log`:

```
[YYYY-MM-DD HH:MM:SS] <sesión> actor=<usuario> accion=<add|remove|modify> <detalle>
```

La sesión se genera al entrar (`customerscon-<fecha>-<uuid>`).

---

## 8. Seguridad

1. **Repo público**: `archives/customers/` contiene datos de clientes; se commitea solo lo que
   Ciszuko autorice (la carpeta está gitignored; se añade con `git add -f`).
2. **Password**: global (misma que devcon/staffcon, del vault `DEVCON_PASSWORD`), nunca en
   código ni en logs.
3. **IDs permanentes**: un ID de cliente de baja nunca se reutiliza.
4. **Sin secretos**: nunca incluir tokens/keys en `customers.json` ni en los docs.

---

## 9. Flujo de trabajo diario

1. Llega un cliente (por correo, redes o referencia).
2. `customerscon` → «Añadir cliente» con nombres, apellidos y **asunto** → se crea carpeta y docs.
3. Durante el trabajo se guardan los archivos en `archives/customers/<CLIENTE>/asunto/`.
4. Si cambian datos → «Modificar / editar». Si el cliente deja de ser activo → «Quitar cliente».
5. El resumen global queda siempre regenerado.

---

## 10. Referencias

- `STAFF_SYSTEM.md` — el sistema equivalente para empleados (más completo, con cargos y permisos).
- `EMPLOYEES_SYSTEM.md` — modelo organizacional de empleados.
- `BUSINESS_SYSTEM.md` — marco de negocio.
- `TOOLS_SYSTEM.md` — herramientas del ecosistema.
- `DEV_CONSOLE_SYSTEM.md` — consolas TUI del ecosistema.
- `SECURITY_PROTOCOLS.md` — reglas de seguridad.

---

_Última revisión: 25 ago 2026._ Relacionado: `STAFF_SYSTEM.md`, `BUSINESS_SYSTEM.md`, `EMPLOYEES_SYSTEM.md`.