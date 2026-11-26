---
description: Instala, comprueba o recarga el perfil PowerShell portable de Ciszu Network.
---

El perfil personal es el que se instala por defecto. El perfil corporativo se
carga con el comando `ciszu`.

- **Windows**: `ciszu` abre una sesión nueva con el perfil corporativo (banner,
  prompt original y comandos). `exit` vuelve al perfil personal.
- **Linux**: `ciszu` carga el perfil corporativo en la misma sesión de zsh.

- **Windows — instalar/reparar** (hace backup del perfil actual):
  `pnpm profile:install`
- **Windows — comprobar**:
  `pnpm profile:check`
- **Linux — instalar**:
  `bash shared/shell/install.sh && exec zsh`
- **Linux — comprobar**:
  `pnpm shell:check`
- **Cargar el perfil corporativo**:
  `ciszu` (en ambos shells)
- **Recargar el personal**:
  `. $PROFILE` (Windows) o `exec zsh` (Linux).

En un dispositivo nuevo: clona el repo, ejecuta `pnpm install` y después
`pnpm profile:install` (Windows) o `bash shared/shell/install.sh` (Linux). No
copies secretos al perfil.
