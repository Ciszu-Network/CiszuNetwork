# HEALTH_AND_SAFETY_PROTOCOLS — Salud y bienestar laboral

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: HEALTH_AND_SAFETY_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: protocolos de salud física y mental del fundador (empresa unipersonal):
> ergonomía, pausas, sueño, hidratación y límites de sesión para sostener el ecosistema.

Contexto: Ciszu Network es una empresa unipersonal (1 persona: Francisco García, alias Ciszuko Antony). El trabajo es 100 % digital, frente a una PC con múltiples pantallas, con sesiones largas de desarrollo, uso intensivo de terminal/IDE y turnos que a veces cruzan la noche. Esta guía vela por la salud física y mental del fundador como activo principal de la empresa.

## Recomendaciones generales (física)

- **Pausas activas cada 45–60 min**: levantarse, estirar cuello/espalda/muñecas, mirar a lo lejos 2–3 min (regla 20-20-20: cada 20 min, ver a 6 m durante 20 s) para descansar la vista.
- **Postura**: silla con soporte lumbar, pantalla a la altura de los ojos (~brazo de distancia), pies apoyados. Evitar encorvarse sobre el teclado.
- **Muñecas**: teclado y mouse cómodos; pausas para evitar el síndrome del túnel carpiano (mucho trabajo con `rg`/IDE/terminal).
- **Hidratación y alimentación**: mantener agua en el escritorio; evitar saltarse comidas por "flujo" de trabajo.
- **Sueño**: intención de ciclo regular (trabajar de día, dormir de noche). El bot ciszu-bot muere si el PC se apaga; planificar cortes de 24/7 no impide descansar (ver `VPS_PLAN.md`).

## Recomendaciones mentales

- **Límites de sesión**: pausas entre bloques de trabajo; no trabajar en estado de agotamiento (la calidad del código baja y crecen los errores).
- **Contexto / error loop**: si una sesión se alarga o se bloquea, cerrar, caminar 5 min y retomar con la cabeza fresca.
- **Regla de la empresa**: la identidad de marca es una sola persona — cuidar el balance trabajo/vida es parte de la sostenibilidad del ecosistema.

## Checklist diario (opcional)

- [ ] Agua visible y botella llena
- [ ] Pausas activas (>=4 por jornada)
- [ ] Pantalla a distancia/altura correcta
- [ ] Corte nocturno definido (o plan de relevo bot en `VPS_PLAN.md`)
- [ ] Sesión de ejercicio/aire libre (aunque sea 15 min)

## Guía rápida de postura (escritorio)

| Elemento | Recomendación |
|---|---|
| Silla | Soporte lumbar, altura ajustable |
| Pantalla | Altura de ojos, ~1 brazo de distancia |
| Teclado/mouse | Muñecas rectas, sin apoyar en el borde |
| Pies | Apoyados en el suelo |
| Luz | Evitar reflejos en la pantalla |

## Regla 20-20-20

Cada 20 minutos de pantalla → mirar a 6 metros durante 20 segundos (descansa la vista).

## Señales de parada obligatoria

- Dolor de cuello/espalda/muñecas persistente.
- Visión borrosa o dolor de cabeza recurrente.
- Irritabilidad o bloqueo mental al resolver un bug.
- Más de 8-10 h seguidas frente a la PC.

Si aparece alguna → pausa larga o cierre de sesión. Registrar el evento y retomar con
cabeza fresca (la regla de la empresa: cuidar el balance es sostenibilidad).

## Seguridad física (entorno)

- Cableado ordenado (evitar tropiezos), ventilación del PC.
- Extintor/limpieza cerca de equipos; no obstruir la salida de aire.
- Backups (vault + BD) como protección ante fallos de disco (ver `VAULT_SYSTEM.md`).

## Higiene del sueño

El sueño es el activo que sostiene la calidad de todo el ecosistema. Reglas base:

- Fijar una hora de acostarse y una de levantarse consistentes (aun los fines de
  semana, con margen de ±1 h).
