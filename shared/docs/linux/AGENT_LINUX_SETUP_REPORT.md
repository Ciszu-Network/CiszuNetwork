# AGENT_LINUX_SETUP_REPORT — Runbook para agente en Fedora

Versión: 1.0.0
Actualización: 2026-11-25
Identificador: AGENT_LINUX_SETUP_REPORT_V1.0.0_2026_11_25_ciszunetwork

> **Para quién es este archivo**: un agente de OpenCode que corre en Fedora y
> debe dejar el ecosistema Ciszu Network operativo en Linux, validando cada
> paso. Léelo completo antes de ejecutar. No asumas Windows ni PowerShell 5.1.

## 0. Contexto

| Dato | Valor |
| --- | --- |
| Repo | `https://github.com/Ciszu-Network/CiszuNetwork` (público) |
| Ruta local Linux | `$HOME/Ciszu Network` (preferida) o donde se clone |
| Windows | C: 181,98 GB NTFS, Fedora en `/dev/sda7` (38,54 GB btrfs) |
| Fedora | Workstation 45 KDE, `/boot` 2 GB, ESP compartido 200 MB |
| Shell personal | zsh + kitty + fastfetch |
| Shell corporativo | comando `ciszu` (banner + comandos del ecosistema) |
| Contenedores | Podman rootless (Docker CE opcional) |
| Paquetes Linux | `rpm`/`deb`/`AppImage` (MuzicMania launcher) |

Reglas para el agente:

0. **Primero ejecuta §1 (reconocimiento).** El estado real de Fedora prevalece
   sobre este documento; si algo no coincide, adapta el plan y reporta.
1. No commitear ni pushear sin pedido explícito de Ciszuko Antony.
2. No editar `TODO.md`.
3. No imprimir secretos; usar `services/supabase/.env` o `SECRET_TEMP.env` al vuelo.
4. Documentar cada desviación en el reporte final.
5. Si un comando falla, no improvisar una reinstalación: aplicar el fallback de §11.

## 1. Reconocimiento y diagnóstico (obligatorio antes de tocar nada)

Este paso existe porque quien escribió el resto del documento no tiene acceso en
vivo a Fedora. Antes de instalar, compilar o cambiar configuración, el agente debe
**observar, diagnosticar y evaluar** el sistema. Si el estado real no coincide con
el plan, se adapta el plan; nunca se fuerza.

### 1.1 Ejecutar el preflight (solo lectura)

```bash
cd "$CISZU_REPO"
bash shared/scripts/linux/preflight.sh | tee ".opencode/temp/preflight-$(date +%Y%m%d-%H%M).log"
```

- Código 0: se puede continuar (revisando los `[WARN]`).
- Código 1: bloqueo (repo ausente o menos de 5 GB libres); detenerse y reportar.
- El script **no pide sudo, no instala, no borra, no reinicia**. Solo lee.

### 1.2 Qué debe revisar y registrar

| Área | Evidencia | Por qué importa |
| --- | --- | --- |
| Distro/kernel/escritorio | `cat /etc/fedora-release`, `uname -r`, `$XDG_SESSION_TYPE` | Nombres de paquetes y rutas cambian entre versiones |
| SELinux / Secure Boot | `getenforce`, `mokutil --sb-state` | No desactivar SELinux; Secure Boot ya funciona con Fedora |
| Discos / espacio | `lsblk -f`, `df -BG /`, `findmnt /` | No tocar ESP/NTFS; evitar builds sin espacio |
| Herramientas | versiones de node, pnpm, rustc, pwsh, podman, docker, lmms, opencode | Evitar reinstalar o degradar lo que ya existe |
| Servicios/puertos | `systemctl is-active`, `ss -ltnp` | No matar procesos ajenos; detectar servers ya activos |
| Repo | `git status`, rama, `node_modules`, `.env` (solo presencia) | No resetear trabajo local ni sobrescribir secretos |
| OpenCode | `opencode debug paths`, skills en `~/.config/opencode` | Decidir si se comparten sesiones o solo config |
| Red | `ip -brief addr`, `tailscale status` | Server remoto y sincronización |
| Fuentes/locale | `fc-list`, `locale`, `timedatectl` | Evitar romper el entorno de escritorio |
| GPU | `lspci -k`, `glxinfo -B` (si existe) | WebKitGTK/Resolve dependen del driver |

