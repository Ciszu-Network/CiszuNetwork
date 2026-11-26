# Shell híbrido (PowerShell + zsh)

Ciszu Network ya no depende de PowerShell como único shell. La lógica de
comandos vive en `shared/shell/` y se replica en ambos entornos, con **dos
perfiles** en cada uno:

| Archivo | Entorno | Rol |
| --- | --- | --- |
| `shared/shell/env.sh` | zsh/bash | `CISZU_REPO`, `PATH`, editor, Node/pnpm |
| `shared/shell/zshrc` | zsh | **Perfil personal**: historial, plugins, fastfetch, prompt |
| `shared/shell/ciszu.zsh` | zsh | **Perfil corporativo**: banner ASCII, estado, comandos |
| `shared/shell/aliases.sh` | zsh/bash | Comandos de proyecto (dev, gs, gc, doctor...) |
| `shared/shell/install.sh` | Linux | Enlaces a `~/.zshrc`, kitty, consolas y shell |
| `shared/shell/commands.json` | ambos | Lista canónica para la comprobación de paridad |
| `shared/fastfetch/config.jsonc` | ambos | Fastfetch con la paleta de marca |
| `shared/kitty/kitty.conf` | Linux | Terminal con la paleta cyan/rosa |
| `shared/powershell/Microsoft.PowerShell_profile.ps1` | Windows | **Perfil personal** (fastfetch opcional) |
| `shared/powershell/CiszuNetwork.Profile.ps1` | Windows | **Perfil corporativo** (se carga con `ciszu`) |
| `shared/powershell/PlatformCompat.ps1` | pwsh/Linux | Compatibilidad para consolas |
| `shared/scripts/linux/dev.sh` | Linux | CLI `dev start/stop/status/log` |
| `shared/scripts/linux/consoles.sh` | Linux | `devcon`, `staffcon`, `customerscon`, `tui` |

## Instalación en Fedora

```bash
bash shared/scripts/linux/fedora-setup.sh --tailscale --vscode
bash shared/shell/install.sh
bash shared/opencode/install.sh   # skills + cli.json + opencode.json global
exec zsh
```

Al abrir la terminal se carga el perfil **personal** (fastfetch). El corporativo
se carga a demanda:

```bash
ciszu
```

En Windows:

```powershell
pnpm profile:install   # instala el perfil personal (fastfetch)
ciszu                  # abre el perfil corporativo en una sesion nueva
```

`ciszu` en Windows lanza una sesión con el perfil corporativo; `exit` vuelve al
personal. En Linux se carga en la misma sesión de zsh.

## Paridad de comandos

| Comando | PowerShell | zsh | Notas |
| --- | --- | --- | --- |
| `repo` | si | si | `cd` a la raíz del repo |
| `dev <app>` | si | si | network/antony/ciszubot/muzic o filtro pnpm |
| `dev start/stop/status/log` | no | si | CLI nativo Linux |
| `devall` / `devstop` | si (devcon) | si | Linux: CLI `dev start/stop all` |
| `buildall`, `lintall`, `testall` | si | si | mismos scripts pnpm |
| `gs`, `gd`, `glog`, `gpull`, `gp` | si | si | git |
| `gc`, `gcp` | si | si | `git add -A` con guardia de `.env`/secretos |
| `doctor`, `cmds` | si | si | diagnostico y catalogo |
| `cdnupload`, `cdnverify` | si | si | CDN |
| `cleannext/logs/all` | si | si | limpieza |
| `test`, `testwatch`, `e2e` | si | si | tests |
| `sb`, `sbtest`, `sbwatch`, `sbbuild` | si | si | Storybook `@ciszu/ui` |
| `art`, `music`, `video`, `removebg`, `textart` | si | si | requieren rutas del repo |
| `devcon`, `staffcon`, `customerscon`, `tui` | si | si (pwsh) | wrapper Linux en `shared/scripts/linux/consoles.sh` |
| `ciszu-ai` | si (PATH) | si (solo tras `ciszu`) | servidor OpenCode 7777 compartido; ver abajo |
| `osint*`, `maltego` | si | no | herramientas solo Windows |
| `profile-edit`, `profile-reload` | si | si | edita/recarga el perfil personal |

