# GEOGRAPHIC_CONTEXT_PROTOCOLS — Contexto geográfico (Falcón, Venezuela)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: GEOGRAPHIC_CONTEXT_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: contexto geográfico de operación de Ciszuko Network (Falcón, Venezuela):
> ubicación, implicaciones fiscales/pagos/conectividad, zona horaria y ventajas.

Contexto de dónde opera Ciszuko Network. Como empresa unipersonal registrada en Venezuela, el contexto geográfico afecta fiscos, medios de pago, conectividad y logística.

## Ubicación

- **País**: Venezuela (República Bolivariana de Venezuela).
- **Estado**: **Falcón** — al noroccidente del país, península de Paraguaná, costas del mar Caribe y del golfo de Venezuela. Capital: Coro (declarada Patrimonio Mundial de la Humanidad por la UNESCO, 1993).
- **Huso horario**: UTC−4 (Caracas), sin cambio de hora estacional.

## Implicaciones para la empresa (digital)

- **Medios de pago**: PayPal (internacional), Binance P2P, Zinli, cripto (MetaMask/NOWPayments) — los métodos locales VE condicionados por sanciones/banca (ver `PAYMENTS_SYSTEM.md`).
- **Trámites**: RIF persona natural en SENIAT, registro de marca via SAPI, registro mercantil en SAREN — todo en línea en Fase 0 (ver `COMPANY_REGISTRATION_PLAN.md` + planes `*_PLAN.md`).
- **Conectividad**: la infra (hosting) vive en la nube (Vercel/Supabase/Cloudflare + GH Actions US-EU), no depende del entorno local; el PC local (E:, Windows) es estación de trabajo, no servidor (el bot 24/7 depende de él hoy — ver `VPS_PLAN.md`).
- **Equipo/insumos**: hardware y periféricos comprados en VE; soporte en español; costos en bolívares con transacciones en divisas USD/BS.

## Zona horaria y agenda

- Todo cron/CI está en **UTC** (pipeline de seguridad 06:00 UTC, DAST lunes 06:30 UTC); convertir a hora local (UTC−4) al planificar (es decir, 02:00/02:30 hora de Caracas).
- La agenda semanal de `SCHEDULE.md` se refiere a hora local de Falcón (UTC−4).

## Ventajas del contexto

- Talento/hispanohablante: comunidad de usuarios del bot y las webs es mayormente de habla hispana (Discord Lounge, Telegram, WhatsApp).
- Música/diseño: influencia cultural latina y costera; la marca neón es universal pero la música y el arte son propios (MuzicMania con tracks propios, mascota neon).
- Internacionalización: 4 webs en inglés + contenido en español (producto bilingüe).

## Datos pragmáticos de referencia

- Conectividad: DSL/fibra local, con DNS del PC intermitente (ver `AGENTS.md` — Resolve-DnsName, VPN activa).
- Certificación digital (Firma electrónica) SENIAT gestionable en Fase 0.

## Implicaciones por área (resumen)

| Área | Impacto | Documento |
|---|---|---|
| Fiscal | RIF persona natural VE, facturación digital | `COMPANY_REGISTRATION_PLAN.md`, `FREELANCER_TAX_PLAN.md` |
| Pagos | PayPal/Binance P2P/Zinli/cripto; sin tarjeta internacional | `PAYMENTS_SYSTEM.md` |
| Legal | Marcas SAPI, registro SAREN en línea | `TRADEMARK_PLAN.md`, `COMMERCIAL_REGISTRATION_PLAN.md` |
| Infra | Hosting en la nube (no local); bot 24/7 depende del PC hoy | `VPS_PLAN.md`, `REMOTE_CONTROL_SYSTEM.md` |
| Horarios | Crones UTC → convertir a UTC−4 | `SCHEDULE_PROTOCOLS.md` |

## Conversiones horarias (UTC → Falcón, UTC−4)

| Hora UTC | Hora Caracas |
|---|---|
| 00:00 | 20:00 (día anterior) |
| 02:00 | 22:00 (día anterior) |
| 06:00 | 02:00 |
| 06:30 | 02:30 (DAST) |
| 12:00 | 08:00 |
| 18:00 | 14:00 |

## Checklist de decisiones geográficas

- [ ] Confirmar que el método de pago acepta VE (o usar crypto/P2P).
- [ ] Ajustar crons al horario local al planificar.
- [ ] Verificar DNS del PC (intermitente) antes de operaciones remotas.
- [ ] Documentar cualquier nuevo requisito local (bomberos, alcaldía) aquí.

## Entorno físico y energía (Venezuela)

