# osint — Herramientas OSINT oficiales (Ciszu Network)

Conjunto de wrappers oficiales para intensificación de inteligencia de código
abierto (OSINT) del ecosistema. Cada wrapper es un script PowerShell
desacoplado: usable desde PowerShell, opencode (a través de los comandos
`.opencode/command/osint*.md`) o CI. Los binarios base son CLIs de Python ya
instalados (`sherlock.exe`, `maigret.exe` en `Python314\Scripts`).

> **Política**: `test/` es para pruebas rápidas; la salida **oficial** de estas
> herramientas va a `tools/osint/output/<herramienta>/`. `test/osint/` está
> gitignored (los reportes pueden contener datos personales de terceros).

## Estructura

| Script | Herramienta | Qué hace | Salida |
|---|---|---|---|
| `maigret.ps1` | Maigret v0.6.4 | Username → URLs de perfiles + datos extraídos (recursión) | `output/maigret/` (oficial) · `test/osint/maigret/` (`-Test`) |
| `sherlock.ps1` | Sherlock v0.16.0 | Username → presencia en ~400 redes sociales (CSV) | `output/sherlock/` (oficial) · `test/osint/sherlock/` (`-Test`) |
| `simplelogin.ps1` | SimpleLogin API | Gestión de alias de email temporales (anti-spam/privacidad) | salida por consola |
| `spiderfoot.ps1` | SpiderFoot v4 | Framework integral: correos, teléfonos, dominios, IPs (200+ módulos, MIT) | `output/spiderfoot/` (oficial) · `test/osint/spiderfoot/` (`-Test`) |
| `osint.ps1` | dispatcher | Punto de entrada único para las cuatro | — |

## Uso rápido

```powershell
# Dispatcher único
.\tools\osint\osint.ps1 maigret -Usernames iconage,DRAWDRAW
.\tools\osint\osint.ps1 sherlock -Usernames iconage -Preset quick -Test
.\tools\osint\osint.ps1 simplelogin info
.\tools\osint\osint.ps1 spiderfoot -Targets ejemplo@correo.com

# Individuales (mismos presets que opencode)
.\tools\osint\maigret.ps1 -Usernames foo,bar            # full: --graph --tags social,tech --csv --json ndjson --html
.\tools\osint\maigret.ps1 -Usernames foo -Preset quick  # solo CSV

.\tools\osint\sherlock.ps1 -Usernames foo,.bar-        # full: --csv --timeout 30
.\tools\osint\sherlock.ps1 -Usernames foo -Preset quick # --csv --timeout 15

.\tools\osint\simplelogin.ps1 info                     # validar API key + cuenta
.\tools\osint\simplelogin.ps1 aliases                  # listar alias
.\tools\osint\simplelogin.ps1 options                  # dominios disponibles
.\tools\osint\simplelogin.ps1 create <prefijo>         # crear alias custom
.\tools\osint\simplelogin.ps1 random                   # crear alias aleatorio

.\tools\osint\spiderfoot.ps1 -Targets foo@example.com  # full: -u passive (modulos sin API key)
.\tools\osint\spiderfoot.ps1 -Targets foo -Preset quick -Test
```

> **SpiderFoot**: aún no instalado. Para instalarlo pedir aprobación (AGENTS §7.1):
> `git clone https://github.com/smicallef/spiderfoot "$env:USERPROFILE\spiderfoot"` y
> `cd "$env:USERPROFILE\spiderfoot"; pip install -r requirements.txt`. El wrapper detecta
> el clon en `~\spiderfoot\sf.py`.

## Atajos PowerShell (perfil)

| Función | Equivale a |
|---|---|
| `osint-mai` | `osint.ps1 maigret` |
| `osint-sher` | `osint.ps1 sherlock` |
| `osint-slo` | `osint.ps1 simplelogin` |
| `osint-sfx` | `osint.ps1 spiderfoot` |

## Seguridad

- `simplelogin.ps1` lee `SIMPLELOGIN_API_KEY` del vault (`services/supabase/.env`);
  nunca la imprime. Si no está presente, falla pidiendo `vault crypt`.
- Los reportes de maigret/sherlock pueden contener datos personales: NO
  commitear a git. `test/osint/` y `tools/osint/output/` están gitignored.
- Todo caso de uso cumple `CIBERSECURITY_SYSTEM.md` y `OSINT_PROTOCOLS.md`
  (uso legal, verificación externa, rotación de credenciales).