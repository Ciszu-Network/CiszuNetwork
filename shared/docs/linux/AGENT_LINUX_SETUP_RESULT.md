# AGENT_LINUX_SETUP_RESULT — Fedora 45 (Ciszu Network)

Versión: 1.0.0
Fecha: 2026-11-25
Identificador: AGENT_LINUX_SETUP_RESULT_V1.0.0_2026_11_25_ciszunetwork
Runbook aplicado: `shared/docs/linux/AGENT_LINUX_SETUP_REPORT.md`

> Resultado real de la ejecución del runbook en Fedora 45 KDE. Cada apartado
> indica OK, desviación o pendiente humano. No se commitearon ni pushearon
> cambios; no se tocó `TODO.md`; ningún secreto se escribió en el repo.

## 1. Reconocimiento

| Área | Estado encontrado |
| --- | --- |
| Distro | Fedora Linux 45 (KDE Plasma Desktop) |
| Kernel / sesión | `uname -r` del sistema; Secure Boot activo |
| SELinux | Enforcing (no se desactivó) |
| Discos | ESP 200 MB compartido, `/boot` 2 GB, `/` btrfs 38,54 GB |
| Libre inicial | 13 GB en `/`; quedan ~4 GB tras toolchain, node_modules, VS Code y artefactos de MuzicMania |
| Node | v22.23.1 del sistema (insuficiente; el repo exige >= 24) |
| pnpm / Rust / pwsh | ausentes |
| Podman / Docker | Podman 6.2.0; Docker ausente (alias `docker` vía `podman-docker`) |
| OpenCode | v2.4.1, sin skills globales al inicio |
| Repo en NTFS | `E:` montado en `/mnt/CiscoData2`; raíz con ACL de solo lectura |
| Windows OpenCode | 34 skills, `cli.json` con tema `mercury` y plugin de voz, `auth.json` con 7 proveedores, sin MCP |

## 2. Repositorio

- Clonado `https://github.com/Ciszu-Network/CiszuNetwork` en `~/Ciszu Network`
  (el runbook prefiere `$HOME`; el NTFS no permite escribir en la raíz).
- `HEAD` = `7d961da5` (mismo commit que `origin/main`).
- Se copiaron desde el working tree de Windows:
  - 20 archivos con cambios reales (no solo CRLF).
  - 23 archivos nuevos de Linux (shell, scripts, docs, fastfetch, kitty).
  - `tools/` completo (114 MB, gitignored) y `.opencode/skills` (34 skills, 11 MB).
  - `scripts/`, `test/`, `deploy/` y `archives/` (gitignored; necesarios para
    CDN, consolas, despliegues y datos de staff).
  - `.env.local` raíz, `.env.local` por app (ciszu, ciszubot, ciszukoantony,
    muzicmania), `.env` del bot de Discord y `services/supabase/.env` (0600).
  - `opencode.json` raíz (gitignored; agente `strict-coder`).
- Se normalizaron CRLF a LF en los archivos copiados.
- No se copió `clones/` (2,6 GB de fuentes de skills ya instaladas) ni la DB de
  sesiones de Windows (6,4 GB); ver §9.
- `git status` contiene solo los cambios esperados; no se hizo commit ni push.

## 3. Toolchain

| Herramienta | Resultado |
| --- | --- |
| Node | v24.22.3 vía fnm (+ bloque en `shared/shell/env.sh`) |
| pnpm | 12.16.1 vía corepack |
| Rust / Cargo | 1.100.0 |
| PowerShell | 7.7.0 (tar.gz oficial; el repo Microsoft de Fedora 45 no publica `powershell`) |
| Podman | 6.2.0; storage local regenerado (la DB apuntaba a `/home/ciszukoantony`) |
| LMMS | 1.2.2 |
| Fastfetch | 2.68.1 |
| kitty | 0.48.2 + `shared/kitty/kitty.conf` |
| gh | 2.104.0 (sin auth válida; el token de Windows devolvió 401) |
| Tailscale | 1.104.7, `tailscaled` activo, sesión sin autenticar |
| VS Code | 1.148.0 instalado; settings/keybindings/snippets/`mcp.json` sincronizados desde Windows (extensiones de Windows no instaladas; quedan para el login de Settings Sync) |

