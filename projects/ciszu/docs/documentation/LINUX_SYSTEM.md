# LINUX_SYSTEM — Ecosistema híbrido Windows + Fedora

Versión: 1.1.0
Actualización: 2026-11-25
Identificador: LINUX_SYSTEM_V1.1.0_2026_11_25_ciszunetwork

> **Definición**: estrategia y estado del soporte de Linux (Fedora 45 KDE) en
> Ciszu Network: arranque dual, shell híbrido PowerShell/zsh, toolchain,
> OpenCode, port de MuzicMania y política de aplicaciones. Complementa a
> `GLOBAL_SYSTEM.md`, `TOOLS_SYSTEM.md` y `APP_ALTERNATIVES_PLAN.md`.

## 1. Contexto real

| Elemento | Estado |
| --- | --- |
| PC | Kingston A400 240 GB (Windows 11 + Fedora), WD 1 TB (D:), ST500 500 GB (E:) |
| Arranque | UEFI, Secure Boot activo, GPT en los 3 discos |
| Windows | C: 181,98 GB NTFS · WinRE 858 MB · ESP 200 MB compartido |
| Fedora | `/boot` 2 GB ext4 · `/` 38,54 GB btrfs · kernel 7.3.x (F45) |
| WSL | Solo queda la distro `docker-desktop`; Ubuntu se eliminó |
| Docker | Docker Desktop vive en Windows; en Fedora se usa Podman (o Docker CE opcional) |
| USB | Ventoy 1.1.18 con tema propio, F6 para Fedora/Windows |

Decisiones ya tomadas:

1. **Fedora Workstation 45 KDE** como único Linux de trabajo (sin WSL para el repo).
2. **ESP compartido** con Windows; no se formatea ni se crea un segundo ESP.
3. **Shell híbrido**: el repo deja de ser “PowerShell-first”; la lógica común vive
   en `shared/shell/` y se replica en PowerShell.
4. **Podman rootless** por defecto; Docker CE solo si un flujo lo exige.
5. **MuzicMania** se compila en Linux con Tauri (deb/rpm/AppImage), sin reescribir el juego.

**Ruta canónica (25 nov 2026)**: Windows `E:\Ciszu Network` = Linux
`/mnt/CiscoData2/Ciszu Network` (ntfs3). Un solo repo; el data dir de OpenCode
(`.opencode\data`, ~6,6 GB) vive dentro y Windows lo usa vía junction
(`C:\Users\fplay\.local\share\opencode`).

## 2. Fase 0 — Preparación de Fedora

Antes de instalar, ejecutar el reconocimiento (solo lectura; no pide sudo):

```bash
bash shared/scripts/linux/preflight.sh
```

Si devuelve `[FAIL]`, detenerse y reportar. Los `[WARN]` se revisan y se adapta
el plan (ver la matriz de decisión del runbook del agente).

Script idempotente:

```bash
bash shared/scripts/linux/fedora-setup.sh --tailscale --vscode --opencode
```

Opciones: `--docker` (Docker CE en vez de Podman), `--no-repo` (no ejecuta
`pnpm install`). El script instala base, Tauri, Node 24, pnpm 12.16.1, Rust,
contenedores, fuentes, shell y dependencias del monorepo.

Particionado vigente (no tocar):

```text
sda1  200 MB   ESP        /boot/efi (compartido con Windows)
sda2   16 MB   MSR        (Windows)
sda3  181,98GB NTFS       C: (Windows)
sda5    2 GB   ext4       /boot
sda7   38,54GB btrfs      /
sda4  858 MB   WinRE      (Windows)
```

Reglas: no formatear el ESP, no borrar WinRE, no ampliar particiones Linux hacia
C: sin backup.

## 3. Fase 1 — Shell híbrido (PowerShell + zsh)

