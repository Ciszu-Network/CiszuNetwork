# DEV_CONSOLE_SYSTEM — Consola de Desarrollo y Debugging Local (Ciszu Network)

Versión: 1.4.0
Actualización: 2026-08-17
Identificador: DEV_CONSOLE_SYSTEM_V1.3.0_2026_08_17_ciszunetwork

> **Definición**: sistema que documenta la consola interactiva (TUI) y el modo CLI
> (`test/website/debug/dev_console.ps1`) para probar las 4 webs del monorepo en local:
> puertos fijos, comandos, logs en tiempo real y resolución de problemas.

## 1. Qué es la consola de desarrollo

`dev_console.ps1` es una consola PowerShell que centraliza la operación de las 4 webs
Next.js en desarrollo local. Reemplaza la necesidad de abrir terminales manuales por
web: encender, reiniciar, detener, ver estado, abrir en el navegador y seguir logs,
desde un único punto.

Existen dos modos de uso:

| Modo | Disparo | Uso |
| --- | --- | --- |
| **TUI interactivo** | `devcon` / `pnpm dev:console` | Menú navegable por flechas, pensado para operación visual con el usuario |
| **CLI no interactivo** | `-Action <accion> -Web <key>` | Automatización: PowerShell, opencode, scripts, CI local |

La guía de usuario vive en `test/website/debug/dev_console.md` (y `.txt`); este documento
describe el sistema: arquitectura, puertos, comandos y reglas.

## 2. Puertos fijos (nomenclatura)

Cada web tiene un puerto local fijo. Esta tabla es la **fuente de verdad** de puertos y se
replica en la guía, en el AGENTS.md y en los scripts del perfil PowerShell.

| Web | Filtro pnpm | Puerto | Carpeta | URL local |
| --- | --- | --- | --- | --- |
| **Ciszu Network** | `ciszunetwork-website` | 3000 | `projects/ciszu/website` | `http://localhost:3000` |
| **Ciszuko Antony** | `ciszukoantony-website` | 3001 | `projects/ciszukoantony/website` | `http://localhost:3001` |
| **CiszuBot** | `ciszubot-website` | 3002 | `projects/ciszubot/website` | `http://localhost:3002` |
| **MuzicMania** | `muzicmania-website` | 3003 | `projects/muzicmania/website` | `http://localhost:3003` |

La consola resuelve la carpeta del portfolio por patrón en runtime
(`Get-ChildItem projects -Directory | Where-Object { $_.Name -match 'antony' }`), igual que
el resto del ecosistema, para no depender del nombre exacto de la carpeta.

## 3. Arquitectura de la consola

### 3.1 Estructura de archivos

```
test/website/debug/
├── dev_console.ps1     # TUI + CLI (unica fuente de verdad)
├── dev_console.md      # Guia de usuario (markdown)
└── dev_console.txt     # Guia de usuario (texto plano)
```

### 3.2 Componentes internos

| Componente | Responsabilidad |
| --- | --- |
| `$WEBS` | Catálogo de webs: `key`, `name`, `filter` (pnpm), `port`, `dir` |
| `Show-Menu` | Navegación TUI (flechas ↑/↓, Enter, Q/Esc) |
| `Start-WebByKey` | Lanza `pnpm --filter <filter> dev -p <port>` en fondo con logs redirigidos |
| `Stop-WebByKey` | Detiene el proceso que escucha en el puerto de la web |
| `Show-Log` | Abre el log en vivo en una ventana PowerShell separada |
| `Show-Status` | Estado de puertos y URLs |
| Modo `-Action` | CLI no interactivo para automatización |

### 3.3 Cómo arranca una web

La consola lanza el comando real `pnpm --filter <filter> dev -p <port>` a través de
`cmd.exe /c` con ventana oculta. `stdout` y `stderr` van a:

```
test/website/debug/local-logs/<key>.log        # salida normal
test/website/debug/local-logs/<key>.log.err    # errores
```

Ese directorio es **gitignored** y vive junto a la consola (visible para el usuario en
`test/website/debug/`). No se toca en producción.

### 3.4 Detección de estado

El estado de una web se calcula consultando si hay un proceso a la escucha en su puerto:

```powershell
Get-NetTCPConnection -LocalPort <port> -State Listen
```