- Evitar pantallas 30–60 min antes de dormir; usar luz cálida y bajo brillo.
- La cafeína después de las 15:00 puede afectar la conciliación del sueño.
- Si la sesión cruza la medianoche, priorizar cerrar y retomar al día siguiente:
  el trabajo nocturno adicional suele costar más errores al día siguiente.
- El bot y las webs se mantienen operativos en la nube; dormir no los apaga. Solo
  el bot local cae si el PC se apaga, y ese es el plan de `VPS_PLAN.md`.

## Fatiga visual: síntomas y medidas

- Síntomas: ojos secos o llorosos, visión borrosa, picazón, dolor de cabeza y
  sensibilidad a la luz. Aparecen por horas frente a pantallas sin descanso.
- Medidas: regla 20-20-20 (cada 20 min mirar a 6 m por 20 s), parpadear con
  conciencia, ajustar brillo/contraste y activar modo nocturno al anochecer.
- Si el dolor o la visión borrosa persisten, consultar a un oftalmólogo; usar
  lentes con filtro de luz azul solo como complemento, no como solución única.

## Protocolo de pausas (Pomodoro adaptado)

1. Trabajar en bloques de 25–50 min según el nivel de concentración del momento.
2. Al terminar cada bloque: pausa breve de 5–10 min (estirar, caminar, agua).
3. Cada 4 bloques: pausa larga de 15–30 min (alejarse de la pantalla).
4. Usar un temporizador físico o de escritorio; no contar pausas "mentales".
5. Revisar al final del día cuántos bloques completos se lograron para calibrar el
   tamaño de la jornada realista.

## Seguridad eléctrica y de equipos

- Conectar PC y periféricos a un regulador/UPS: protege de picos y da estabilidad
  ante cortes de energía (contexto VE — ver `GEOGRAPHIC_CONTEXT_PROTOCOLS.md`).
- No obstruir las rejillas de ventilación; limpiar el polvo con periodicidad.
- Revisar cables en busca de desgaste; no pasar cables por zonas de paso.
- Los backups del vault y la BD son el seguro ante fallos de disco: mantener
  copias recientes (ver `VAULT_SYSTEM.md`) y verificar su restauración.

## Salud mental: manejo del error loop y del agotamiento

- **Error loop**: si llevas más de 20–30 min bloqueado en un mismo bug, parar.
  Explicar el problema en voz alta o por escrito suele revelar el fallo. Caminar,
  cambiar de tarea o cerrar la sesión; retomar con la cabeza fresca.
- **Agotamiento**: trabajar en estado de fatiga reduce calidad y aumenta bugs. La
  regla de la empresa es clara: cuidar el balance trabajo/vida es sostenibilidad.
- **Aislamiento**: la empresa es unipersonal; mantener contactos humanos y
  comunidades (Discord, eventos) evita el aislamiento prolongado.
- Si la irritabilidad, la apatía o el insomnio persisten semanas, considerar apoyo
  profesional: la salud mental es parte de la infraestructura.

## Rutina diaria recomendada (base)

| Hora | Actividad |
|---|---|
| 07:00–08:00 | Levantarse, luz natural, desayuno, revisión breve de ntfy/estado |
| 08:00–11:00 | Bloque de trabajo profundo (deep work) |
| 11:00–11:15 | Pausa activa (estirar, caminar, agua) |
| 11:15–13:00 | Segundo bloque (gestión o desarrollo) |
| 13:00–14:00 | Almuerzo lejos de la pantalla |
| 14:00–17:00 | Bloque de gestión, pruebas, contenidos |
| 17:00–18:00 | Cierre: commit, push, plan del día siguiente |
| 22:00–23:00 | Desconexión: pantallas apagadas, rutina de sueño |

La tabla es un molde, no un horario rígido: el objetivo es tener anclas y proteger
el deep work diario y el descanso. Ajustar según el cronotipo (ver
`SCHEDULE_PROTOCOLS.md`).

## Entorno de trabajo (escritorio y luz)

- Iluminación: luz natural de día y luz cálida de noche; evitar reflejos directos
  en la pantalla (orientar la pantalla perpendicular a ventanas).
- Temperatura: ventilador/A/C moderados; un ambiente demasiado caliente reduce el
  rendimiento y aumenta la fatiga.
