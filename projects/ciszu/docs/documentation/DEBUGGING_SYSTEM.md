# DEBUGGING_SYSTEM — Sistema de Depuración Local (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-16
Identificador: DEBUGGING_SYSTEM_V1.0.0_2026_08_16_ciszunetwork

> **Definición**: sistema que documenta cómo depurar las 4 webs del monorepo en local:
> flujo de arranque, logs a tiempo real, estados de puertos, herramientas disponibles,
> señales de error típicas y reglas para no romper producción.

## 1. Propósito

La depuración local permite verificar cambios de frontend (navbars, footers, FABs, menús,
idiomas, estilos) sin hacer build ni deploy a Vercel. El flujo es:

```
código editado → next dev (puerto fijo) → navegador localhost → logs → corrección →
durante la sesión: repetir → al cerrar: detener webs y liberar puertos
```

Este documento cubre las herramientas y procedimientos para ese ciclo. La operación de
arranque/parada en sí vive en `DEV_CONSOLE_SYSTEM.md`; aquí se documenta **qué mirar** y
**cómo interpretar** lo que se ve.

## 2. Ciclo de depuración

### 2.1 Pasos recomendados

1. `devall` (o `devcon` → Encender todas) para levantar las 4 webs.
2. `devstatus` para confirmar que los puertos 3000-3003 responden.
3. Abrir en el navegador la web sobre la que se trabaja (`http://localhost:<puerto>`).
4. Reproducir el problema, observar consola de dev (`F12` → Console/Network) y `devlog <web>`.
5. Corregir, guardar (Next HMR recarga), repetir hasta resolver.
6. `devstop` al terminar para liberar puertos.

### 2.2 Quién usa qué

| Rol | Herramienta | Por qué |
| --- | --- | --- |
| Desarrollador (humano) | TUI `devcon` + navegador + F12 | Inspección visual e interactiva |
| Agente opencode | Modo CLI `/dev` + `pnpm dev:*` | Automatización sin abrir TUI |
| QA/automatización | `/dev status`, logs | Verificación de respuestas HTTP |

## 3. Puerto: fuente de estado

El **estado de una web se define por la escucha en su puerto**, no por ficheros ni procesos
recordados:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen   # si devuelve fila → web encendida
```

Esta decisión evita estados fantasma: si mats el proceso manualmente, el puerto se libera y
la consola lo detecta en el siguiente chequeo. Ver también `DEV_CONSOLE_SYSTEM.md` §3.4.

## 4. Logs en vivo

### 4.1 Dónde están

| Web | Log | Errores |
| --- | --- | --- |
| Ciszu Network | `test/website/debug/local-logs/network.log` | `network.log.err` |
| Ciszuko Antony | `test/website/debug/local-logs/antony.log` | `antony.log.err` |
| CiszuBot | `test/website/debug/local-logs/ciszubot.log` | `ciszubot.log.err` |
| MuzicMania | `test/website/debug/local-logs/muzic.log` | `muzic.log.err` |

### 4.2 Leerlos a tiempo real

```powershell
# Desde la consola CLI (abre ventana dedicada)
devlog network

