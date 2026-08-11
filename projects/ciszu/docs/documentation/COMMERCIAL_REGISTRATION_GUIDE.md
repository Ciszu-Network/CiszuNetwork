# Guía: Registro Mercantil (SAREN) — Constituir la Empresa

**Fecha: 10 ago 2026**. Cómo convertir "Ciszu Network" de un proyecto personal a una
**persona jurídica** inscrita en el Registro Mercantil venezolano. Todo el trámite es
presencial-online vía **SAREN** y se paga por **Planilla Única Bancaria (efectivo/Bs.) —
sin tarjeta de crédito**.

> ⚠️ Guía informativa. Requisitos, montos y plazos varían según el Registro Mercantil de cada
> jurisdicción. El acta constitutiva DEBE ser validada por un abogado antes de presentarla.

## 1. Elegir la figura jurídica

| Figura | Socios | Responsabilidad | Para qué |
| --- | --- | --- | --- |
| **E.I.R.L.** (Empresa Individual de Responsabilidad Limitada) | 1 (un solo dueño) | Limitada al aporte | **Recomendada**: empezar solo, proteger el patrimonio personal |
| **S.R.L.** (Sociedad de Responsabilidad Limitada) | 2+ | Limitada a las cuotas | Negocios cerrados/familiares; participación por cuotas |
| **C.A./S.A.** (Compañía Anónima) | 2+ accionistas iniciales | Limitada a las acciones | Estructura pensada para inversión y capital accionario |

> Nota: la S.A./C.A. puede quedar después con 1 accionista, pero se constituye con mínimo 2.

## 2. Documentos que se generan

1. **Acta Constitucional** (con los estatutos dentro): nombre, domicilio, objeto social,
   capital, socios con su aporte y % de participación, administradores, comisario,
   asambleas, duración. → Plantilla en `plantillas/acta-constitutiva-srl.md` (borrador que
   el abogado valida y completa).
2. **Identificación de los socios** (cédula).
3. **Definición del objeto social** (actividad principal: desarrollo de software, plataformas
   digitales, juegos, bot de Discord, servicios de marketing digital, etc.).
4. **Monto del capital inicial** (en Bs. al tipo de cambio BCV). ⚠️ Algunos Registros
   Mercantiles piden referencia ~**USD 10.000** — varía por jurisdicción y objeto; validarlo
   antes con el RM o el abogado.

## 3. Paso a paso (SAREN en línea)

1. **Crear usuario** en `saren.gob.ve` (Sección "Trámites en Línea").
2. **Reservar el nombre** ("CISZU NETWORK, S.R.L.") — el sistema verifica que no existan
   duplicados. → Plantilla en `plantillas/reserva-nombre-saren.md`.
3. **Redactar el Acta Constitucional con el abogado** (el sistema pedirá los datos del
   abogado que valida el documento).
4. **Cargar los documentos digitales** exigidos por la plataforma (acta, cédulas).
5. **Ingresar datos de la persona jurídica y de los socios** (cédula, % de participación).
6. **Generar la Planilla Única Bancaria** y **pagar los aranceles** en el banco
   (según capital social — pago en efectivo/Bs., sin tarjeta).
7. **Asistir al otorgamiento** en la fecha indicada: firma presencial con **verificación
   biométrica** (Providencia 525).
8. **Publicar el Acta** en diario de circulación nacional o periódico mercantil de la
   jurisdicción.

## 4. Después del registro

| Trámite | Dónde | Notas |
| --- | --- | --- |
| **RIF jurídico** (J-...) | `declaraciones.seniat.gob.ve` | Vigencia **1 año**; actualizar domicilio/actividad |
| **Sellado de libros legales** | Registro Mercantil | Diario (art. 32 Ccom), Inventarios (art. 32 Ccom), Accionistas (art. 260 Ccom), Actas de Asamblea (art. 260 Ccom) |
| **Facturación digital** | SENIAT | Providencias **102 y 121** (desde mar 2025): sistema homologado obligatorio para venta en línea |
| **Licencia de Actividades Económicas + RUPDAE** | Alcaldía del municipio | Según actividad; bomberos/sanitarios si aplica |
| **IVSS / INCES / BANAVIH / INPSASEL** | Ministerios de trabajo | **Solo cuando haya empleados** (+ inamovilidad, Decreto 5.070) |
| **Cuenta bancaria corporativa** | Banco | Requiere acta + RIF jurídico |

## 5. Costes orientativos (todo sin tarjeta)

| Concepto | Coste aprox. |
| --- | --- |
| Aranceles del Registro Mercantil/SAREN | Según capital social (Bs. al BCV) — referencia: capital ~USD 10.000 |
| Honorarios del abogado (redacción/validación del acta) | Variable, pagable en efectivo (usar las plantillas del repo reduce el trabajo) |
| Publicación del Acta en diario | Tarifa del periódico (Bs./USD efectivo) |
| Sellado de libros | Arancel del RM |
| Balance de apertura (contador) | Variable — el contador es recomendable, no obligatorio para constituir |

**Tiempo total típico: 2–6 semanas** (depende del RM, carga administrativa y fechas de
otorgamiento).

## 6. Errores comunes a evitar

- No reservar el nombre antes de redactar el acta.
- Capital social desproporcionado al objeto (pedir orientación al RM).
- Olvidar la publicación del acta en diario.
- Dejar vencer el RIF jurídico (1 año).
- Operar sin facturación digital homologada (Providencias 102/121).
- Mezclar patrimonio personal con el de la empresa (para eso existe la E.I.R.L./S.R.L.).