| Archivo | Rol |
| --- | --- |
| `shared/shell/env.sh` | `CISZU_REPO`, `PATH`, editor, Node/pnpm |
| `shared/shell/aliases.sh` | Comandos de proyecto en POSIX |
| `shared/shell/zshrc` | Perfil **personal**: historial, fastfetch, prompt |
| `shared/shell/ciszu.zsh` | Perfil **corporativo**: banner ASCII, estado y comandos |
| `shared/shell/install.sh` | Enlaces a `~/.zshrc`, kitty, consolas y shell |
| `shared/fastfetch/config.jsonc` | Fastfetch con la paleta de marca |
| `shared/kitty/kitty.conf` | Terminal con paleta cyan/rosa |
| `shared/powershell/Microsoft.PowerShell_profile.ps1` | Perfil personal Windows |
| `shared/powershell/CiszuNetwork.Profile.ps1` | Perfil corporativo Windows (se carga con `ciszu`) |
| `shared/powershell/PlatformCompat.ps1` | Compatibilidad pwsh/Linux para consolas |
| `shared/scripts/linux/dev.sh` | CLI `dev` nativo Linux |
| `shared/scripts/linux/consoles.sh` | `devcon`, `staffcon`, `customerscon`, `tui` con pwsh |

Instalación:

```bash
bash shared/shell/install.sh
exec zsh
```

Paridad: `repo`, `dev <app>`, `buildall`, `lintall`, `testall`, `gs/gd/glog/gp`,
`gc/gcp`, `doctor`, `cmds`, `cdnupload`, `clean*`, `test*`, `e2e`, `sb*`.
Windows-only: `osint*`, `maltego`, `ports` (en Linux se usa `ss`). `devcon`,
`staffcon`, `customerscon`, `tui` y `devall/devstop` funcionan en ambos (Linux vía
`pwsh`/CLI `dev`). La tabla completa está en `shared/shell/README.md`.

Los comandos de proyecto se cargan con el perfil corporativo (`ciszu`); solo el
CLI `dev` (start/stop/restart/status/log) está siempre en el `PATH` mediante
`~/.local/bin/dev`.

**Dos perfiles, no uno**:

- Al abrir la terminal se carga el **personal** (`zshrc` + fastfetch), sin banner
  corporativo.
- `ciszu` carga el **corporativo** (`ciszu.zsh`): banner ASCII, estado del repo,
  rama, toolchain y comandos. En Windows, `ciszu` en PowerShell carga
  `CiszuNetwork.Profile.ps1`; el perfil personal es el que queda instalado.
- `pnpm shell:check` compara ambos perfiles contra `shared/shell/commands.json`
  y falla si un comando compartido desaparece.

**Consolas**: `dev` es un CLI nativo (start/stop/restart/status/log/all).
`devcon`, `staffcon`, `customerscon` y `tui` corren con `pwsh` mediante
`shared/scripts/linux/consoles.sh` + `PlatformCompat.ps1` (emula
`Get-NetTCPConnection`, normaliza `Join-Path` y aporta shims de
`explorer.exe`/`powershell.exe`). Si una consola usa una API Windows sin
equivalente, se anota en el reporte del agente y se usa el CLI `dev`.