## 4. Shell y perfiles

- `~/.zshrc` enlazado a `shared/shell/zshrc`; zsh es el shell por defecto.
- Perfil personal: fastfetch + prompt; perfil corporativo: `ciszu`.
- `ciszu-ai` se define **solo** en `shared/shell/ciszu.zsh` y el script exige
  `CISZU_PROFILE=1`. Prueba: antes de `ciszu` no existe; después sí.
- `pnpm shell:check` → `Paridad OK: 36 comandos compartidos`.
- Fuentes de marca copiadas a `~/.local/share/fonts` + JetBrains Mono.

## 5. OpenCode

- `bash shared/opencode/install.sh`:
  - `~/.config/opencode/skills` → `.opencode/skills` (34 skills, recarga en caliente).
  - `~/.agents/skills` → mismas skills.
  - `~/.config/opencode/opencode.json` → config global del repo.
  - `~/.config/opencode/cli.json` generado desde la plantilla, con la ruta Linux
    del plugin de voz (`tools/tts-stt-ai`). El plugin importa correctamente con Node 24
  y la TUI hizo `plugin reconciliation completed` con 14 plugins, sin errores.
- `auth.json` de Windows copiado a `~/.local/share/opencode/auth.json` (0600):
  proveedores `deepseek, google, opencode, opencode-go, openrouter, tokenrouter, zenmux`.
- `GEMINI_API_KEY` sincronizada desde el entorno de Windows a
  `~/.config/ciszu/secrets.env` (0600), cargada por `shared/shell/env.sh`.
- **MCP**: OpenCode en Windows y Linux no tiene MCP configurados
  (`opencode mcp list` → `No MCP servers configured`). Los 11 MCP de VS Code
  (markitdown, GitHub, Chrome DevTools, Playwright, Notion, Supabase, Figma,
  Stripe, MongoDB, Next DevTools, Hugging Face) no son config de OpenCode;
  quedan documentados como opt-in en `shared/opencode/README.md`.

## 6. Ciszu-AI (servidor único 7777)

Implementado `shared/scripts/linux/ciszu-ai.sh` y la función `ciszu-ai` del
perfil corporativo:

```bash
ciszu
ciszu-ai            # server + TUI
ciszu-ai server     # solo server
ciszu-ai status
ciszu-ai reset
ciszu-ai stop
ciszu-ai pair
```

- Contraseña: misma que Windows (`OPENCODE_PASSWORD` extraída del entorno del
  usuario; guardada en `~/.config/ciszu-ai/password`, 0600).
- Prueba aislada en puerto 7799: server OK, `/api/info` 200 con Basic auth,
  `pair` generó enlaces Wi-Fi/LAN y loopback, `stop` cerró el puerto.
- Logs en `.opencode/temp/opencode-server{,-err}.log`; bind en
  `~/.local/state/ciszu-ai/server-hostname.txt`.

## 7. Validaciones del repo

| Comando | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | OK (1458 paquetes, 42 descargados, 19m 22,9s) |
| `pnpm doctor` | OK; solo aviso de working tree con 33 archivos sin commit |
| `pnpm shell:check` | OK (36 comandos) |
| `pnpm lint` | OK (script raíz del repo) |
| `pnpm lint:all` | OK: 9/9 tareas (eslint + tsc) en 29,6 s |
| `pnpm test -- --run` | OK: 40 archivos, 414 tests, 14,05 s |
| `pnpm cdn:verify` | OK: 7.577 objetos del bucket `ciszu-cdn`, todos los mimetypes coinciden |
| `dev start all` / `dev status` / `dev stop all` | OK; 3000–3003 respondieron 200 con las `.env.local` por app |
| `bash projects/muzicmania/launcher/build-linux.sh` | OK: `.deb` 11,26 MiB, `.rpm` 11,27 MiB, `.AppImage` 119,19 MiB |
| Instalar RPM | OK: `muzic-mania-2.4.2-1.x86_64`, binario `/usr/bin/muzicmania` |
| Abrir RPM + AppImage | OK: ambos arrancan; solo warning deprecado de `libayatana-appindicator`. Audio, mando y guardado requieren prueba interactiva humana |