No depende de ficheros de PID ni de guardar estados: si el puerto responde, la web está
encendida. Esto evita estados fantasma tras cierres manuales del navegador o del proceso.

## 4. Modo TUI interactivo

### 4.1 Apertura

```powershell
# Comando del perfil PowerShell
devcon

# Desde la raiz del monorepo
pnpm dev:console

# Directo (sin perfil ni pnpm)
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.ps1
```

La `ExecutionPolicy Bypass` evita bloques por política de ejecución scripts (común en
Windows sin firma).

### 4.2 Menú principal

| Opción | Acción |
| --- | --- |
| Encender webs | Abre selección múltiple → `Start-WebByKey` sobre las marcadas |
| Reiniciar webs | `Stop-WebByKey` + `Start-WebByKey` sobre las marcadas |
| Detener webs | `Stop-WebByKey` sobre las marcadas |
| Estado de puertos | Tabla de estado + URLs (🔢 selección múltiple) |
| Logs en tiempo real | Menú simple → log de UNA web encendida por vez |
| Limpiar logs locales | Borra `local-logs/*` |
| Procesos node (memoria) | Tabla de PIDs + RAM de node |
| Puertos 3000-3003 | Qué proceso escucha en cada puerto |
| Comandos pnpm rápidos | lint / test / build / install / cdn:upload / cdn:verify |
| Deploy a Vercel | Marca webs → `vercel --prod` en cada una |
| Vault → Bitwarden | Sube el vault cifrado a Bitwarden (o `vault crypt`) |
| Anuncios: debug local | Configura anuncios en local (webs, tipo, intervalo, fuente/marca, recompensa, limpiar/reiniciar) |
| Disclaimers: debug local | Configura disclaimers en local (webs, tipo, duración, fecha, cierre, imagen, resumen/eliminar/modificar) |
| Advisor: enviar mensaje global | Envía mensajes a las webs (GlobalAdvisor) |
| Advisor: kill switch | Activa/desactiva los mensajes globales |
| Staff Console / Customers Console | Abre las consolas de empleados/clientes |
| Estado CDN local / Reiniciar CDN | Estado y reinicio del CDN local `:8788` |
| Abrir carpeta de logs / Versiones / Git status / Disco | Utilidades rápidas |
| Manual de ayuda | Muestra la guía rápida integrada |
| Créditos / Versión | Identidad y versión de la consola |
| Salir (Ctrl+C) | Cierra SOLO la consola; las webs y el CDN local siguen activos |

> **Nota**: desde v2.5.0 las opciones de herramientas viven en el menú principal
> (sin submenú "Herramientas extra") para ahorrar navegación.

### 4.3 Selección múltiple (operativas)

Las operativas (Encender / Reiniciar / Detener) abren un menú de selección con las
4 webs **marcadas por defecto** (auto-marcado). Al terminar de marcar/desmarcar se
elige cómo proceder:

| Decisión | Tecla | Comportamiento |
| --- | --- | --- |
| **Proceder** | `Enter` | Ejecuta la operación en las webs marcadas |
| **No proceder** | `N` | Cancela la operación y vuelve al menú (no aplica nada) |
| **Abortar** | `Q` / `Esc` | Cierra la consola sin tocar las webs (siguen activas) |

Las webs marcadas se procesan con `Invoke-SelectedWebs` (`Start-WebByKey`/`Stop-WebByKey` con `-Wait`);
la consola espera (spinner + `Wait-WebReady`) a que cada web responda en su puerto.

### 4.4 Teclas

| Tecla | Efecto |
| --- | --- |
| `↑` / `↓` | Moverse entre opciones |
| `Espacio` | Marcar / desmarcar la web resaltada |
| `A` | Marcar todas las webs |
| `1`…`9` / `0` | Saltar al índice de la opción (0 = 10.ª) |
| `Enter` | Proceder (ejecutar en las webs marcadas) |
| `N` | No proceder (cancelar) |
| `Q` / `Esc` | Abortar (cerrar consola; las webs siguen activas) |

### 4.5 Debug local de anuncios (opción "Anuncios: envio de anuncio tipo advisors")

El devcon permite **ENVIAR un anuncio forzado** en local (punto H), estilo advisor:
aparece **YA**, independientemente del intervalo/cooldown/periodo de gracia, con aviso
claro de que fue enviado por la devcon (badge "enviado por devcon" en el modal). Flujo:

1. **Submenú**: Enviar anuncio · Quitar anuncios de pantalla · Resumen del push · Eliminar push.
2. **Enviar anuncio**:
   - **Webs destino** (selección múltiple): casillas por web (network/antony/ciszubot/muzic).
   - **Tipo**: intrusivo (centro) · particulares (esquina) · reward · optional (banner inferior).
   - **Fuente**: oficial de Ciszu Network (elegir marca con isotipo:
     ciszunetwork/ciszukoantony/ciszubot/muzicmania/ciszugamens) · terceros (external, sin isotipo).
   - **Mensaje**: título, descripción, texto del botón y URL destino (con defaults).
   - **Recompensa** (solo si tipo = reward): si/no.
3. Al escribir el push, se muestra el **fallback "Pendiente..."** (como advisor): se hace
   `GET http://localhost:<puerto>/api/ads/push` a cada web y se comprueba que devuelve el
   mismo `createdAt`. Si lo devuelve → ✅ entregado; si no → ⏳ pendiente… hasta timeout (30s).

El push se escribe en `test/website/debug/local-logs/ads_push.json` y cada web (en
desarrollo) lo lee vía `GET /api/ads/push`. `AdsProvider` lo muestra al instante con el
badge "enviado por devcon" (ignora cooldown, intervalo y gracia). "Quitar de pantalla"
dispara `POST /api/ads/clear` → evento `ciszu:ads:clear` (clearCurrent). En producción el
endpoint devuelve `{enabled:false}`.

### 4.6 Debug local de disclaimers (opción "Disclaimers: debug local")

Permite configurar disclaimers en local para depurar el sistema global de avisos de cabecera
(`DisclaimerStack`). Flujo:

1. **Acciones**: crear · eliminar · modificar · resumen · reiniciar (todos).
2. **Crear**: webs destino (casillas) → mensaje → tipo (info/beta/warning) →
   **duración** (temporal sin fecha / temporal con fecha de culminación / permanente) →
   **cierre** (opcional con X / obligatorio sin X) → imagen (URL opcional).
3. **Fecha de culminación**: hora (HH:MM 24h), día, mes y año. Si la fecha es anterior a la
   actual o inválida, da error y no guarda. Al llegar la fecha, el disclaimer se cierra solo y
   no vuelve a aparecer (contador visible en el stack).
4. **Modificar** permite cambiar periodo/cierre/tipo de un disclaimer existente por webs.

La config se escribe en `local-logs/disclaimers_debug.json` y cada web la lee vía
`GET /api/disclaimers/debug` (solo dev). El componente `DisclaimerDebug` la inyecta en la pila
global. En producción no tiene efecto.

> **Importante (site ids)**: el devcon selecciona webs por sus **keys cortas**
> (`network/antony/ciszubot/muzic`), pero los componentes de `@ciszu/ui` usan los
> **siteId completos** (`ciszunetwork/ciszukoantony/ciszubot/muzicmania`). La función
> `Resolve-SiteIds` mapea keys → siteId al escribir `disclaimers_debug.json` y
> `ads_push.json`. Sin ese mapeo, los disclaimers/anuncios NO coinciden con el `site`
> prop de cada web y nunca se muestran.

### 4.6b Disclaimers GLOBALES (opción "Disclaimers: GLOBAL", replica de advisor)

Replica el sistema de advisors para disclaimers de cabecera a nivel ecosistema:

- **Tablas** (migración `20260902000027_global_disclaimers.sql`):
  `global_disclaimers` · `global_disclaimer_settings` (kill switch) ·
  `global_disclaimer_deliveries` (confirmación por web).
- **Componente** `GlobalDisclaimer` (`@ciszu/ui`), montado en los 4 layouts junto al
  `DisclaimerStack`: hace polling a la BD (cada 20s), respeta el kill switch, confirma
  entrega por sitio y muestra los disclaimers en el stack de cabecera.
- **Script** `scripts/disclaimer.js`: envía (`--target global|site --kind info|beta|warning
  --dismissible on|off --expires ISO`), gestiona el kill switch (`--toggle on|off`), lista
  y borra. Con `--wait` espera confirmación de entrega por web ("Pendiente...").
