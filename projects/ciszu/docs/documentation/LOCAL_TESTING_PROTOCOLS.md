# LOCAL_TESTING_PROTOCOLS — Protocolos de Pruebas Locales (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-16
Identificador: LOCAL_TESTING_PROTOCOLS_V1.0.0_2026_08_16_ciszunetwork

> **Definición**: protocolo obligatorio de pruebas en local del monorepo: cuándo usar dev
> con la consola, puertos oficiales, verificación mínima antes de reportar terminada una
> tarea de frontend, y reglas de higiene (puertos, logs, entornos).

## 1. Alcance

Estos protocolos aplican a cualquier tarea que toque **frontend** de las 4 webs (o paquetes
que rendericen en las webs): navbars, footers, menús, FABs, idiomas, estilos, componentes
`@ciszu/ui`. NO aplican a tareas que solo tocan backend (API, bot, DB) sin cambio visual,
aunque la regla de "no reportar sin verificar" aplica de forma general.

Obligatoriedad: **alta**. Una tarea de frontend no verificada en local **no se da por
terminada** del lado del yunque TI; la verificación en el navegador (o su imposibilidad
justificada) es parte del done.

## 2. Puertos oficiales (no negociables)

| Web | Puerto fijo | URL |
| --- | --- | --- |
| Ciszu Network | 3000 | `http://localhost:3000` |
| Ciszuko Antony | 3001 | `http://localhost:3001` |
| CiszuBot | 3002 | `http://localhost:3002` |
| MuzicMania | 3003 | `http://localhost:3003` |

Reglas:

1. Nunca arrancar una web en un puerto distinto manualmente sin razón; si se hace, usar la
   conservel del puerto en el reporte (puerto no oficial rompe la detección de la consola).
2. Encender varias webs a la vez exige puertos distintos. Por eso los scripts pnpm fijan puerto
   (`web:dev` → `-p 3000`, `antony:dev` → `-p 3001`, `ciszubot:web:dev` → `-p 3002`,
   `muzicmania:dev` → `-p 3003`).

## 3. Procedimiento de prueba local

### 3.1 Antes de tocar código

1. Identificar qué webs se ven afectadas (páginas, componentes compartidos).
2. Encenderlas con `devall` o el modo CLI:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File test/website/debug/dev_console.ps1 -Action start -Web <key>
   ```
3. Confirmar `devstatus` → las webs afectadas en `[ON]`.

### 3.2 Durante el desarrollo

- Guardar el código; Next compila con HMR en segundos.
- Verificar visualmente en el navegador (p. ej. resolver el TODO de frontend concreto).
- Si aparece error, seguir `DEBUGGING_SYSTEM.md` §5 (señales) y `devlog <key>`.

### 3.3 Antes de dar por terminada una tarea de frontend

Checklist de cierre (todas las que apliquen):

- [ ] La web afectada compila en local (`devstatus` `[ON]`).
- [ ] El cambio se ve correcto en el navegador local (imagen, estado interactivo).
- [ ] Interacciones probadas: hover, click, menú hamburguesa, selector de idioma, FABs.
- [ ] Responsive chequeado al menos en un ancho de móvil (F12 → toggle device) si el cambio
      toca layout.
- [ ] `pnpm --filter <web> lint` sin errores nuevos.
- [ ] Si el área lo exige, `pnpm typecheck` global o del paquete tocado.
- [ ] Puertos liberados tras la sesión (`devstop`) salvo que Ciszuko siga probando.

### 3.4 Reporte

En el resumen de cierre (AGENTS / PROJECTS_SYSTEM) incluir:

- Webs encendidas y verificadas (puerto).
- Resultados de lint/typecheck.
- Nota de cualquier señal de error residual (no bloqueante) y su log.

## 4. Higiene de puertos y procesos

1. **Liberar al terminar**: `devstop`. Queda prohibido dejar `next dev` corriendo en segundo
   plano al finalizar una sesión sin confirmarlo con Ciszuko.
2. **Procesos huérfanos**: si un puerto queda ocupado sin web, usar Herramientas → ocupación
   de la consola o:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -State Listen
   Stop-Process -Id <pid> -Force
   ```
3. **Colisiones**: nunca encender dos webs en el mismo puerto; el error típico es "Port 3000
   is already in use" de Next (el puerto 3000 quedó del arranque automático de otra web).

## 5. Logs y temporales (reglas de disco)

1. Los logs de dev viven SIEMPRE en `test/website/debug/local-logs/` (gitignored).
2. Prohibido abrir procesos/logs en `C:\Users\fplay\AppData\Local\Temp` (regla global del
   repo): disco C limitado.
3. Limpiar `test/website/debug/local-logs/` con la opción de la consola al cerrar sesiones largas.
4. Comprobar espacio antes de tareas que generen artefactos grandes
   (`Get-PSDrive C,E`), especialmente si se corre Storybook, e2e o media junto a dev.

## 6. Protección de producción

1. **La consola de dev no despliega nada**: nada de lo que corra en local toca Vercel, CDN ni
   Supabase (salvo datos en vivo que la propia web use).
2. **No romper producción por omisión**: los cambios para producción se envian por
   commit/push/deploy por los workflows; los tests locales solo verifican código, no despliegan.
3. **No editar tablas/funciones RLS en local**: las migraciones se aplican con scripts
   dedicados; la depuración local de DB se hace con `dbvr`, no editando directamente.