Artefactos:

```text
projects/muzicmania/launcher/src-tauri/target/release/bundle/deb/MuzicMania_2.4.2_amd64.deb       (11,26 MiB)
projects/muzicmania/launcher/src-tauri/target/release/bundle/rpm/MuzicMania-2.4.2-1.x86_64.rpm   (11,27 MiB)
projects/muzicmania/launcher/src-tauri/target/release/bundle/appimage/MuzicMania_2.4.2_amd64.AppImage (119,19 MiB)
```

## 8. Correcciones aplicadas al soporte Linux

1. `shared/scripts/linux/console-run.ps1`: splatting de `$null` agregaba un
   argumento `$null`; ahora solo splatea si hay argumentos.
2. `tools/consoles/console-guard.ps1`: buscaba `tsx.cmd` también en Linux; ahora
   usa `tsx` sin extensión fuera de Windows.
3. `shared/shell/env.sh`: inicializa fnm/Node 24 y carga
   `~/.config/ciszu/secrets.env` sin meter secretos al repo.
4. Podman: storage local antiguo respaldado; se regeneró la DB con la ruta actual.
5. PowerShell: fallback al tar.gz oficial tras fallar el repo de Microsoft.
6. `shared/opencode/`: instalador reproducible de skills/config/plugin de voz.

## 9. Pendientes que requieren decisión humana

- `gh auth login` (el token de Windows caducó).
- `sudo tailscale up` (Tailscale instalado y activo, sin autenticar).
- VS Code: extensiones de Windows no instaladas; usar Settings Sync o `code --install-extension`.
- Voz: instalar `whisper-cpp`, `piper`, `sox` y modelos locales si se quiere STT/TTS.
- Migrar la DB de sesiones de Windows (6,4 GB) o mantener DB local por SO.
- `clones/` (2,6 GB de fuentes de skills) no se copió; las 34 skills ya están instaladas.
- Rotar `OPENCODE_PASSWORD` si se sospecha exposición (la actual se sincronizó con Windows).
- Instalar el RPM de MuzicMania y probar audio/ventana/bandeja.
- Códecs H.264/AAC completos: evaluar RPM Fusion si el juego o WebKit lo requieren.

## 10. Actualización — segunda sesión (2026-11-25)

### 10.1 Repositorio movido a CiscoData2

- El repo vive ahora en `/mnt/CiscoData2/Ciszu Network` (NTFS, 71 GB libres).
- `~/Ciszu Network` es solo un symlink al repo real; el disco del sistema quedó
  libre de `node_modules`, `.git`, `target` y artefactos.
- Se reinstalaron las 1458 dependencias sobre NTFS con `package-import-method=copy`.
- `pnpm build:all`: 5/5 tareas OK en 8m 13s. Next.js compiló las 4 webs y las
  rutas nuevas `/api/download/linux` y `/download`. Aviso no bloqueante:
  `ciszubot#build` no declara outputs en `turbo.json`.
- `pnpm test -- --run` sobre NTFS: 40 archivos, 414 tests, 27,15 s.

### 10.2 KDE

- Dolphin: `~/.local/share/user-places.xbel` apuntaba a `/home/ciszukoantony`;
  se corrigieron los 7 bookmarks a `/home/ciszuko`. XML validado con `xmllint`.
- También se corrigieron rutas antiguas en `ktrashrc`, `krdpserverrc`,
  `akonadi/akonadiserverrc`, `vlc-qt-interface.conf`, `knewstuff3` y el
  `pkcs11.txt` de Firefox. Akonadi arranca y responde.
- System Settings y plasmashell crasheaban en `libUnion`/`UnionWidgetsStyle`
  (`widgetStyle=Union`). Se cambió `[General]` y `[KDE] widgetStyle` a `Breeze`,
  se reinició `plasma-plasmashell` y se probaron 4 KCM sin nuevos coredumps.