- **Devcon**: opciones "Disclaimers: GLOBAL (enviar)", "Disclaimers: activar/desactivar
  globales (kill switch)" y "Disclaimers: borrar globales" en Herramientas.

## 5. Modo CLI no interactivo

Pensado para opencode, scripts y automatización:

```powershell
# Estado de todas las webs (tabla [ON]/[OFF])
ps.ps1 (dev_console) -Action status

# Encender / reiniciar / detener una web
-Action start    -Web network
-Action restart  -Web ciszubot
-Action stop     -Web muzic

# Log en vivo de una web (ventana separada)
-Action log -Web network
```

Claves de web disponibles: `network`, `antony`, `ciszubot`, `muzic`. Si `-Web` no coincide
con ninguna clave, la consola imprime las válidas y sale con código 1.

## 6. Comandos del perfil PowerShell

Para no abrir la carpeta `test/website/debug/` cada vez, el perfil registra estos comandos:

| Comando | Equivale a |
| --- | --- |
| `devcon` | Abre el TUI |
| `devall` | Encender las 4 webs |
| `devstop` | Detener las 4 webs |
| `devstatus` | `-Action status` |
| `devlog <web>` | `-Action log -Web <web>` |
| `devweb` / `devantony` / `devbotweb` / `devmuzic` | Encender cada web |

Todos se resuelven contra la constante `$DEV_CONSOLE` del perfil, que apunta a
`E:\Ciszu Network\test\website\debug\dev_console.ps1`.

## 7. Scripts pnpm en la raíz

| Script | Comando resultante |
| --- | --- |
| `pnpm dev:console` | Abre el TUI |
| `pnpm dev:all` | Encender las 4 webs |
| `pnpm dev:stop` | Detener las 4 webs |
| `pnpm dev:status` | Estado rápido |
| `pnpm dev:log -- <web>` | Log en vivo de una web |
| `pnpm web:dev` / `antony:dev` / `ciszubot:web:dev` / `muzicmania:dev` | Cada web en su puerto fijo |

**Nota**: los scripts de dev previos (sin puerto) se actualizaron para fijar el puerto
(`-p 3000`…`-p 3003`), de modo que encender varias webs a la vez no colisione en el 3000
automático de Next.

## 8. Logs

### 8.1 Ubicación

- `test/website/debug/local-logs/network.log`
- `test/website/debug/local-logs/antony.log`
- `test/website/debug/local-logs/ciszubot.log`
- `test/website/debug/local-logs/muzic.log`
- Errores en la misma carpeta con sufijo `.err`

### 8.2 Log en tiempo real

`Show-Log` abre una ventana PowerShell separada ejecutando
`Get-Content <log> -Tail 80 -Wait`. Solo las webs **encendidas** tienen log en vivo:
si una web está detenida el menú lo muestra como `detenida - sin log` y `Show-Log` se
niega a abrir un log obsoleto. Ventajas de una ventana dedicada:

- Ctrl+C o cerrar la ventana **no afecta al TUI** ni a los procesos Next dev.
- Permitir abrir varios logs a la vez (una ventana por web).

### 8.3 Limpieza

La opción Herramientas → Limpiar logs borra `*` de `test/website/debug/local-logs/`. Es
seguro: es carpeta temporal, gitignored y regenerable.

## 9. CDN local (offline :8788)

Las webs resuelven assets con `@ciszunetwork/cdn`. En local, `NEXT_PUBLIC_CDN_URL` apunta
a un servidor estático (`scripts/serve-cdn.js`) que sirve la **raíz del monorepo** en
`http://localhost:8788` con rutas 1:1 (igual que Supabase Storage en producción). Así
logos (`projects/*/content/logos`), fotos (`shared/images`) y medios cargan desde disco,
**sin internet**. Es el mismo mecanismo que en producción pero con origen local.

- **Arranque** (`Ensure-CdnServe`): al encender la primera web. PID en
  `test/website/debug/local-logs/cdn-serve.pid`, log `cdn-serve.log(.err)`.
- **Parada** (`Stop-CdnServe`): ya **no** se detiene al **Salir** de la TUI (los servidores se
  mantienen activos a propósito). Para reiniciarlo: Herramientas → Reiniciar CDN.
- **Manual**: `pnpm cdn:serve` (port `--port <N>`).
- Se sirven archivos correctos con su MIME (`getContentType`); `GET`/`HEAD`, sin
  `index.html`, `Cache-Control: no-cache`, y rechazo de rutas fuera del repo (traversal).