Venezuela tiene clima tropical con dos estaciones: seca (noviembre–abril) y lluviosa
(mayo–octubre). En Falcón, península de Paraguaná, el clima es árido y costero, con
vientos alisios constantes y temperaturas promedio entre 26–32 °C. Implicaciones
prácticas para el ecosistema:

- **Calor**: mantener el PC ventilado y fuera del sol directo; las altas
  temperaturas reducen la vida útil de discos y baterías y pueden provocar
  thermal throttling en builds largos.
- **Polvo/arena**: en zonas costeras el polvo fino se acumula; limpiar
  ventiladores y filtros periódicamente para evitar sobrecalentamiento.
- **Cortes de energía**: el suministro eléctrico puede ser intermitente en algunas
  zonas; usar un UPS/regulador para el PC y el módem/router protege el bot 24/7 y
  los backups locales.
- **Tormentas eléctricas**: en temporada de lluvias, conectar equipos sensibles a
  protectores contra picos y desconectar cuando haya tormenta eléctrica activa.

## Conectividad en detalle

- La conexión local (DSL/fibra) tiene latencia variable según la hora del día; para
  operaciones sensibles (deploys, backups grandes) preferir horario de baja demanda.
- El DNS del PC es intermitente (ver `AGENTS.md`): usar `Resolve-DnsName` para
  diagnosticar y una VPN activa como vía alternativa cuando github.com no resuelva.
- El push desde el PC falla a veces por DNS — el usuario hace push manualmente; por
  eso conviene tener siempre un commit limpio local listo para cuando se restaure la
  conexión.
- Si el plan de internet tiene límites de datos, evitar descargas grandes repetidas
  y verificar el espacio en disco antes de bajar assets o toolchains.

## Riesgos geográficos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Cortes de energía | PC/bot caídos, trabajo sin guardar | UPS, guardado frecuente, plan `VPS_PLAN.md` |
| DNS inestable | Push/SSH fallan | VPN, commit local, reintentos |
| Calor/polvo | Sobrecalentamiento del equipo | Ventilación, limpieza periódica |
| Banca restringida | No usar tarjetas internacionales | Crypto/P2P (ver `PAYMENTS_SYSTEM.md`) |
| Tipo de cambio volátil | Costos en BS impredecibles | Referencias en USD, cripto |

## Operación remota (procedimiento recomendado)

1. Verificar conectividad con `Resolve-DnsName` antes de sesiones remotas.
2. Confirmar disponibilidad de energía (UPS cargado, sin cortes programados).
3. Ejecutar operaciones de despliegue/backup en horario de baja demanda.
4. Mantener un commit local limpio por si el push debe hacerse manualmente.
5. Documentar incidentes geográficos (cortes, DNS) en `TODO.md`/incidencias para
   detectar patrones y planear mitigaciones.

## Festivos y días no laborables (Venezuela)

Venezuela tiene días no laborables de carácter general (Año Nuevo, Carnaval,
Semana Santa, Día del Trabajo, 24 de junio, 5 de julio, 24 de julio — natalicio de
Simón Bolívar —, 12 de octubre, 25 de diciembre, entre otros) además de feriados
regionales y locales (en Falcón, por ejemplo, el día de Coro y el Carnaval de Coro,
declarado Patrimonio de la Humanidad). Al planificar entregas y lanzamientos:

- Evitar lanzamientos en puentes festivos salvo que el objetivo sea intencional.
- Programar mantenimientos y migraciones en días laborables normales.
- Las fechas exactas varían cada año; confirmar con el calendario oficial vigente.

## Zona horaria: más conversiones útiles

| Hora UTC | Hora Caracas | Contexto |
|---|---|---|
| 05:00 | 01:00 | Ventana de mantenimiento nocturno |
| 06:00 | 02:00 | Pipeline de seguridad |
| 06:30 | 02:30 | DAST (lunes) |
| 13:00 | 09:00 | Inicio de jornada típica |
| 15:00 | 11:00 | Ventana de trabajo profundo |
| 23:59 | 19:59 | Fin de día (UTC) |

## Compras y logística local

- Hardware y periféricos se compran en Venezuela; los precios se expresan en USD y
  se pagan en bolívares (BS) según el tipo de cambio del día (BCV) o en cripto/P2P.
- El soporte de los equipos es local, en español; considerar garantías y repuestos
  al elegir marcas disponibles en el país.
- Importaciones: no dependen de este contexto; todo el software es SaaS/nube. Si se
  requiere hardware importado, calcular costos de envío, impuestos aduaneros y
  tiempos de entrega antes de decidir.

## Cultura local e influencia en la marca

- La comunidad de habla hispana (Discord, Telegram, WhatsApp) y el contexto costero
  caribeño nutren el tono de la marca: cercano, festivo y visualmente llamativo.
