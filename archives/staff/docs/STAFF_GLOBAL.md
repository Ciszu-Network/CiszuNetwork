# CISZU NETWORK - REGISTRO GLOBAL DE EMPLEADOS

Version: 1.0.0
Actualizacion: 2026-08-29
Identificador: STAFF_GLOBAL_V1_0_0_2026_08_29_ciszunetwork

> **Definicion**: plantilla global que resume a todos los empleados de Ciszu Network,
> sus cargos, la jerarquia de rangos y el historial de bajas. Fuente de verdad:
> `archives/staff/data/staff.json`.

---

## 1. Organizacion

- **Nombre**: Ciszu Network
- **Fundador**: Francisco Garcia (Ciszuko Antony)
- **Sede**: Caracas, Venezuela
- **Pais**: Venezuela
- **Correo de contacto**: ciszunetwork@outlook.com
- **Descripcion**: Ecosistema digital y masivo de Ciszuko Antony: 4 webs Next.js, bot de Discord, juego de musica y paquetes compartidos.

## 2. Roles y jerarquia (20)

Escala de rangos por **nivel** (0 = mayor autoridad, 9 = base). Se asciende bajando
el numero de nivel; un cargo de nivel N solo puede gestionar cargos de nivel mayor que N.

| 0 | CEO (Director Ejecutivo) | 1 |
| 1 | CTO (Director de Tecnologia) | 1 |
| 1 | CCO (Director Creativo) | 1 |
| 1 | COO (Director de Operaciones) | 1 |
| 1 | CMO (Director de Marketing) | 1 |
| 1 | CFO (Director Financiero) | 1 |
| 2 | Gerentes (Gerencia) | 1 |
| 3 | Supervisores (Supervision) | 1 |
| 4 | Administradores (Administracion) | 1 |
| 4 | RecursosHumanos (Recursos Humanos) | 1 |
| 5 | Ciberseguridad (Ciberseguridad) | 1 |
| 5 | DevOps (DevOps e Infraestructura) | 1 |
| 6 | Desarrolladores (Desarrollo) | 1 |
| 6 | UIUX (Diseno UI/UX) | 1 |
| 6 | Disenadores (Diseno Grafico) | 1 |
| 6 | QA (Control de Calidad) | 1 |
| 7 | CommunityManagers (Community Management) | 1 |
| 7 | SoporteTecnico (Soporte Tecnico) | 1 |
| 8 | Moderadores (Moderacion) | 1 |
| 9 | Betatesters (Beta Tester) | 2 |

## 3. Empleados activos (2)

| ID | Nombre | Cargo | Correo | Telefono | Supervisor | Ingreso |
|----|--------|-------|--------|----------|------------|---------|
| CZ-001 | FRANCISCO GARCIA | CEO | ciszunetwork@outlook.com | - | Fundador | Fundador (desde creacion) |
| CZ-002 | RAFAEL MENOLASCINA | Betatesters | rafameno@gmail.com | 04120702370 | CZ-001 | Fundador (desde creacion) |

## 4. Historial de bajas (0)

| ID | Nombre | Fecha de baja | Motivo | Eliminado por |
|----|--------|---------------|--------|---------------|
| - | (sin bajas registradas) | - | - | - |

## 5. Metadatos

- Estructura de carpetas: `archives/staff/docs/`, `archives/staff/<cargo>/`, `archives/staff/<cargo>/<EMPLEADO>/`.
- Cada nivel mantiene sus 5 formatos (`md`, `txt`, `csv`, `docx`, `pdf`) y carpetas `content/{images,videos,profile}`.
- El contenido global sirve para representar el **organigrama** visual de toda la empresa (`content/images`).
- Consola de gestion: **STAFFCON** (`test/website/debug/staffcon.ps1`).

---

_Ultima revision: 2026-08-29_