- Si los logos no cargan: Herramientas → Estado CDN local (revise que 8788 escuche).

## 10. Identidad visual

La consola sigue la identidad del ecosistema (neon cyan/rosa sobre negro):

- Paleta ANSI truecolor: cyan `52;226;226`, rosa `255;92;144`, verde `138;226;52`.
- Arte ASCII de Ciszu Network en el encabezado de cada pantalla.
- Estados en color: `[ENCENDIDA]` verde, `[DETENIDA]` gris, avisos amarillo.
- ASCII puro (sin tildes en el código fuente) para una codificación segura en PS 5.1.

## 11. Resolución de problemas

| Problema | Causa | Solución |
| --- | --- | --- |
| "Ya encendida (port X)" | La web ya responde en el puerto | Usar `Restart` en vez de `Start` |
| Web no responde a los 5 s | El compilador Next sigue arrancando | Esperar y re-consultar `status` o ver `log` |
| Puerto ocupado y no es la web | Otro proceso escucha en el puerto | Herramientas → ocupación 3000-3003, matar el proceso |
| `pnpm` no encontrado | Entorno sin pnpm en PATH | Abrir la consola desde una sesión con pnpm configurado |
| Logs acumulados | Uso prolongado | Herramientas → Limpiar logs |
| `$root` mal calculado | Movida la carpeta `test/website/debug` | Verificar que `dev_console.ps1` viva en `test/website/debug/` (3 niveles bajo la raíz) |
| Consola no arranca por política | ExecutionPolicy | Usar `-ExecutionPolicy Bypass` o `devcon` del perfil |

## 12. Reglas y mantenimiento

1. **Una sola fuente de verdad**: `dev_console.ps1` es el único lugar que define puertos y
   lanzamiento de webs. Las guías y docs referencian sus valores; ante un cambio (nueva web
   o puerto) actualizar a la vez: script, guías (`md`/`txt`), y las tablas de `AGENTS.md`.
2. **No hardcodear rutas nuevas**: la carpeta del portfolio se resuelve en runtime.
3. **Toda web nueva** debe añadirse a `$WEBS` con su puerto fijo y su comando pnpm.
4. **Cerrar las webs al terminar**: liberar los puertos 3000-3003 con `devstop` o desde el
   TUI; evita colisiones en sesiones siguientes.
5. **Logs siempre bajo `test/website/debug/local-logs/`**: nunca dentro de `projects/` ni
   `public/`, ni en `.opencode/temp/` (región transpuesta de la migración de 17 ago 2026).
6. La consola es **dev-only**; no interfiere con los deploys de producción ni con los jobs
   de CI. Los e2e (Playwright) contra producción son otro sistema (`TESTING_SYSTEM.md`).

## 13. Pruebas de la consola (sin Pester)

La consola no depende de un framework externo; se prueba con dos mecanismos:

- **SelfTest interno** (`-SelfTest`): determinista y sin interactividad. Valida versión,
  catálogo de webs (4 keys/ports fijos), `Format-State`, que `Get-WebPhase` devuelve una fase
  válida por web y que `Build-WebSelectOptions` genera las 4 opciones. Termina con `exit 0/1`.
- **Runner** `test/website/debug/dev_console.tests.ps1`: verifica sintaxis, BOM UTF-8
  (obligatorio para los emojis en PS 5.1), SelfTest, modo Demo y CLI `-Action status`.
  Termina con `exit 0` solo si todo pasa.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.ps1 -SelfTest
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.tests.ps1
```

Al tocar lógica del TUI, ejecutar siempre el runner antes de commitear.

## Referencias

- Guía de usuario: `test/website/debug/dev_console.md` y `test/website/debug/dev_console.txt`.
- Pruebas de la consola: `test/website/debug/dev_console.tests.ps1`.
- Debugging: `DEBUGGING_SYSTEM.md`.
- Protocolos locales: `LOCAL_TESTING_PROTOCOLS.md`.
- Framework de tests global: `TESTING_SYSTEM.md`.
- Comandos del agente: `OPENCODE_SYSTEM.md`.

_Última revisión: 17 ago 2026._ Relacionado: `DEBUGGING_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`, `TESTING_SYSTEM.md`.