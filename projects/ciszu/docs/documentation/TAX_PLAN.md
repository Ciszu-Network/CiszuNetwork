# TAX_PLAN — Plan Fiscal Integral de Ciszu Network (Venezuela)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: TAX_PLAN_V2.0.0_2026_08_13_ciszunetwork

> **Alcance**: plan fiscal que cubre **todas las personas y entidades** del ecosistema Ciszu
> Network: la persona natural Ciszuko Antony (fase actual), la futura empresa (persona jurídica),
> la LLC internacional, y las obligaciones digitales asociadas (facturación, libros, retenciones).
> Sustituye a `FREELANCER_TAX_PLAN` (fusionado 13 ago 2026).

> ⚠️ Guía informativa. Escalas, exoneraciones y montos cambian: confirmar vigencia en
> `declaraciones.seniat.gob.ve` y con un contador. La Ley de Costos y Precios Justos y las
> Providencias del SENIAT son la fuente.

---

## 1. Escenarios fiscales del ecosistema

| Escenario | Sujeto | Régimen | Doc relacionado |
|---|---|---|---|
| **A. Persona natural** (HOY) | Ciszuko Antony (RIF personal) | ISLR + IVA + IGTF + facturación digital | §2–§6 de este doc |
| **B. Empresa nacional** (Futuro) | Persona jurídica (RIF J-) | ISLR empresas + IVA + retenciones + libros formales | `COMMERCIAL_REGISTRATION_PLAN.md` |
| **C. LLC internacional** (Futuro) | LLC en EEUU | Imposición EEUU + repatriación VE | `INTERNATIONAL_LLC_PLAN.md` |
| **D. Marca** | Activo intangible | Prueba de uso (SAPI), sin impuesto directo | `TRADEMARK_PLAN.md` |

**Consejo base**: comenzar YA con el RIF personal (gratis) — ver `RIF_PERSON_PLAN.md` — porque
todas las estructuras posteriores dependen de la identificación fiscal.

---

## 2. Impuestos que aplican (persona natural — escenario A)

| Impuesto | Base | Tasa | Cuándo |
| --- | --- | --- | --- |
| **ISLR** (Impuesto Sobre la Renta) | Enriquecimiento neto anual (ingresos − gastos deducibles) | Escala progresiva (tramo exento por debajo de cierto umbral en UT) | Declaración anual definitiva (1 ene–31 mar del año siguiente) |
| **IVA** (16%) | Ventas de bienes/servicios gravados | 16% | Declaración mensual; **exportación de servicios: 0%** si aplican las normas de exportación (servicios digitales a clientes del exterior suelen calificar) |
| **IGTF** (Impuesto a las Grandes Transacciones Financieras) | Pagos recibidos del extranjero vía transferencias | 3% | Al recibir pagos del exterior (según normativa vigente) |
| **Retenciones** | ISLR e IVA que retienen clientes jurídicos | Según tabla | Acreditar contra la declaración anual |

> ⚠️ Los **servicios digitales exportados** (clientes fuera de Venezuela) normalmente **no
> causan IVA** y pueden quedar **exentos de ISLR** por debajo del tramo exento — pero la
> obligación de **declarar** sigue existiendo. Un contador confirma la aplicación al caso.

### 2.1 ISLR en detalle (persona natural)

- **Sujeto pasivo**: toda persona natural con enriquecimiento neto anual > tramo exento.
- **Enriquecimiento neto**: ingresos brutos − costos y gastos deducibles (hosting, software,
  servicios, herramientas, honorarios).
- **Tramos en UT** (Unidad Tributaria): cambia cada año — consultar la escala vigente.
- **Exportaciones de servicios**: pueden estar exentas o no causar el impuesto; el requisito
  es demostrar la exportación (contrato + cobro desde el exterior).

### 2.2 IVA en detalle

- **Tasa general 16%** (reducida 8% para ciertos alimentos/bienes).
- **Exportación de servicios digitales → 0%** (no devengado), siempre que se cumplan las
  normas de la Ley de IVA y su Reglamento.