**Regla nueva**: un comando de proyecto se implementa en ambos shells o se marca
explícitamente como Windows-only. No se documenta un flujo asumiendo `E:\`.

## 4. Fase 2 — Toolchain

| Herramienta | Fedora | Notas |
| --- | --- | --- |
| Node | 24 vía `fnm` | repo exige Node >= 24 |
| pnpm | 12.16.1 vía corepack | misma versión que Windows |
| Rust | rustup stable | Tauri |
| Python | 3.x del sistema + pipx | scripts del repo |
| DB | `postgresql` 18.3 (cliente) + DBeaver opcional | `dbvr` no está instalado (requiere Java 25) |
| Contenedores | Podman rootless | `podman-docker` da el alias `docker` |
| Audio | LMMS + Audacity | FL Studio no se instala; LMMS cubre el flujo |
| Git/gh | dnf | `gh auth login` manual |
| rclone | dnf | mismo remoto que Windows |
| Tailscale | dnf + `tailscale up` | acceso remoto |
| OpenCode | installer oficial | ver §5 |

Comandos de verificación:

```bash
node -v && pnpm -v && rustc -V && cargo -V
podman info >/dev/null && echo podman-ok
pnpm doctor
```

## 5. Fase 3 — OpenCode en Linux

Instalación (CLI):

```bash
curl -fsSL https://opencode.ai/v2/install | bash
```

Alternativas: `npm install -g @opencode/cli`, `pnpm add -g --allow-build=@opencode/cli @opencode/cli`,
o el `.rpm`/AppImage de escritorio desde opencode.ai.

Configuración: OpenCode usa `~/.config/opencode/` en Linux (equivalente a
`C:\Users\<usuario>\.config\opencode` en Windows). Sincronizar desde el repo sin
copiar secretos:

```bash
bash shared/opencode/install.sh   # skills (symlink), opencode.json y cli.json
```

Los secretos viven en el vault (`services/supabase/.env`) o en
`SECRET_TEMP.env`; nunca en el repo. La autenticación de proveedores se hace con
`opencode auth login` en cada máquina.

Rutas y servidor:

```bash
opencode debug paths        # config, data, db, log
opencode --server http://127.0.0.1:7777
opencode service status
```

Sesiones: por defecto cada SO usa su DB local
(`~/.local/share/opencode/opencode.db`). Para compartirlas entre Windows y Linux,
montar E: y apuntar `OPENCODE_DB` al `.db` de Windows (o symlinkear el data dir);
riesgo de SQLite sobre NTFS, hacer backup y no usar ambos SO a la vez. El server
de Windows se alcanza por Tailscale (`http://<ip-tailscale>:7777`).

Sincronizacion reproducible desde el repo:

```bash
bash shared/opencode/install.sh
```

Instala las 34 skills como symlink (`~/.config/opencode/skills` y
`~/.agents/skills`), el `opencode.json` global y genera `cli.json` con la ruta
Linux del plugin de voz. La autenticacion de proveedores no se copia: usar
`opencode auth login` (o el `auth.json` del vault, nunca el repo).

**Ciszu-AI en Linux**: `ciszu-ai` solo existe dentro del perfil `ciszu`
(`shared/shell/ciszu.zsh`). Garantiza el servidor V2 en `127.0.0.1:7777` y
conecta la TUI; `server`, `status`, `reset`, `stop` y `pair` replican los
lanzadores de Windows. La contrasena vive en `OPENCODE_PASSWORD` o en
`~/.config/ciszu-ai/password` (0600).

Notas:
- El plugin de voz es Node y funciona en Linux; requiere `whisper-cpp`, `piper`
  y `sox` en el PATH, mas los modelos locales. Sin ellos la TUI arranca igual.
- `cli.json` con `session.permissions=autoaccept` se reutiliza; las rutas
  absolutas de Windows se sustituyen por la del repo en Linux.
- El servidor headless (`opencode serve`) funciona igual; Tailscale permite
  entrar desde Windows.
- La DB de sesiones sigue siendo local por SO (`~/.local/share/opencode/opencode.db`).
  Migrar la DB de Windows (6,4 GB) queda como decision manual.

## 6. Fase 4 — MuzicMania en Linux

El launcher ya tenía `tauri.linux.conf.json`; faltaba corregir la detección de
plataforma y añadir RPM.

Cambios aplicados:

1. `src-tauri/src/main.rs`:
   - `detect_os()` / `detect_os_key()`: Windows 10/11, `linux`, `macos`.
   - `detect_architecture()` / `detect_arch_key()`: `x64`/`arm64` reales en Linux
     (antes leía `PROCESSOR_ARCHITECTURE`, ausente fuera de Windows).
   - `installer_info` usa las funciones nuevas.
2. `src-tauri/src/policy.rs`:
   - `platform()` usa `detect_os_key()` + `detect_arch_key()`.
   - `platform_error` ya no bloquea Linux/macOS cuando el manifiesto solo tiene
     builds de Windows (no habrá auto-update hasta publicar releases Linux).
