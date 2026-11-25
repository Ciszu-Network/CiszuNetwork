---
description: Lista todos los comandos registrados de opencode (+ snippets de PowerShell) con su explicación estilo help.
---

Muestra el catálogo de comandos registrados del ecosistema Ciszu (no los vanilla de PowerShell) con formato `help`. Divide en dos bloques:

## 1. Comandos de opencode (`/<nombre>`)

Enumera los archivos de `E:\Ciszu Network\.opencode\command\*.md` (y reflejos en `~/.config/opencode/command/`). Para cada uno imprime el nombre (con `/`) y su `description` del frontmatter. Lista (referencia):

- `/art` · `/ascii` · `/music` · `/video` — generadores IA
- `/commands` — catálogo real pnpm/opencode/PowerShell (`pnpm commands`)
- `/doctor` — diagnóstico portable (`pnpm run doctor`)
- `/clean` — limpieza segura de caches
- `/ops` — estado, métricas e informe semanal (`pnpm ops:*`, dry-run)
- `/profile` — instala/repara/recarga el perfil PowerShell portable
- `/dev` — las 4 webs locales: start/stop/status/log
- `/e2e` — smoke E2E de Playwright contra producción
- `/test-ui` — panel visual de Vitest
- `/server-start` · `/server-stop` · `/server-reset` — server headless de opencode (127.0.0.1:7777) · `/pair` — enlace para la app móvil de OpenCode
- `/ssh-fix` — diagnóstico/reparación SSH remoto
- `/storybook` — opera Storybook: `run|test|watch|build|chromatic`
- `/vitest` — tests unitarios: `all|watch|ui|<filtro>`
- `/playwright` — E2E y utilidades: `e2e|report|open|codegen|install|ui`
- `/test` — orquestador de pruebas: `unit|component|e2e|all|fast`

## 1.1 pnpm

- `pnpm commands` — catálogo real de scripts + comandos opencode.
- `pnpm run doctor` — diagnóstico del entorno.
- `pnpm ops:status|ops:digest|ops:report` — monitoreo sin enviar push.
- `pnpm clean:next|clean:logs|clean:all` — limpieza segura.
- `pnpm profile:install|profile:check` — perfil PowerShell portable.
- `pnpm deps:audit|deps:outdated` — seguridad y actualizaciones.
- `pnpm build:all` — build real de todo el monorepo.

## 2. Snippets de PowerShell (perfil `Microsoft.PowerShell_profile.ps1`)

Lista las funciones definidas en `$PROFILE` y su propósito, agrupadas:

- **git**: `gs` status · `gd` diff · `gc` commit · `gp` push · `gcp` commit+push
- **workspace**: `repo` → cd raíz · `dev <app>` · `buildall` · `lintall` · `cdnupload` · `cdnverify`
- **IA makers**: `art` · `music` · `video` · `removebg` · `textart`
- **tests**: `test` · `testui` · `testwatch` · `e2e` · `e2egui`
- **Storybook**: `sb` sirve · `sbtest` corre · `sbwatch` watch · `sbbuild` build · `sbchrom` chromatic
- **Playwright**: `pwe2e` · `pwrep` · `pwopen` · `pwcode` codegen · `pwinst` instalar browsers
- **orquestador**: `checkall` → Vitest unit + Storybook component
- **devops**: `doctor` · `cmds` · `opsstatus` · `opsdigest` · `opsreport` · `cleannext` · `cleanlogs` · `cleanall`
- **perfil**: `profile-reload` · `profile-edit` · `profile-path` · `free` · `ports`

Para cada función disponible realmente en la sesión actual puedes verificarlas con `Get-Command <nombre>` en PowerShell.

Reglas: listar solo comandos registrados (no los vanilla de PowerShell); formato claro tipo `comando — qué hace`; si piden detalle de uno, leer su `.md`/definición y explicarlo.