### 10.3 Kitty

- Barra de pestañas siempre visible arriba, estilo powerline, colores de marca.
- Atajos: `Ctrl+Shift+T` nueva pestaña, `Ctrl+Shift+W` cerrar, `Ctrl+Tab` /
  `Ctrl+Shift+Tab`, `Ctrl+Shift+1..9` ir a pestaña.

### 10.4 MuzicMania downloads

- Estructura nueva y aplicada en `website/public/downloads` y
  `launcher/downloads`: `windows/x64/<version>/<channel>/` y
  `linux/x64/<version>/<channel>/`.
- Se migraron los instaladores Windows existentes y se publicaron AppImage, DEB
  y RPM de Linux para `2.4.2/beta`, con `registry.json`, `latest.json` y
  `releases-manifest.json` actualizados.
- `build-installer.ps1` y `build-linux.sh` ya generan esa estructura.
- El manifiesto se regeneró sin firma; firmar en Windows antes de publicar.
- `muzic-mania` fue desinstalado para que la instalación la pruebe Ciszuko.

### 10.5 Cuentas

- `gh auth` ya está autenticado en Linux.
- Tailscale autenticado (`ciszupc`, 100.100.170.102).

### 10.6 Banner ASCII

- Copiados los 4 temas ANSI originales de PowerShell a
  `shared/powershell/banners/`: `logo`, `rainbow`, `pastel`, `darksky`.
- `ciszu` en Linux carga el mismo archivo exacto que PowerShell
  (`CISZU_BANNER_FILE` o `CISZU_BANNER_THEME`, logo por defecto).
- Verificado byte a byte: el arte `logo` y `rainbow` aparece completo en la
  salida de `ciszu`.
- `CISZU_PROFILE_BANNER=0` sigue desactivando cabecera y arte.

## 11. Confirmaciones

- Ningún secreto se escribió en el repo ni en este informe. La contraseña de
  OpenCode y la API key de Gemini viven en `~/.config/` con permisos 0600.
- No se editó `TODO.md`.
- No se hizo commit, push ni force-push.
- El repo de Windows permaneció intacto (solo lectura); todo el trabajo se hizo
  en el repo Linux (hoy `/mnt/CiscoData2/Ciszu Network`).

## 12. Segunda pasada (25 nov 2026)

- **Ruta única**: el repo es `E:\Ciszu Network` = `/mnt/CiscoData2/Ciszu Network`;
  el árbol duplicado se eliminó y el data dir de OpenCode (~6,6 GB) quedó dentro
  de `.opencode/data`, accesible desde el junction de Windows. Los perfiles
  PowerShell apuntan a esa ruta y el perfil PS 5.1 (`oc`, OSINT) se corrigió.
- **Shell**: `dev` (función) tapaba al CLI y `devall` llamaba a un placeholder;
  ahora delega en `shared/scripts/linux/dev.sh`. `dev`, `devcon`, `staffcon`,
  `customerscon` y `tui` resuelven el repo por `readlink -f` aunque se invoquen
  desde `~/.local/bin`; `console-run.ps1` traduce argumentos `-Nombre valor`.
- **Vault**: `scripts/vault.ps1` es multiplataforma (`age` 1.3.2 en Fedora);
  `.env.age` regenerado y verificado, bundle `vault-2026-11-25.env.age` con los 7
  `.env` (incluido `.env.local` y `services/supabase/.env`).
- **Toolchain**: instalados `age` y `postgresql` 18.3 (`pg_dump`); `preflight.sh`
  cuenta bien las skills enlazadas (`find -L`, 34).
- **Docs**: `STATUS_SYSTEM`/`PROJECTS_SYSTEM` actualizados; referencias
  `WORKFLOW_SYSTEM`/`PROJECT_STATE`/`PROJECT_HISTORY` corregidas a
  `GLOBAL_SYSTEM`/`PROJECTS_SYSTEM`.