### 1.3 Matriz de decisión (si ves X, haz Y)

| Si el sistema muestra… | Entonces… |
| --- | --- |
| Node 24 ya instalado (nvm/fnm/otro) | No instalar fnm; usar ese Node y reportar la ruta |
| pnpm distinto de 12.16.1 | `corepack prepare pnpm@12.16.1 --activate`; no borrar el existente |
| Rust/cargo ya instalados | No ejecutar rustup de nuevo; verificar versión |
| Docker CE ya instalado | Usar Docker; **no** instalar Podman encima |
| Solo Podman | Mantener Podman; el alias `docker` viene de `podman-docker` |
| `pwsh` ausente | Instalarlo; si falla, usar `dev` y reportar consolas no disponibles |
| Puertos 3000-3003 ocupados | No matar procesos; identificar dueño y reportar |
| Puerto 7777/4096 escuchando | El server ya corre; solo verificar, no reiniciar |
| Cambios locales en el repo | No `git reset` ni `checkout`; trabajar sobre ese estado y reportar |
| `.env` o vault presentes | No sobrescribir ni imprimir; solo comprobar existencia |
| `node_modules` presente | Respetar el lockfile; usar `pnpm install --frozen-lockfile` |
| Menos de 10 GB libres | Omitir build Tauri/RPM; liberar espacio o reportar |
| Fedora distinta a 45 | Ajustar nombres de paquetes; validar cada uno antes de instalar |
| RPM Fusion ya presente | No volver a añadirlo |
| `~/.zshrc` real (no symlink) | El instalador hace backup; confirmar antes de enlazar |
| OpenCode con config/skills propios | Copiar solo lo que falte; no sobrescribir |
| E: no montado | No forzar el montaje; clonar el repo en `$HOME` |
| Tailscale sin autenticar | No ejecutar `tailscale up` sin el usuario; reportar |

### 1.4 Condiciones de parada

Detente y reporta **sin ejecutar nada más** si encuentras:

- repo ausente o carpeta que no es git;
- menos de 5 GB libres en `/`;
- transacción de dnf/rpm bloqueada (`/var/lib/rpm/.rpm.lock`) o sistema de archivos en solo lectura;
- errores de disco en `dmesg` o `smartctl`;
- cualquier instrucción del plan que implique formatear, reparticionar, borrar
  datos, tocar el ESP, Windows o el arranque;
- un estado que contradiga este documento de forma importante.

### 1.5 Evidencia para el reporte final

Guardar el log del preflight y anotar: versiones, decisiones tomadas, desviaciones,
puertos ocupados, servicios activos y cualquier cosa que el plan no contemplara.
El reporte final debe explicar **qué se adaptó y por qué**, no solo qué se ejecutó.

## 2. Instalación base

```bash
git clone https://github.com/Ciszu-Network/CiszuNetwork.git "$HOME/Ciszu Network"
export CISZU_REPO="$HOME/Ciszu Network"
cd "$CISZU_REPO"
bash shared/scripts/linux/fedora-setup.sh --tailscale --vscode --opencode --kvm
```

El script instala: base, Tauri, Node 24 (fnm), pnpm 12.16.1, Rust, PowerShell 7,
Podman, LMMS, KVM (opcional), fuentes, shell y dependencias del monorepo.

Verificación (todo debe responder versión):

```bash
node -v          # v24.x
pnpm -v          # 12.16.1
rustc -V         # 1.9x
cargo -V
pwsh -Version    # 7.x
podman --version
lmms --version
fastfetch --version
```

Si algo falta, instalar a mano con dnf y anotarlo. `pwsh` sale del repo de
Microsoft (`packages-microsoft-prod`); si falla, usar el `.tar.gz` oficial.

## 3. Shell personal y corporativo

```bash
bash shared/shell/install.sh
exec zsh
```

- Al abrir zsh debe verse **fastfetch** (perfil personal).
- `ciszu` debe imprimir el banner ASCII, el estado del repo y cargar los comandos.
- `pnpm shell:check` debe decir `Paridad OK: 36 comandos compartidos`.

Windows (para el usuario, no para el agente Linux): `pnpm profile:install`
instala el perfil personal; `ciszu` en PowerShell carga el corporativo.