- **Sujeto pasivo formal** (obligado a declarar) vs **recolector**: depende del volumen de
  ventas gravadas — verificar umbrales vigentes en SENIAT.

### 2.3 IGTF

- Grava las operaciones financieras en divisas; al **recibir pagos del exterior** por
  transferencia se genera el impuesto (3% sobre el monto).
- Aplicación real para el caso: pagos vía Wise/Payoneer/PayPal a cuentas en el exterior o
  nacionales en divisas.
- Verificar la normativa vigente: la Providencia que regula el IGTF ha tenido ajustes.

---

## 3. Facturación digital (obligatoria desde marzo 2025)

- **Providencias 102 y 121** del SENIAT (derogaron la 0032/2014): la **facturación
  electrónica** es obligatoria para vender en línea y prestar servicios digitales.
- Opciones: **sistema homologado** por el SENIAT (con imprenta digital autorizada) o los
  mecanismos que habilite el SENIAT para facturar.
- La factura debe llevar: datos del emisor (RIF, razón social), del receptor, descripción,
  base, impuestos, monto total.
- Guardar **libro de compras y ventas mensual** (aunque sea una hoja de cálculo con los
  campos exigidos).

### 3.1 Facturación para persona jurídica (cuando exista empresa)

- **Facturas electrónicas** con RIF J- y razón social.
- Régimen de **retención de IVA e ISLR** a proveedores (retenedor jurídico).
- Libros de compras y ventas formales + libro de retenciones.
- Declaraciones **especiales** además de las mensuales/anuales estándar.

---

## 4. Libros y registros recomendados

| Registro | Para qué |
| --- | --- |
| Libro/hoja de Compras y Ventas mensual | Base de las declaraciones de IVA e ISLR |
| Registro de ingresos por proyecto (contratos, facturas, recibos) | Demostrar enriquecimiento y exportaciones de servicios |
| Comprobantes de gastos deducibles (hosting, software, servicios) | Reducir la base de ISLR |
| Evidencia de pagos recibidos del exterior (Wise/Payoneer/PayPal) | Calcular IGTF y acreditar exportación de servicios |
| Registro de uso de la marca (prueba de uso) | Soporte al registro SAPI (ver `TRADEMARK_PLAN.md`) |

## 5. Calendario mínimo

| Frecuencia | Obligación |
| --- | --- |
| Mensual | Declaración y pago de IVA (si aplica) + IGTF (si recibes del exterior) |
| Anual (ene–mar) | Declaración definitiva de ISLR del ejercicio anterior |
| Cada 3 años | Renovación del RIF de persona natural |
| Eventos | Actualización de datos (dirección, actividad) en el portal SENIAT |

## 6. Consecuencias de no cumplir

- Multas y sanciones del SENIAT por no inscribir/facturar/declarar.
- Imposibilidad de abrir cuentas bancarias formales o facturar a clientes jurídicos.
- Pérdida de evidencia de "uso de la marca" (relevante para el SAPI).
- Riesgo en contratos internacionales que exigen identificación fiscal válida.

## 7. Estrategia fiscal recomendada

1. Obtener el RIF YA (gratis) — ver `RIF_PERSON_PLAN.md`.
2. Llevar un registro sencillo (hoja de cálculo) de cada ingreso/gasto desde el primer día.
3. Facturar siempre digitalmente (Providencia 102/121), aunque el cliente no lo exija.
4. Al formalizar clientes recurrentes: consultar a un **contador** (honorarios en efectivo)
   para el cálculo exacto de ISLR/IVA/IGTF del caso.
5. Cuando exista empresa (Fase 2): el régimen pasa a persona jurídica (RIF J-..., vigencia
   1 año, declaraciones especiales) — ver `COMMERCIAL_REGISTRATION_PLAN.md`.
6. Si se crea la LLC estadounidense: evaluar impacto de repatriación y tratados — ver
   `INTERNATIONAL_LLC_PLAN.md`.

## 8. Preguntas frecuentes

**¿Debo cobrar IVA a clientes del exterior?** No, los servicios digitales exportados van al
0% de IVA, pero debe constar la exportación en los registros.

