# legal-ai — Estructura legal y contable de Ciszu Network

Generador de la estructura legal/contable/evidencial del proyecto en `archives/legal/`
(gitignored por privacidad: documentos personales NO suben a GitHub).

## Uso

```bash
python tools/legal-ai/generate-legal-structure.py          # año actual
python tools/legal-ai/generate-legal-structure.py --year 2027   # otro año
```

Requiere `openpyxl` (solo para el Excel): `pip install openpyxl`

## Qué crea

| Ruta | Contenido |
| --- | --- |
| `contabilidad/libro-ingresos.csv` | Registro de ingresos (base ISLR/IVA/IGTF; exportación de servicios = 0% IVA) |
| `contabilidad/libro-gastos.csv` | Registro de gastos con deducibilidad ISLR |
| `contabilidad/control-impuestos.csv` | Control mensual de impuestos y declaraciones |
| `contabilidad/vencimientos.csv` | Calendario de vencimientos (RIF, IVA, ISLR, SAPI...) |
| `contabilidad/contabilidad-ciszu-<AÑO>.xlsx` | Excel con fórmulas (Sumas automáticas; hojas Ingresos/Gastos/Impuestos/Vencimientos/Evidencia) |
| `evidencia-marca/registro-evidencia.csv` | Log de capturas de uso de la marca (evidencia para SAPI) |
| `documentos-oficiales/` | Carpeta para cédula, RIF, actas, certificados (ver su README) |
| `tramites/seguimiento-tramites.md` | Estado del plan de formalización por fases |

## Reglas de uso

- **Los CSV son la fuente editable** (UTF-8 BOM → Excel los abre bien). El XLSX es derivado:
  si se regenera, se recrea con filas de ejemplo — las filas reales van en los CSV.
- Los archivos con `[CORCHETES]` son ejemplos: reemplazar o borrar.
- Cada captura de evidencia: nombre `AAAAMMDD-plataforma-descripcion.png` + fila en
  `registro-evidencia.csv`.
- Documentos personales NUNCA se añaden a git (el `archives/` ya está en `.gitignore`).

## Documentación relacionada

- `projects/ciszu/docs/documentation/PLAN_REGISTRO_EMPRESA.md` — plan maestro por fases
- `projects/ciszu/docs/documentation/GUIA_*` — guías de trámites (RIF, SAPI, mercantil, fiscalidad, LLC)
- `projects/ciszu/docs/plantillas/` — acta constitutiva, FM-02, declaración jurada, reserva de nombre, checklist