Criterios:
- `repo` funciona en ambos perfiles.
- `dev`, `gs`, `gc "msg"`, `doctor`, `cdnupload` existen solo tras `ciszu`.
- `fastfetch` usa `shared/fastfetch/config.jsonc`.

## 4. Consolas y desarrollo

CLI nativo Linux:

```bash
dev status
dev start network
dev start all
dev log muzic
dev stop all
```

Consolas PowerShell (requieren pwsh):

```bash
devcon
staffcon
customerscon
tui
```

Los wrappers están en `shared/scripts/linux/consoles.sh` y cargan
`shared/powershell/PlatformCompat.ps1`, que aporta en Linux:

- `Get-NetTCPConnection` (emulado con `ss`).
- `Join-Path` normalizado a `/`.
- `Start-Process` para URLs y parámetros de redirección.
- shims `explorer.exe` (xdg-open) y `powershell.exe` (pwsh) en `~/.local/bin`.

Validación:
- `devcon` abre el TUI y `status` lista los puertos 3000-3003.
- `staffcon` y `customerscon` abren y navegan; abrir carpetas usa xdg-open.
- Si un TUI falla por una API Windows concreta, anotar archivo/línea en el reporte;
  no reescribir la consola entera.

## 5. OpenCode en Linux

```bash
curl -fsSL https://opencode.ai/v2/install | bash
opencode --version
opencode debug paths
```

Salida esperada: `config` en `~/.config/opencode`, `data` en
`~/.local/share/opencode`, `db` en `~/.local/share/opencode/opencode.db`.

Sincronizar skills y comandos desde el repo:

```bash
mkdir -p ~/.config/opencode
cp -r "$CISZU_REPO/.opencode/skills" ~/.config/opencode/ 2>/dev/null || true
cp -r "$CISZU_REPO/.opencode/command" ~/.config/opencode/ 2>/dev/null || true
```

- `opencode auth login` para proveedores/modelos.
- El plugin de voz de Windows no tiene equivalente; no bloquear por eso.
- Servidor compartido: `opencode service status`; servidor explícito:
  `opencode --server http://127.0.0.1:7777`.
- Servidor de Windows por Tailscale: `opencode --server http://<ip-tailscale>:7777`
  (si exige auth, usar el túnel SSH o `opencode serve` local).

Sesiones (decisión por defecto): cada SO mantiene su DB local. Compartir sesiones
es **opcional**: montar E: (`ntfs3`) y apuntar `OPENCODE_DB` al `.db` de Windows,
o symlinkear `~/.local/share/opencode`. Riesgo: SQLite sobre NTFS y snapshots;
hacer backup antes y no usar ambos SO a la vez. Documentar la elección.

## 6. MuzicMania (Tauri) en Linux

```bash
cd "$CISZU_REPO"
bash projects/muzicmania/launcher/build-linux.sh
```

Esperado: `src-tauri/target/release/bundle/{deb,rpm,appimage}` con artefactos.

Instalar y probar:

```bash
sudo dnf install -y projects/muzicmania/launcher/src-tauri/target/release/bundle/rpm/*.rpm
muzicmania
chmod +x projects/muzicmania/launcher/src-tauri/target/release/bundle/appimage/*.AppImage
projects/muzicmania/launcher/src-tauri/target/release/bundle/appimage/*.AppImage
```

Pruebas: carga del juego, audio (codecs), teclado/ratón/mando, guardado local,
bandeja, cierre limpio, rendimiento vs Windows. Si falta H.264/AAC:

```bash
sudo dnf install -y gstreamer1-plugins-bad-freeworld gstreamer1-plugins-ugly
```

El launcher detecta `linux`/`x64` y no se bloquea por el manifiesto Windows.
El auto-update Linux queda pendiente hasta publicar releases en el manifiesto.

## 7. Repo y validaciones

```bash
cd "$CISZU_REPO"
pnpm install
pnpm doctor
pnpm shell:check
pnpm lint:all
pnpm typecheck
pnpm test
pnpm cdn:verify
```

`pnpm build:all` es opcional (tarda y consume CPU); ejecutarlo si se tocó código de
producción. Anotar warnings, no ocultarlos.

## 8. Windows ↔ Linux