- Orden: escritorio despejado reduce distracción; tener a mano agua y un vaso para
  hidratación constante.
- Ruido: si el entorno es ruidoso, usar música instrumental o ruido blanco a bajo
  volumen; los avisos del sistema deben estar en silencio durante deep work.

## Primeros auxilios y emergencias

- Tener un botiquín básico accesible y el número de emergencias local a la mano.
- Ante quemaduras menores por equipos calientes: agua fría, no ungüentos caseros.
- Ante descarga eléctrica o incidente mayor: cortar la corriente antes de tocar a la
  persona y llamar a emergencias.
- Fatiga o mareo durante una sesión larga: parar de inmediato, hidratarse y
  alimentarse antes de continuar.
- Registrar incidentes repetidos (dolor, cortes de energía) para identificar causas
  de fondo y mitigarlas.

## Checklist semanal (opcional)

- [ ] Dormí en promedio >=7 h por noche
- [ ] Hice pausas activas cada día laboral
- [ ] Tuve al menos un día de desconexión de pantallas
- [ ] No tuve sesiones >8–10 h seguidas
- [ ] Revisé postura y entorno de escritorio una vez
- [ ] Documenté cualquier dolor/molestia recurrente

## Ejercicio y movimiento

- **Diario**: 15–30 min de caminata o ejercicio ligero; usar el aire libre cuando
  el clima lo permita.
- **Micro-actividad**: subir/bajar escaleras, estiramientos de pausa activa,
  caminar durante llamadas o esperas de build.
- **Fuerza/postura**: 2–3 veces por semana ejercicios de espalda y core contrar-
  restan las horas sentado.
- **Regla práctica**: cada 60–90 min sentado, al menos 2 min de pie/movimiento.
  El movimiento es parte del flujo de trabajo, no una interrupción.

## Jornadas extendidas: plan de contingencia

Cuando un lanzamiento o incidente exija cruzar la jornada normal:

1. **Paquets y microsleep**: pausas máximas cada 90 min; nunca superar 8–10 h
   seguidas frente a la PC.
2. **Relevo de responsabilidad**: el bot 24/7 depende del PC; un VPS (ver
   `VPS_PLAN.md`) elimina la presión de "no apagar el PC".
3. **Señal de corte**: al primer signo de la "señales de parada obligatoria",
   cerrar sesión aunque queden tareas — la rama puede romperse por cansancio.
4. **Post-lanzamiento**: día siguiente con carga ligera (tareas mecánicas) para
   compensar sin quemar la semana.

## Preguntas frecuentes (FAQ)

**¿Cuántas horas al día es recomendable programar?**
Depende de la persona, pero bloques efectivos de 4–6 h de trabajo profundo más
gestión ligera suelen sostener productividad sin agotar. Más de 8–10 h seguidas
es señal de parada (ver la sección de señales).

**¿La regla 20-20-20 es suficiente para la vista?**
Ayuda a descansar el enfoque, pero no sustituye revisiones oftalmológicas. Si hay
molestias persistentes, consultar a un especialista.

**¿Qué pasa si el PC se apaga de noche y el bot cae?**
Nada crítico: es el comportamiento esperado hoy. Para 24/7 real, el plan es mover
el bot a un VPS (ver `VPS_PLAN.md`). Descansar tiene prioridad sobre el uptime
local.

**¿Cómo evito lesiones por trabajo con terminal/IDE?**
Ergonomía (muñecas rectas, descansos), pausas activas y estiramientos de
muñecas/manos. Si hay dolor persistente, consultar a un médico.

## Seguimiento y revisión

Revisar este documento mensualmente junto con `SCHEDULE_PROTOCOLS.md`: si aparecen
nuevos síntomas, ajustar la rutina; si hay cambios en el entorno (nuevo equipo,
mudanza, plan VPS), actualizar las recomendaciones de seguridad eléctrica y
postura.

_Última revisión: 13 ago 2026._ Relacionado: `SCHEDULE_PROTOCOLS.md`,
`REMOTE_CONTROL_SYSTEM.md`, `VAULT_SYSTEM.md`, `VPS_PLAN.md`.