3. `tauri.linux.conf.json`: targets `deb`, `rpm`, `appimage`.
4. `build-linux.sh`: compila y lista artefactos.
5. `.github/workflows/build-launcher.yml`: matriz Linux con `rpm` y `rpm` instalado.

Compilar en Fedora:

```bash
bash projects/muzicmania/launcher/build-linux.sh
```

Artefactos: `src-tauri/target/release/bundle/{deb,rpm,appimage}`.

Pruebas mínimas en Linux (WebKitGTK):
- Carga del juego, assets y audio (codecs: instalar `gstreamer1-plugins-*` si falta).
- Teclado/ratón/mando (Web Gamepad API).
- Guardado local (`localStorage`/IndexedDB) y persistencia entre reinicios.
- Rendimiento y vsync; comparar con Windows.
- Tema/ventana, bandeja (appindicator) y cierre limpio.

Distribución: el `.rpm` es el formato natural en Fedora; `.deb` para Debian/Ubuntu;
AppImage para cualquier distro (requiere libfuse2 o `--appimage-extract-and-run`).
Firma: Linux no usa Authenticode; se puede firmar con GPG el RPM y publicar SHA-256.

## 7. Fase 5 — Aplicaciones

El inventario completo y su alternativa están en `APP_ALTERNATIVES_PLAN.md`.
Política de sustitución:

1. Nativo en repos/Flatpak.
2. Alternativa funcional (misma tarea, otra app).
3. Versión web oficial.
4. Wine/Proton/Bottles (solo si es imprescindible).
5. VM Windows (KVM/QEMU) para lo que no tenga sustituto.

## 8. WSL y contenedores

WSL ya no es necesario para el repo. Queda `docker-desktop` como backend de
Docker Desktop en Windows. En Fedora:

```bash
podman info
podman run --rm hello-world
```

Si un proyecto exige Docker Engine:

```bash
bash shared/scripts/linux/fedora-setup.sh --docker
```

No se comparte el `docker_data.vhdx` de Windows con Fedora; son motores distintos.

## 9. Verificación de cierre

```bash
# shell (personal + corporativo)
zsh -lic 'ciszu; repo; dev status'
pnpm shell:check
pwsh -Version
fastfetch --version
# repo
cd "$CISZU_REPO" && pnpm install && pnpm lint && pnpm test -- --run
# tauri
bash projects/muzicmania/launcher/build-linux.sh
# opencode
opencode --version && opencode debug paths
# contenedores
podman run --rm hello-world
```

Rollback: los cambios de Windows no se tocan; Fedora se puede reinstalar sin
afectar C:. El ESP y WinRE no se modifican.

## 10. Riesgos y pendientes

- Codecs propietarios (H.264/AAC) en WebKitGTK: instalar `gstreamer1-plugins-bad-freeworld`
  (RPM Fusion) si el juego usa vídeo.
- `dbvr` no está instalado en Fedora: usar `psql`/DBeaver (o Java 25 + dbvr si se necesita).
- El plugin de voz de OpenCode funciona en Linux (Node); para STT/TTS faltan
  `whisper-cpp`, `piper`, `sox` y los modelos locales. Sin ellos la TUI arranca igual.
- Publicar releases Linux en el manifiesto (`release-manifest.json`) para que el
  auto-update funcione también fuera de Windows.
- Firmar RPM/AppImage y documentar checksums en la página de descargas.

---

_Última revisión: 25 nov 2026. Relacionados: `GLOBAL_SYSTEM.md`,
`TOOLS_SYSTEM.md`, `APP_ALTERNATIVES_PLAN.md`, `INSTALLERS_SYSTEM.md`,
`REMOTE_CONTROL_SYSTEM.md`, `INSTALLERS_SYSTEM.md`,
`shared/docs/linux/AGENT_LINUX_SETUP_REPORT.md`._
