# EMPLOYEES_SYSTEM — Modelo Organizacional de Empleados (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-25
Identificador: EMPLOYEES_SYSTEM_V1.0.0_2026_08_25_ciszunetwork

> **Definición**: modelo organizacional de Ciszu Network: catálogo de **20 cargos** (significado,
> trabajos, horarios), la **escala de rangos por escalabilidad** (niveles 0-9), la **matriz de
> permisos** por cargo y el **ciclo de vida** de un empleado (ingreso → actividad → baja con ID
> conservado). Es el *qué* y el *por qué*; el mecanismo (carpetas, formatos, consola) vive en
> `STAFF_SYSTEM.md`. Tarea `TODO.md`.

---

## 1. Visión general

Ciszu Network empieza con un único miembro: **Francisco García (Ciszuko Antony), CEO y fundador**.
El modelo define cómo crecer de forma ordenada: cada persona ocupa **uno o más cargos**, tiene un
**ID de empresa** (CZ-XXX) y queda reflejada en la documentación (`archives/staff/`) que la
STAFFCON mantiene. La **escala de rangos** permite ascender, descender o reubicar a cualquier
miembro con una regla clara de autoridad.

Principios:
1. **Un solo dueño**: Ciszuko Antony es el CEO y único creador legítimo del proyecto.
2. **Rango por nivel**: la autoridad se ordena por número de nivel (0 = mayor autoridad).
3. **Acceso mínimo**: cada cargo solo puede gestionar lo que su nivel y sus permisos permiten.
4. **Trazabilidad**: todo empleado tiene un ID permanente; las bajas se conservan.

---

## 2. Identidad y ID de empresa

Cada empleado tiene un **ID único** con prefijo `CZ-` y número correlativo:

| ID | Empleado | Cargo principal | Estado |
|---|---|---|---|
| CZ-001 | Francisco García | CEO | activo |

Reglas del ID:
- Se asigna automáticamente el siguiente libre (`CZ-002`, `CZ-003`...).
- **Nunca se reutiliza**: un ID dado de baja queda reservado permanentemente.
- El ID es la **clave de identidad** de la STAFFCON (menú «¿quién eres?»).

---

## 3. Catálogo de cargos (20)

La organización se divide en **20 cargos**. La tabla resume nivel, denominación y horario; las
secciones siguientes detallan significado y trabajos.

| Nivel | Cargo (carpeta) | Denominación | Horario |
|---|---|---|---|
| 0 | `CEO` | Director Ejecutivo | Lun-Dom, flexible, disponibilidad total |
| 1 | `CTO` | Director de Tecnología | Lun-Vie 9:00-17:00 |
| 1 | `CCO` | Director Creativo | Lun-Vie 9:00-17:00 |
| 1 | `COO` | Director de Operaciones | Lun-Vie 9:00-17:00 |
| 1 | `CMO` | Director de Marketing | Lun-Vie 9:00-17:00 |
| 1 | `CFO` | Director Financiero | Lun-Vie 9:00-17:00 |
| 2 | `Gerentes` | Gerencia | Lun-Vie 9:00-17:00 (turnos por equipo) |
| 3 | `Supervisores` | Supervisión | Lun-Vie 9:00-17:00 (turnos por equipo) |
| 4 | `Administradores` | Administración | Lun-Vie 9:00-16:00 |
| 4 | `RecursosHumanos` | Recursos Humanos | Lun-Vie 9:00-16:00 |
| 5 | `Ciberseguridad` | Ciberseguridad | Lun-Dom, guardias 24/7 |
| 5 | `DevOps` | DevOps e Infraestructura | Lun-Vie 9:00-18:00 |
| 6 | `Desarrolladores` | Desarrollo | Lun-Vie 9:00-18:00 (remoto flexible) |
| 6 | `UIUX` | Diseño UI/UX | Lun-Vie 9:00-18:00 (remoto flexible) |
| 6 | `Disenadores` | Diseño Gráfico | Lun-Vie 9:00-18:00 (remoto flexible) |
| 6 | `QA` | Control de Calidad | Lun-Vie 9:00-18:00 |
| 7 | `CommunityManagers` | Community Management | Turnos rotativos |
| 7 | `SoporteTecnico` | Soporte Técnico | Turnos rotativos |
| 8 | `Moderadores` | Moderación | Turnos rotativos, cobertura amplia |
| 9 | `Betatesters` | Beta Tester | Por campaña, sin horario fijo |

---

## 4. Escala de rangos por escalabilidad

La escala va de **nivel 0** (máxima autoridad) a **nivel 9** (base). **Ascender** = bajar de
número; **descender** = subir de número.