Comprobación automática:

```bash
pnpm shell:check
```

Falla si un comando compartido desaparece de cualquiera de los dos perfiles.

En Linux, los comandos de proyecto (`repo`, `dev <app>`, `gs`, `gc`, `doctor`...)
se cargan al entrar al perfil corporativo (`ciszu`); el CLI `dev
start|stop|restart|status|log` está siempre disponible en el `PATH`
(`~/.local/bin/dev`).

## Ciszu-AI (OpenCode)

`ciszu-ai` es el lanzador oficial del servidor OpenCode V2 compartido
(`127.0.0.1:7777`), espejo de `tools/ciszu-ai/ciszu-ai.cmd` en Windows. **Solo
existe dentro del perfil corporativo**; no se enlaza en `~/.local/bin` ni se
define en el perfil personal.

```bash
ciszu              # perfil corporativo
ciszu-ai           # garantiza el server y conecta la TUI
ciszu-ai server    # solo garantizar/levantar el server
ciszu-ai status    # estado, PID y bind
ciszu-ai reset     # reiniciar server y conectar
ciszu-ai stop      # detener el server de 7777
ciszu-ai pair      # abrir en 0.0.0.0 y generar enlaces para el movil
```

- La contrasena se toma de `OPENCODE_PASSWORD` o de
  `~/.config/ciszu-ai/password` (0600, generada la primera vez).
- Logs: `.opencode/temp/opencode-server{,-err}.log`.
- Bind persistido: `~/.local/state/ciszu-ai/server-hostname.txt`.
- Misma sesion e historial para TUI, app de escritorio y movil (misma DB local).
- La config global de OpenCode se sincroniza desde el repo con
  `bash shared/opencode/install.sh` (skills, `cli.json`, `opencode.json`).

## Banner ASCII

`ciszu` carga el mismo arte ANSI que el perfil de PowerShell desde
`shared/powershell/banners/` (temas `logo`, `rainbow`, `pastel`, `darksky`):

```bash
ciszu                              # logo por defecto
CISZU_BANNER_THEME=rainbow ciszu    # cambia de tema
CISZU_BANNER_FILE=/ruta/x.ansi ciszu
```

`CISZU_PROFILE_BANNER=0` desactiva cabecera y arte. Windows usa las mismas
variables (`CISZU_BANNER_THEME` / `CISZU_BANNER_FILE`) y la misma carpeta del
repo, con fallback a `~/.config/powershell-banners-custom/`.

## Fastfetch

- **Windows**: `winget install Fastfetch-cli.Fastfetch` (instala en
  `%LOCALAPPDATA%\Microsoft\WinGet\Links`, ya en el PATH del usuario).
- **Linux**: `sudo dnf install -y fastfetch` (también lo instala
  `shared/scripts/linux/fedora-setup.sh`).
- Config común: `shared/fastfetch/config.jsonc` (logo pequeño, OS, kernel,
  uptime, shell, terminal, CPU, GPU, RAM, discos, IP y paleta).
- Si no está instalado, el perfil personal no falla: simplemente no muestra nada.
  En Windows el perfil busca también el ejecutable en WinGet Links por si el PATH
  de la sesión quedó desactualizado.

## Reglas para añadir comandos

1. Si el comando es de proyecto y funciona en ambos sistemas, va en
   `shared/shell/aliases.sh` **y** en `shared/powershell/CiszuNetwork.Profile.ps1`,
   y se añade a `shared/shell/commands.json`.
2. Si usa APIs de Windows (registro, servicios, `Get-Process`), se queda solo en
   PowerShell y se marca como Windows-only.
3. Los scripts no deben asumir `C:\` ni `E:\`: usar `$CISZU_REPO`/`$env:CISZU_REPO`.
4. La documentación de comandos vive en `GLOBAL_SYSTEM.md` y en este README; no en
   un único shell.