**¿Puedo declarar todo con una hoja de cálculo?** Sí, siempre que tenga los campos exigidos
(fecha, RIF, descripción, base, impuesto, total) y respalde las declaraciones.

**¿El IGTF aplica a PayPal/Wise?** Aplicaría según la forma en que se reciba el pago y la
normativa vigente; verificar el caso concreto (tarjeta prepagada vs cuenta bancaria en divisas).

**¿Cuándo necesito contador?** Cuando el volumen justifique el costo; al menos una vez al año
para la declaración de ISLR es recomendable.

## 9. Calendario fiscal anual

| Periodo | Obligación |
|---|---|
| Anual | Declaración ISLR (personas naturales) |
| Mensual (si aplica) | IVA / retenciones |
| Trimestral | IGTF (según actividad) |
| Cierre de ejercicio | Balances + recuento de ingresos |
| Verificación semestral | Revisar tarifas y normativa vigente |

## 10. Registros que conviene mantener

- Facturas emitidas y recibidas (timbradas si aplica) con número correlativo.
- Comprobantes de pagos recibidos (PayPal/Wise/Binance/NOWPayments → extractos).
- Justificante de retenciones sufridas.
- Registro de gastos deducibles (herramientas, hosting, equipos, dominio).
- Copia digital en `archives/backups/` cifrada según `VAULT_SYSTEM.md`.

## 11. Decisiones tomadas

- Primero **RIF persona natural** (más simple), luego valorar SAPI/LLC según crecimiento.
- Ingresos en divisas: llevar la contabilidad en USD con equivalencia a la fecha de factura.
- No facturar sin haber registrado el RIF (las facturas sin RIF no se aceptan).
- Actualizar este plan cada semestre o ante cambios normativos.

## 12. Checklist anual de cierre

- [ ] Conciliar ingresos (PayPal/Wise/crypto) vs facturación emitida.
- [ ] Declarar ISLR en el periodo correspondiente.
- [ ] Guardar copia de las declaraciones en `archives/backups/`.
- [ ] Revisar si el volumen justifica constituir una SAPI/LLC.
- [ ] Actualizar `PROJECT_HISTORY` y `PROJECT_STATE` con el cierre.

## 13. Unidad Tributaria y lecturas de escala

- La **UT (Unidad Tributaria)** es la medida para fijar montos en impuestos venezolanos
  (tramos de ISLR, multas, timbres). Su valor cambia por resolución anual del SENIAT;
  verificar el valor vigente antes de calcular.
- Las escalas de ISLR se expresan en tramos de UT; el impuesto se calcula por tramos
  (tarifa progresiva con porción exenta). El resultado se paga en Bs. al BCV según el
  tipo de cambio de la fecha de pago.

## 14. Doble tributación internacional

- Venezuela tiene **convenios para evitar la doble tributación** con pocos países
  (situación cambiante). Sin convenio, los ingresos de una LLC estadounidense pueden
  tributar en EEUU y luego en Venezuela al repatriarlos.
- Estrategias habituales: retener utilidades en la LLC, documentar el costo de operación
  local, y consultar con un contador con experiencia en repatriación antes de transferir.

## 15. Relación con otros planes

| Plan | Relación fiscal |
|---|---|
| `RIF_PERSON_PLAN.md` | Base de identificación fiscal (RIF V-) |
| `COMMERCIAL_REGISTRATION_PLAN.md` | Régimen de persona jurídica (RIF J-) |
| `INTERNATIONAL_LLC_PLAN.md` | Imposición EEUU + repatriación |
| `TRADEMARK_PLAN.md` | Marca como activo intangible |
| `PAYMENTS_SYSTEM.md` | Documentación de pagos recibidos |

_Última revisión: 13 ago 2026._ Relacionado: `RIF_PERSON_PLAN.md`, `COMMERCIAL_REGISTRATION_PLAN.md`,
`INTERNATIONAL_LLC_PLAN.md`, `TRADEMARK_PLAN.md`, `COMPANY_REGISTRATION_PLAN.md`.