- La música y el arte propios (MuzicMania, mascota neón) reflejan esa identidad
  latina sin perder un acabado profesional internacional.
- El producto es bilingüe (webs en inglés + contenido en español): el contexto
  geográfico justifica el español como idioma primario de comunidad y el inglés
  como idioma de producto/mercado global.

## Comparación con husos horarios frecuentes

| Ciudad | Diferencia con Falcón (UTC−4) | Contexto |
|---|---|---|
| Madrid / Berlín | +6 h | Comunidad hispanohablante europea; planificar eventos |
| Ciudad de México | −1 h (misma tarde/noche) | Sincronía natural con Latam |
| Bogotá / Lima | Misma hora (UTC−5) | Colaboraciones y streams directos |
| Buenos Aires | +1 h | Comunidad argentina (UTC−3) |
| Nueva York | +4 h (verano) / +5 h (invierno) | Dependencias de hosting US (Vercel, Supabase) |

Al planificar lanzamientos, streams o mantenimientos con audiencias fuera de VE,
usar esta tabla para elegir una hora que no cruce la madrugada local ni la de las
comunidades objetivo (ver `SCHEDULE_PROTOCOLS.md`).

## Plan de contingencia ante cortes de energía

1. **Antes**: UPS cargado, guardado automático del IDE, backup reciente del vault
   (`VAULT_SYSTEM.md`) y un commit limpio local.
2. **Durante**: verificar si la conexión sigue activa (router con su propio UPS);
   el trabajo en la nube (webs, BD, CDN) no depende del PC, solo el bot local.
3. **Después**: revisar `ciszubot.bot_status`, ntfy y UptimeRobot; reanudar tareas
   con `pnpm`/state actual; registrar el corte en `TODO.md` si afectó operaciones.
4. **Prevención**: detectar patrones (p. ej. cortes a la misma hora) y mover las
   tareas críticas fuera de esas ventanas.

## Lenguaje en contextos geográficos

- Con usuarios VE/Latam: español formal-cercano, sin regionalismos excesivos.
- Con audiencias internacionales: inglés limpio y modular (webs ya bilingües).
- Documentación interna: español (ver `AGENTS.md`); nombres de archivos en inglés.
- Soporte del bot y marketing: siempre en español primero, adaptando el canal
  (ver `TARGET_AUDIENCE_PROTOCOLS.md`).

## Preguntas frecuentes (FAQ)

**¿Por qué la zona horaria es UTC−4 fija?**
Venezuela usó UTC−4:30 entre 2007 y 2016; desde diciembre de 2016 el huso es UTC−4
fijo, sin horario de verano. Todos los crones en UTC se convierten con una
diferencia constante de 4 horas.

**¿La infra depende de la electricidad local?**
El hosting está en la nube (Vercel/Supabase/Cloudflare), así que las webs siguen
operativas sin el PC local. Solo el bot de Discord depende hoy del PC; por eso el
hosting en `VPS_PLAN.md` es prioritario para un 24/7 real.

**¿Cómo se pagan servicios internacionales sin tarjeta?**
Con crypto y canales P2P (NOWPayments, Binance P2P, Zinli, PayPal según la cuenta)
— ver `PAYMENTS_SYSTEM.md` para el detalle de cada proveedor y sus límites.

**¿Qué documentos legales locales se requieren en Fase 0?**
RIF persona natural (SENIAT, gratuito y en línea), registro de marca (SAPI) y
registro mercantil (SAREN). El detalle está en `COMPANY_REGISTRATION_PLAN.md` y
los planes `*_PLAN.md` asociados.

**¿Qué hago si el PC no resuelve github.com?**
Usar `Resolve-DnsName` para diagnosticar, activar la VPN, reintentar; si persiste,
dejar el commit listo y hacer el push manualmente cuando se restaure la conexión.

## Actualización del contexto

Revisar este documento ante cualquier cambio de: huso horario, marco fiscal local,
medios de pago disponibles en VE, conectividad del PC o nuevos requisitos
municipales/estadales. Los cambios de mayor impacto (pagos, legal, VPS) deben
reflejarse también en `PAYMENTS_SYSTEM.md`, `COMPANY_REGISTRATION_PLAN.md` y
`REMOTE_CONTROL_SYSTEM.md`.

_Última revisión: 13 ago 2026._ Relacionado: `HISTORICAL_CONTEXT_PROTOCOLS.md`,
`TARGET_AUDIENCE_PROTOCOLS.md`, `SCHEDULE_PROTOCOLS.md`, `PAYMENTS_SYSTEM.md`.