```
NIVEL 0   CEO
NIVEL 1   CTO · CCO · COO · CMO · CFO
NIVEL 2   Gerentes
NIVEL 3   Supervisores
NIVEL 4   Administradores · Recursos Humanos
NIVEL 5   Ciberseguridad · DevOps
NIVEL 6   Desarrolladores · UIUX · Disenadores · QA
NIVEL 7   Community Managers · Soporte Técnico
NIVEL 8   Moderadores
NIVEL 9   Betatesters
```

### 4.1 Regla de autoridad

Un cargo de **nivel N** solo puede gestionar (añadir, quitar, cambiar rango, modificar) cargos de
**nivel mayor que N**. En la práctica:

- **CEO (0)** gestiona a todos.
- **Gerentes (2)** gestionan niveles 3 a 9.
- **Supervisores (3)** gestionan niveles 4 a 9.
- **Administradores / RRHH (4)** solo modifican datos de niveles 5 a 9.
- Los cargos base (5-9) no gestionan a nadie.

### 4.2 Promoción y descenso

- **Ascenso**: a un nivel menor (más autoridad). Solo quien tiene permiso `rango` y nivel menor
  que el destino puede hacerlo (p. ej. un Supervisor asciende a otro Supervisor no puede; el CEO o
  un Gerente sí).
- **Descenso**: a un nivel mayor (menos autoridad). Misma regla de jerarquía.
- **Reubicación directa**: colocar el cargo que se desee, siempre dentro de la jerarquía del actor.
- En la STAFFCON esto es «Cambiar rango»: mueve la carpeta del empleado y regenera la doc.

---

## 5. Significado y trabajos por cargo

### 5.1 Dirección (niveles 0-1)

- **CEO — Director Ejecutivo**: máxima autoridad; visión, estrategia global, decisiones finales,
  representación de la marca, aprobación de rangos y altas/bajas. Horario flexible total.
- **CTO — Director de Tecnología**: arquitectura del monorepo, seguridad del código, calidad de
  despliegues; supervisa desarrollo, DevOps y ciberseguridad.
- **CCO — Director Creativo**: identidad visual de la marca (neon cyan/rosa, Geomanist),
  supervisa diseño, UI/UX y contenido multimedia.
- **COO — Director de Operaciones**: operación diaria, flujos de trabajo, calendario y
  coordinación entre equipos; supervisa gerencia, supervisión y soporte.
- **CMO — Director de Marketing**: campañas, SEO, analítica, redes y crecimiento; supervisa
  community management y ventas.
- **CFO — Director Financiero**: presupuesto, pagos, facturación y cumplimiento fiscal.

### 5.2 Gestión (niveles 2-4)

- **Gerentes**: lideran un área o proyecto; crean empleados, gestionan su equipo, cambian rangos
  y registran bajas de su área.
- **Supervisores**: supervisan el trabajo diario de un equipo; crean empleados y gestionan datos
  de rangos inferiores.
- **Administradores**: operación administrativa del día a día; corrigen datos de rangos inferiores.
- **Recursos Humanos**: documentación del personal, horarios y bienestar; corrige datos de rangos
  inferiores.

### 5.3 Técnica (niveles 5-6)

- **Ciberseguridad**: auditorías, RLS, SAST/DAST, gestión de secretos, respuesta a incidentes.
- **DevOps**: CI/CD, despliegues desde `main`, contenedores, VPS, monitorización.
- **Desarrolladores**: implementación en las 4 webs, el bot de Discord y los paquetes compartidos.
- **UI/UX**: interfaces y experiencia de usuario, consistencia visual, prototipado.
- **Diseñadores**: logos, banners, assets del CDN, edición multimedia.
- **QA**: testing E2E (Playwright), unit tests, revisión de builds, reporte de errores.

### 5.4 Comunidad (niveles 7-9)

- **Community Managers**: redes sociales y comunidad; publicaciones, interacción, feedback.
- **Soporte Técnico**: dudas, reportes e incidencias de usuarios de webs y bot.
- **Moderadores**: orden en canales, chats y reseñas; aplicación de reglas.
- **Beta Testers**: prueban funcionalidades en beta y reportan errores/mejoras.

---

## 6. Horarios

| Tipo de horario | Cargos | Notas |
|---|---|---|
| **Flexible total** | CEO | Disponibilidad según demanda, Lun-Dom |
| **Oficina** (Lun-Vie 9:00-17:00) | C-level, Gerentes, Supervisores | Turnos según equipo |
| **Reducido** (Lun-Vie 9:00-16:00) | Administradores, RRHH | Tareas administrativas |
| **Técnico flexible** (Lun-Vie 9:00-18:00) | DevOps, Dev, UI/UX, Diseño, QA | Remoto con reunión diaria |
| **Guardias 24/7** | Ciberseguridad | Rotativo según plan de seguridad |
| **Turnos rotativos** | Community, Soporte, Moderación | Cobertura mañana-tarde-noche |
| **Por campaña** | Beta Testers | Sin horario fijo, ligado a QA |