- Tailscale: `sudo tailscale up`; comprobar `tailscale status`.
- Vault: los secretos siguen en `services/supabase/.env` (local, gitignored).
  `pwsh scripts/vault.ps1 crypt|verify|backup` funciona en ambos SO (age 1.3.2
  en Fedora); la identity se copia a `~/.ciszu/` (0600) la primera vez.
- MEGA/GitHub: clonar el repo y descargar los archivos grandes desde MEGA; no
  duplicar binarios en git.
- OpenCode server: ver §5; las sesiones no se comparten por defecto.
- Consolas: usan la misma base (`archives/`, DB) a través del repo.

## 9. Aceptación (todo debe pasar)

- [ ] `node`, `pnpm`, `rustc`, `pwsh`, `podman`, `lmms`, `fastfetch` responden.
- [ ] `ciszu` carga banner y comandos; `pnpm shell:check` OK.
- [ ] `dev start all` levanta 3000-3003; `dev status` los lista; `dev stop all` limpia.
- [ ] `devcon`, `staffcon`, `customerscon` abren con pwsh (o se documenta el fallo exacto).
- [ ] `opencode --version` y `opencode debug paths` OK; skills copiadas.
- [ ] `bash projects/muzicmania/launcher/build-linux.sh` genera deb/rpm/AppImage.
- [ ] El RPM instala y el juego abre; pruebas mínimas pasadas.
- [ ] `pnpm lint` y `pnpm test -- --run` sin fallos nuevos.
- [ ] Nada de secretos en git (`git status` limpio de `.env*`).

## 10. Archivos clave

| Ruta | Qué es |
| --- | --- |
| `shared/scripts/linux/fedora-setup.sh` | instalador idempotente |
| `shared/scripts/linux/preflight.sh` | reconocimiento de solo lectura (ejecutar primero) |
| `shared/shell/{zshrc,ciszu.zsh,aliases.sh,env.sh,install.sh}` | perfiles |
| `shared/powershell/{Microsoft.PowerShell_profile.ps1,CiszuNetwork.Profile.ps1,PlatformCompat.ps1}` | Windows + compat |
| `shared/scripts/linux/{dev.sh,consoles.sh,console-run.ps1}` | dev CLI y consolas |
| `shared/fastfetch/config.jsonc` | fastfetch |
| `projects/muzicmania/launcher/build-linux.sh` | build Tauri |
| `projects/ciszu/docs/documentation/LINUX_SYSTEM.md` | doc durable |
| `projects/ciszu/docs/documentation/APP_ALTERNATIVES_PLAN.md` | apps y alternativas |

## 11. Fallbacks

| Problema | Fallback |
| --- | --- |
| `pwsh` no instala | descargar tar.gz oficial de PowerShell y añadir a PATH |
| `Get-NetTCPConnection` falla | usar `ss -ltnp` o `dev status` |
| Consola TUI rompe por API Windows | usar `dev` CLI; anotar línea exacta |
| WebKitGTK sin códecs | RPM Fusion (`gstreamer1-plugins-bad-freeworld`) |
| RPM build falla | `sudo dnf install -y rpm-build`; revisar `tauri.linux.conf.json` |
| AppImage no abre | `--appimage-extract-and-run` o instalar fuse-libs |
| OpenCode server remoto no conecta | `ssh -L 7777:127.0.0.1:7777` vía Tailscale |
| Sesiones no aparecen | `opencode debug paths db`; decidir compartir `OPENCODE_DB` |
| Fuente de marca no aparece | copiar `shared/fonts/*` a `~/.local/share/fonts` + `fc-cache -f` |

## 12. Reporte final del agente

Al terminar, escribir un resumen con:

1. Comandos ejecutados y resultado (OK/FALLO).
2. Versiones instaladas.
3. Fallos exactos (archivo, línea, mensaje) y workaround aplicado.
4. Artefactos generados (rutas y tamaños).
5. Pendientes que requieren decisión humana.
6. Confirmación de que no se tocaron secretos, TODO.md ni se hizo push.

---

_Última revisión: 25 nov 2026. Relacionados: `LINUX_SYSTEM.md`,
`APP_ALTERNATIVES_PLAN.md`, `TOOLS_SYSTEM.md`, `WORKFLOW_SYSTEM.md`._