# Manual
Get-Content test\website\debug\local-logs\network.log -Tail 80 -Wait
```

El `-Tail -Wait` se ejecuta en una ventana PowerShell separada para que Ctrl+C no mate el
TUI ni los procesos Next dev.

## 5. Señales de error típicas

### 5.1 Errores de compilación (log)

| Señal | Significado | Acción |
| --- | --- | --- |
| `Module not found` | import roto o paquete no instalado | Instalar la dep (`pnpm add -D` ó `-D` según la web), corregir ruta |
| `./src/...` / `SyntaxError` | Error de sintaxis/TS | Abrir el archivo, corregir, guardar (HMR recompila) |
| `Failed to compile` | Compilación no termina | Revisar el módulo indicado; tipeado/import inválido |
| `ESLint ... error` | Violación de lint bloqueante | Correr `pnpm --filter <web> lint` |
| `Type ... has no properties` | Tipeado de props roto en Next/TS | Corregir tipos en el componente o sus callers |

### 5.2 Señales en la página (navegador + F12)

| Señal | Posible causa |
| --- | --- |
| Consola del navegador roja (`Uncaught ...`) | Error de runtime en un componente cliente (`'use client'`) |
| Error de hidratación (texto difiere) | Server y client renderizan distinto (random, fechas, locale) |
| Requests 404 a `/api/...` | API route no existe en local o falla su backend (Supabase/Discord) |
| CORS en fetch | Backend externo no acepta el origen local (localHost distinto de prod) |

### 5.3 Errores de entorno local (conocidos)

| Problema local | Nota |
| --- | --- |
| Cloudflare/Turnstile | El guard solo bloquea en producción; en dev local no interfiere |
| Auth de Discord (ciszubot) | Requiere flujo OAuth con callback de localhost configurado |
| Carga de imágenes desde CDN | `SmartImage` resuelve contra el CDN de Supabase; necesita red |
| Env Vercel | Variables `NEXT_PUBLIC_*` no presentes en `.env.local` → funcionalidades desactivadas |

## 6. Herramientas de depuración disponibles

### 6.1 Consola de desarrollo (TUI/CLI)

`test/website/debug/dev_console.ps1` ofrece además de encender/detener:

| Herramienta | Comando/opción | Descripción |
| --- | --- | --- |
| Limpiar logs | TUI → Herramientas | Borra `test/website/debug/local-logs/*` |
| Procesos node | TUI → Herramientas | Tabla PID/RAM de procesos node |
| Ocupación de puertos | TUI → Herramientas | Qué proceso escucha en 3000-3003 |

### 6.2 Storybook

Para depurar componentes aislados de `@ciszu/ui` (bots flotantes, Modal Radix, iconos):

```powershell
sb        # pnpm --filter @ciszu/ui storybook  → http://localhost:6006
sbtest    # tests de interacción de stories
sbbuild   # build estático
```

El GUI de Storybook permite ver y probar un componente sin montar una web completa.
Documentado en `UI_COMPONENTS_SYSTEM.md` y `scripts/storybook.ps1`.

### 6.3 Test framework (Vitest + Playwright)

- `pnpm test` — unit (Vitest).
- `pnpm test:ui` — panel visual de Vitest.
- `pnpm e2e` — smoke E2E contra **producción** (Vercel), no contra local.
- Para E2E contra local la consola/CLI debe estar encendida (aunque los specs por defecto
  apuntan a Vercel; ver `TESTING_SYSTEM.md`).

## 7. Reglas de depuración local

1. **Nunca verificar un cambio solo por "parece correcto" en código**: comprobar en el
   navegador local y, si aplica, con `lint`/`typecheck` antes de reportar.
2. **No confundir dev y producción**: Cloudflare Guard, Turnstile y analytics solo corren en
   prod; un bug local de imágenes puede no aparecer en dev y viceversa.
3. **Liberar puertos al cerrar**: `devstop`; los puertos 3000-3003 quedan ocupados si un
   proceso queda huérfano.
4. **Logs solo en `.opencode/temp/`**: nunca escribirlos a `projects/` (evita ensuciar el
   repo y disparar deploys).
5. **Entorno**: `pnpm install` tras cambiar `package.json`; de lo contrario los errores de
   módulo no reflejan código sino instalación.
6. **HMR vs full reload**: la mayoría de cambios de React se aplican con HMR; cambios en
   config (next.config, env, middleware) requieren reiniciar la web (`Restart` en la consola).
7. **IAST/CSP en local**: el middleware de seguridad y CSP los aplica Next también en local.
   En dev, `buildCsp()` ya permite `unsafe-eval` (cliente Next dev) y el CDN local `:8788`,
   así que un bloqueo CSP en dev apunta a una fuente nueva real (no silenciar el error en el
   reporter).
8. **Reportar al agente**: al encontrarse un error en local, anotar: web, puerto, paso para
   reproducir, y si persiste tras reiniciar. Esto alimenta `PROJECTS_SYSTEM.md` §Pendientes.

## 8. Flujo de depuración guiado (para el agente opencode)

Cuando se pide "arreglar el frontend / navbar / menú de X":

1. Leer el doc del área (`FRONTEND_SYSTEM.md`, `STYLES_SYSTEM.md`, etc.).
2. **Cargar la skill `systematic-debugging`** antes de proponer fixes: su regla de hierro es
   *"no fixes sin causa raíz primero"* — reproduce, observa logs/consola, y solo después edita.
3. Encender la web afectada con el modo CLI: `ps ... -Action start -Web <key>`.
4. Tras editar, esperar el compilado (5-10 s), consultar `devstatus` para confirmar 200.
5. Leer `devlog <key>` si hay errores de compilación.
6. Correr `pnpm --filter <web> lint` (y `typecheck` si aplica).
7. Dejar la web encendida solo si Ciszuko va a probarla; si no, detenerla y liberar puertos.

> **Skills relacionadas** (catálogo en `MODELS_SKILLS_SYSTEM.md`): `systematic-debugging`
> (causa raíz antes de fixes), `verification-before-completion` (evidencia real antes de
> afirmar "arreglado"), `webapp-testing` (Playwright para verificar UI local).

## 9. FAQ

**¿Puedo ver los cambios sin deploy a Vercel?**
Sí. Levantando `next dev` en local se sirven los cambios al instante (HMR). No hay build ni
upload. Si no se ve el cambio, comprobar que la web correspondiente está encendida (`devstatus`).

**¿`pnpm dev` (turbo) sirve las 4 a la vez?**
Es el arranque por defecto histórico, pero usando puertos automáticos de Next (3000, 3001…).
Para puertos fijos y control explícito se recomienda la consola dev (`devall`).

**¿Por qué `localhost:3000` no abre?**
O no está encendida la web, o el puerto está tomado por otro proceso. Ver
`devstatus` y Herramientas → ocupación.

**¿Los logs persisten?**
Sí, en `test/website/debug/local-logs/` hasta limpiarlos (gitignored, no se suben).

**¿Y los E2E?**
Apuntan a producción por defecto; para probar contra local habría que configurar baseURL
en el spec (ver `TESTING_SYSTEM.md`).

## 10. Mantenimiento de este sistema

- Si se añade una web nueva: actualizar `DEBUGGING_SYSTEM.md` (logs, puertos), la consola,
  las guías y `LOCAL_TESTING_PROTOCOLS.md`.
- Si cambia el mecanismo de logs (p. ej. se usa `next dev --turbopack`), documentar la señal
  nueva y los archivos de log resultantes.
- Las reglas §7 deben revisarse si el equipo introduce una nueva tecnología de frontend que
  altere el ciclo (p. ej. service worker en dev).

## Referencias

- Consola dev: `DEV_CONSOLE_SYSTEM.md`.
- Protocolos obligatorios: `LOCAL_TESTING_PROTOCOLS.md`.
- Framework de tests: `TESTING_SYSTEM.md`.
- Frontend: `FRONTEND_SYSTEM.md`, `STYLES_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`.
- Errores/observabilidad: `ERRORS_SYSTEM.md`.

_Última revisión: 16 ago 2026._ Relacionado: `DEV_CONSOLE_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`, `TESTING_SYSTEM.md`.