Los horarios son de referencia y los ajusta la dirección; la STAFFCON los documenta por cargo
(`archives/staff/<cargo>/docs/`).

---

## 7. Matriz de permisos

| Cargo (nivel) | Añadir | Quitar | Cambiar rango | Modificar |
|---|---|---|---|---|
| CEO (0) | ✅ | ✅ | ✅ | ✅ |
| CTO/CCO/COO/CMO/CFO (1) | ✅ | — | — | ✅ |
| Gerentes (2) | ✅ | ✅ | ✅ | ✅ |
| Supervisores (3) | ✅ | ✅ | ✅ | ✅ |
| Administradores (4) | — | — | — | ✅ |
| Recursos Humanos (4) | — | — | — | ✅ |
| Resto (5-9) | — | — | — | — |

+ **Jerarquía**: nivel N gestiona solo niveles > N. + **Nadie se gestiona a sí mismo**. +
**Fundador inmutable** (no se quita ni se cambia de rango). + **Modificar nunca toca el rango**.

### 7.1 Acceso a consolas por nivel

Cada consola del ecosistema exige un **nivel máximo** de acceso (definido en `staff.json` →
`org.accesos`). Un empleado cuyo `nivel` supere el máximo no puede abrir la consola:

| Consola | Nivel máximo | Quién puede entrar |
|---|---|---|
| `staffcon` | 9 | Cualquier empleado activo (las operaciones se restringen por la matriz de permisos) |
| `devcon` | 6 | Dirección, gerencia, supervisión, administración, RRHH, ciberseguridad, DevOps y técnicos (hasta QA) |
| `customerscon` | 7 | Los anteriores + Community Managers y Soporte Técnico (quienes atienden clientes) |

Al entrar, la consola pide la **identidad** (ID de empresa); el log de sesión registra siempre
quién operó (`actor`).

---

## 8. Ciclo de vida del empleado

```
INGRESO ──▶ ACTIVO ──▶ BAJA (registro conservado, ID permanente)
             │
             ├─ Cambio de rango (carpeta movida, docs regeneradas)
             └─ Modificación de datos (cualquier campo excepto el rango)
```

### 8.1 Ingreso

Quién puede: CEO, Supervisor, Gerente (y C-level con permiso de añadir). Datos mínimos:
nombres, apellidos, cargo; opcional teléfono, correo, dirección. El ID se asigna automáticamente
y el `supervisor` queda registrado (quién lo añadió). Se crea su carpeta y sus 5 formatos.

### 8.2 Baja

Quién puede: quien tenga permiso `quitar` y jerarquía sobre el cargo. La baja:
1. Conserva el **ID** (nunca se reutiliza) y la **carpeta** con su registro.
2. Convierte los docs en **registro de baja** mínimo (el `.txt` guarda el historial completo).
3. Retira al empleado de los docs **global** y del **cargo** (pasa al historial de bajas).

### 8.3 Convenciones de carpetas

- Carpeta de empleado = `NOMBRE APELLIDO` en mayúsculas, espacios → `_` (p. ej.
  `FRANCISCO_GARCIA`).
- Ficheros de docs = `EMPLEADO_<NOMBRE>_<CARGO>.{md,txt,csv,docx,pdf}`.
- Baja = mismo nombre de fichero, contenido de registro de baja.

---

## 9. Buenas prácticas

1. **No editar `archives/staff/` a mano**: usar la STAFFCON (todo se regenera).
2. **Datos reales**: los campos de contacto deben mantenerse al día; el correo oficial de la
   organización es `ciszunetwork@outlook.com`.
3. **Un cargo por carpeta**: una persona con varios cargos tiene su carpeta en cada uno (el
   fundador aparece en los 20 hasta que se delegue).
4. **Sin secretos**: `staff.json` y los docs nunca contienen tokens/keys.
5. **El organigrama visual** (global) vive en `archives/staff/content/images/`.
6. **Documentación estable**: los docs de `projects/ciszu/docs/documentation/` son estándares y
   cambian poco; los de `archives/staff/` cambian con cada alta/baja/modificación.

---

## 10. Referencias

- `STAFF_SYSTEM.md` — mecanismo: carpetas, 5 formatos, STAFFCON, permisos, logs.
- `ORGANIZATIONAL_SCALABILITY_PLAN.md` — estrategia de escalabilidad y acceso mínimo.
- `BUSINESS_SYSTEM.md` — marco de negocio y estructura organizativa.
- `COMPANY_REGISTRATION_PLAN.md` / `RIF_PERSON_PLAN.md` / `TAX_PLAN.md` — registro legal y fiscal.
- `SECURITY_PROTOCOLS.md` — reglas de seguridad.

---

_Última revisión: 25 ago 2026._ Relacionado: `STAFF_SYSTEM.md`, `ORGANIZATIONAL_SCALABILITY_PLAN.md`, `BUSINESS_SYSTEM.md`.