4. **Secretos**: nunca imprimir .env en logs (regla global); los logs de `next dev` pueden
   volcar variables; revisar antes de pegar logs en docs o reportes.

## 7. Protocolo para el agente opencode

Cuando opencode reciba una tarea de frontend:

1. Lee el doc del área (`FRONTEND_SYSTEM.md`, etc.) y el TODO asociado.
2. **No** asume terminado por código: usa el flujo §3 y el checklist §3.3.
3. Prefiere el modo CLI de la consola (no TUI) para encender/detener; si Ciszuko va a
   probar visualmente, deja la web encendida y avisa el puerto.
4. Si la tarea toca varias webs (p. ej. un componente compartido), probar en TODAS las que
   renderizan el componente afectado.
5. En el cierre: lista de webs probadas + resultado de lint/typecheck + estado de puertos.

### 7.1 Comandos permitidos

```powershell
# Encender
ps dev_console -Action start -Web network | antony | ciszubot | muzic
# Estado
ps dev_console -Action status
# Log en vivo de la web afectada
ps dev_console -Action log  -Web <key>
# Detener
ps dev_console -Action stop  -Web <key>
```

O sus alias pnpm/perfil: `pnpm dev:all`, `pnpm dev:status`, `devlog <key>`, `devstop`.

## 8. Cuándo NO hace falta dev local

- Tareas de backend/API sin componente visual (bot, workers, DB): se validan con `dbvr`,
  Bruno (`pnpm api:test`) o logs del servicio; no es necesario encender la web salvo que se
  consuma un endpoint nuevo desde el navegador.
- Cambios exclusivos de documentación: se validan con el pipeline de docs (`txt2md`…).
- Tests unitarios puros de `packages/`: `pnpm test`.
- Storybook para componentes `@ciszu/ui` aislados: ver `UI_COMPONENTS_SYSTEM.md` (no requiere
  levantar webs).

## 9. Matriz rápido: ¿qué usar para qué?

| Necesidad | Herramienta |
| --- | --- |
| Ver una web en local | `devcon` (TUI) o `devall` |
| Ver todas a la vez | `devall` + abrir las 4 URLs |
| Ver un componente aislado | `sb` (Storybook) |
| Chequear respuesta del puerto | `devstatus` |
| Debug un error de compilación | `devlog <web>` |
| Tests unitarios | `pnpm test` |
| Smoke E2E (producción) | `pnpm e2e` |
| Reportar errores de build local conocidos | `PROJECTS_SYSTEM.md` |

## 9.1 Plantilla de reporte de una tarea de frontend

Al cerrar una tarea de frontend, el resumen debe seguir este molde:

```
Web/es tocadas: <web(s)> (puerto <n>)
Qué se cambió: <archivos y comportamiento esperado>
Verificado:     local [SÍ/NO] · http://localhost:<puerto>
Lint:           [OK/errores]
Typecheck:      [OK/errores o N/A]
Interacciones:  hamburguesa/menú/idioma/FAB …
Puertos:        liberados al cierre [SÍ/NO]
Notas:          <señales residuales, logs, pendientes>
```

## 9.2 Troubleshooting rápido de verificación

| Síntoma | Chequeo |
| --- | --- |
| El cambio no aparece en el navegador | ¿La web correcta encendida? ¿Guardado? ¿HMR vs config (requiere restart)? |
| Compila pero rompe otra web | ¿El paquete compartido (`packages/`) cambió? Redeploy arrastra las 4; probar todas |
| Puerto 3003 responde con otra web | Reconectar: en Next dev, un 3003 levantado antes con filtro distinto puede quedar de una sesión previa; `devstatus` aclara |
| El FAB/PDWA no aparece | Los componentes FAB son compartidos `@ciszu/ui`; verificar en todas las webs que lo usan |
| Los textos no cambian de idioma | En ciszubot el idioma usa cookie + reload (`ciszubot_lang`); en ciszu/antony es estado; verificar por web |

## 10. Evidencia y trazabilidad

## 10. Evidencia y trazabilidad

- Los resultados de verificación pueden referenciar: salida de `devstatus`, logs
  (`network.log`), salidas de lint. No hace falta capturas de pantalla en cada tarea, pero
  si un bug visual es el objetivo, adjuntar la evidencia (descripción + paso para reproducir)
  al cierre.
- Los errores que no se puedan resolver en la sesión se registran como pendiente en
  `PROJECTS_SYSTEM.md` §Pendientes y nunca se marcan como resueltos.

## 11. Mantenimiento

- Si se añade un quinto proyecto web: actualizar los puertos (§2), la consola `$WEBS`, las
  guías `dev_console.{md,txt}`, y este protocolo (no dejar puertos 3004 en adelante sin
  registro).
- Si el ciclo HMR cambia (p. ej. Turbopack default), revisar §3.2 y `DEBUGGING_SYSTEM.md` §7.

## Referencias

- `DEV_CONSOLE_SYSTEM.md` — operación de la consola.
- `DEBUGGING_SYSTEM.md` — interpretación de señales y solución de problemas.
- `TESTING_SYSTEM.md` — framework de tests (unit/component/e2e).
- `FRONTEND_SYSTEM.md`, `STYLES_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`.
- `WORKFLOW_SYSTEM.md` — operación diaria general.

_Última revisión: 16 ago 2026._ Relacionado: `DEV_CONSOLE_SYSTEM.md`, `DEBUGGING_SYSTEM.md`, `TESTING_SYSTEM.md`.