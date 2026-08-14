# COMMERCIAL_REGISTRATION_PLAN — Registro Mercantil (SAREN) — Constituir la Empresa

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: COMMERCIAL_REGISTRATION_PLAN_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: cómo convertir "Ciszu Network" de proyecto personal a **persona jurídica**
> inscrita en el Registro Mercantil venezolano (SAREN), con pago en efectivo/Bs. sin tarjeta.

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

## 7. Diferencias con otros planes de registro

| Plan | Objeto | Cobertura |
|---|---|---|
| `RIF_PERSON_PLAN` | Persona natural (inicio $0) | RIF persona física, SENIAT |
| `TRADEMARK_PLAN` | Marca (nombre/logo) | Clases 41/42, SAPI |
| `INTERNATIONAL_LLC_PLAN` | Empresa en el extranjero (18+) | LLC/LLP internacional |
| `COMPANY_REGISTRATION_PLAN` | Hoja de ruta global | Fases desde $0 hasta empresa |
| **Este (SAREN)** | **Persona jurídica en VE** | Registro Mercantil + RIF jurídico |

## 8. Términos del registro mercantil (glosario)

| Término | Definición |
|---|---|
| **Persona natural** | Individuo (RIF V-...) |
| **Persona jurídica** | Empresa (RIF J-...) |
| **Acta Constitucional** | Documento que crea la sociedad |
| **Estatutos** | Reglas internas de la sociedad |
| **Capital social** | Aporte de los socios |
| **Objeto social** | Actividad que realizará la empresa |
| **Comisario** | Supervisor de cuentas (opcional) |
| **Planilla Única Bancaria** | Pago oficial de aranceles |
| **SAREN** | Sistema de Registro Mercantil en línea |
| **RUPDAE** | Registro Único de actividades económicas (municipio) |

## 9. Checklist de constitución

- [ ] Elegir figura (E.I.R.L. recomendada para 1 socio).
- [ ] Reservar nombre en SAREN.
- [ ] Redactar acta con abogado (plantillas del repo).
- [ ] Cargar documentos digitales en SAREN.
- [ ] Pagar aranceles por Planilla Única Bancaria.
- [ ] Asistir al otorgamiento (firma biométrica).
- [ ] Publicar acta en diario de circulación.
- [ ] Obtener RIF jurídico (J-...) en SENIAT.
- [ ] Sellado de libros legales en el RM.
- [ ] Facturación digital homologada (Providencias 102/121).
- [ ] Cuenta bancaria corporativa.

## 10. Estatutos: cláusulas típicas de una S.R.L.

| Cláusula | Contenido típico |
|---|---|
| Identificación | Nombre, domicilio, duración |
| Objeto social | Actividades permitidas (redactado amplio pero concreto) |
| Capital social | Monto, cuotas, aportes (dinero, bienes o trabajo) |
| Administración | Órgano de administración y sus facultades |
| Asambleas | Convocatoria, quórum y mayorías |
| Utilidades y pérdidas | Distribución proporcional a las cuotas |
| Comisario | Supervisión contable (opcional en S.R.L.) |
| Disolución | Causales y procedimiento de liquidación |

## 11. Costes recurrentes de una persona jurídica venezolana

| Concepto | Frecuencia | Notas |
|---|---|---|
| RIF jurídico | Anual | Vigencia 1 año; renovación en SENIAT |
| Licencia de Actividades Económicas | Anual | Alcaldía; base según actividad |
| Facturación digital homologada | Permanente | Sistema autorizado por SENIAT (Providencias 102/121) |
| Contador | Mensual/anual | Declaraciones y cierre de ejercicio |
| Sellado de libros | Al cierre o por cambios | Arancel del RM |

## 12. Preguntas frecuentes

**¿Puedo ser E.I.R.L. y luego pasar a S.R.L.?** Sí, es posible transformar la figura, pero
implica un nuevo trámite registral; elegir bien la figura desde el inicio evita costes.

**¿Necesito capital mínimo para constituir?** No existe un mínimo legal general uniforme;
varios Registros Mercantiles piden referencia de capital proporcional al objeto. Verificar
con el RM de la jurisdicción (montos en Bs. al BCV).

**¿Puedo trabajar solo sin empleados?** Sí; la empresa puede funcionar sin personal y sin
inscripción en IVSS/INCES mientras no haya empleados.

**¿El trámite necesita tarjeta de crédito?** No: los aranceles se pagan por Planilla Única
Bancaria en efectivo/Bs.; los honorarios del abogado, en efectivo.

**¿Qué pasa si no publico el acta en diario?** El registro queda incompleto: la publicidad
del acta es requisito para que la sociedad produzca efectos frente a terceros.

## 13. Objeto social: cómo redactarlo

El objeto social debe describir las actividades reales, amplio pero delimitado:

- "Desarrollo, diseño y comercialización de software, aplicaciones y videojuegos."
- "Prestación de servicios de tecnología de la información y marketing digital."
- "Producción, edición y distribución de contenido musical y audiovisual."

⚠️ Un objeto demasiado restringido obliga a modificar el acta al crecer; demasiado amplio
puede levantar objeciones del Registro. Validar la redacción con el abogado.

## 14. Plazos típicos del trámite (verificar con el RM local)

| Fase | Plazo aproximado |
|---|---|
| Reserva de nombre | 1–5 días hábiles |
| Redacción y validación del acta con abogado | 3–10 días |
| Revisión del RM (documentos digitales) | 5–15 días hábiles |
| Otorgamiento (firma biométrica) | Según agenda del RM |
| Publicación en diario | 3–7 días tras el otorgamiento |
| RIF jurídico + sellado de libros | 1–5 días hábiles |

Los plazos son orientativos y varían por jurisdicción y carga administrativa.

## 15. Relación con otros sistemas

| Sistema | Relación |
|---|---|
| `PAYMENTS_SYSTEM.md` | Cuentas bancarias corporativas y pagos formales |
| `BUSINESS_SYSTEM.md` | Estructura organizacional y fases de negocio |
| `TRADEMARK_PLAN.md` | Marca a nombre de la persona jurídica |
| `TAX_PLAN.md` | Régimen fiscal de persona jurídica (RIF J-) |
| `VAULT_SYSTEM.md` | Guardar acta, RIF y certificados cifrados |

_Última revisión: 13 ago 2026._ Relacionado: `COMPANY_REGISTRATION_PLAN.md`,
`RIF_PERSON_PLAN.md`, `TRADEMARK_PLAN.md`, `INTERNATIONAL_LLC_PLAN.md`,
`BUSINESS_SYSTEM.md`.
