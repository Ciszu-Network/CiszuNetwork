<#
.SYNOPSIS
Ciszu Network - Customers Console (TUI)
Consola interactiva para gestionar los clientes de la organizacion.

.DESCRIPTION
Menu navegable con flechas (up/down + Enter) para:
  - Resumen / supervisar clientes (activos, bajas, asunto y ubicacion).
  - Añadir un cliente (nombres, apellidos, asunto, telefono, correo, direccion).
  - Quitar un cliente (el ID se conserva y sus docs pasan a registro de baja).
  - Modificar / editar datos de un cliente.
  - Herramientas adicionales, manual de uso y creditos.

Seguridad:
  - Password global (DEVCON_PASSWORD del vault, ciszu001) al ingresar.
  - Sin cargos ni prioridad: con la password se puede operar.
  - Toda accion queda registrada en local-logs/customerscon-<fecha>.log.

.EXAMPLE
  .\test\website\debug\customerscon.ps1          # modo TUI interactivo
  .\test\website\debug\customerscon.ps1 -Demo    # imprime el resumen sin menus
#>

[CmdletBinding()]
param(
    [switch]$Demo,
    [switch]$SelfTest
)

$ErrorActionPreference = 'Stop'
# tools/consoles -> tools -> E:\Ciszu Network
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

# ---------- Paleta neon (truecolor ANSI, ASCII puro) ----------
$e = [char]27
$c_cyan   = "${e}[38;2;52;226;226m"
$c_pink   = "${e}[38;2;255;92;144m"
$c_purple = "${e}[38;2;173;69;255m"
$c_green  = "${e}[38;2;138;226;52m"
$c_yellow = "${e}[38;2;221;176;85m"
$c_red    = "${e}[38;2;255;80;80m"
$c_blue   = "${e}[38;2;59;130;246m"
$c_white  = "${e}[38;2;230;235;245m"
$c_gray   = "${e}[38;2;120;130;145m"
$c_reset  = "$e[0m"
# ---------- fin paleta ----------

$VERSION = '1.0.0'
$DATA_FILE = Join-Path $root 'archives\customers\data\customers.json'
$LOG_DIR = Join-Path $PSScriptRoot 'local-logs'
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

# ---------- Banner ----------
function Show-Banner {
    Write-Host "${c_cyan}══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host "                    [0;37;40m                                                                [0m
                    [0;37;40m      [0;34;40m▄▄▓▄[0;37;40m    [0;34;40m▄▓[0;94;44m▄[0;34;40m▄[0;37;40m         [0;34;40m▄▄▄▄[0;37;40m        [0;34;40m▄▄▄▄[0;37;40m               [0;34;40m▄[0;37;40m     [0m
                    [0;37;40m   [0;34;40m▄▓[0;94;44m·[0;34;40m█▀[0;90;40m░[0;37;40m [0;34;40m▀[0;37;40m  [0;34;40m▀▀███▓[0;37;40m     [0;34;40m▄▀▀▀▀█▓█[0;94;44m▄[0;34;40m▄▀▀▄[0;94;44m▄[0;34;40m█▓█▀▀▀▀▄[0;37;40m        [0;90;40m░░[0;37;40m [0;34;40m▐█▓▄[0;37;40m   [0m
                    [0;37;40m [0;34;40m▄▓█[0;94;44m■[0;34;40m▀[0;90;40m░[0;37;40m       [0;90;40m░░[0;34;40m███▌[0;37;40m   [0;34;40m▓▄▄[0;37;40m   [0;90;40m░[0;34;40m▀▓▀[0;37;40m    [0;34;40m▀▓▀[0;90;40m░[0;37;40m   [0;34;40m▄▄▓[0;37;40m    [0;34;40m▄▄█▀[0;37;40m   [0;34;40m█[0;94;44m▀[0;34;40m█▓▄[0;37;40m [0m
                    [0;34;40m▐███▌[0;90;40m░[0;37;40m         [0;90;40m░[0;34;40m▐██▌[0;37;40m  [0;90;40m░░[0;34;40m▀██▓▄[0;37;40m            [0;34;40m▄▓██▀[0;90;40m░░[0;37;40m  [0;34;40m█[0;94;44m░░[0;37;40m     [0;90;40m░[0;94;44m░░░░[0;34;40m▌[0m
                    [0;94;44m░░░░[0;34;40m▌[0;90;40m░░[0;37;40m         [0;90;40m░[0;94;44m░░[0;34;40m▌[0;37;40m    [0;90;40m░░[0;34;40m█[0;94;44m▀[0;34;40m█▓▄[0;37;40m        [0;34;40m▄▓█[0;94;44m▀[0;34;40m█[0;90;40m░░[0;37;40m    [0;94;44m▒▒[0;34;40m▌[0;37;40m     [0;90;40m░[0;34;40m▐[0;94;44m▒▒▒▒[0m
                    [0;34;40m▐[0;94;44m▒▒▒▒[0;90;40m░[0;37;40m      [0;94;40m▄[0;37;40m   [0;90;40m░[0;94;44m▒▒[0;37;40m  [0;94;40m▄▀[0;37;40m   [0;90;40m░[0;94;44m░░░░[0;34;40m▌[0;37;40m      [0;34;40m▐[0;94;44m░░░░[0;90;40m░[0;37;40m   [0;94;40m▀▄[0;37;40m [0;94;44m▓▓▓[0;94;40m▄[0;37;40m   [0;90;40m░░[0;94;44m▓▓▓▓[0;94;40m▌[0m
                    [0;37;40m [0;94;40m▀[0;94;44m▓▓▓▓[0;94;40m▄▄▄▄█▀[0;37;40m     [0;94;44m▓[0;94;40m▌[0;37;40m [0;94;40m▐[0;94;44m▓[0;94;40m▄[0;37;40m   [0;34;40m▄[0;94;44m▒▒▒[0;34;40m█[0;37;40m        [0;34;40m█[0;94;44m▒▒▒[0;34;40m▄[0;37;40m   [0;94;40m▄[0;94;44m▓[0;94;40m▌[0;37;40m [0;94;40m▀█[0;94;44m█[0;94;40m█▄▄▄▓[0;94;44m██[0;94;40m█▀[0;37;40m [0m
                    [0;37;40m   [0;94;40m▀▀▀▀▀▀[0;37;40m       [0;94;40m▀[0;37;40m    [0;94;40m▀█[0;94;44m▓▓▓▒▒[0;34;40m▀▀[0;37;40m          [0;34;40m▀▀[0;94;44m▒▒▓▓▓[0;94;40m█▀[0;37;40m     [0;94;40m▀▀▀▀▀▀▀[0;37;40m   [0m"
    Write-Host "[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█▐[0;90;44m▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█[0;37;40m    [0;90;40m█[0;90;44m▀▀[0;90;40m█[0;37;40m     [0;90;40m▄[0;90;44m▀▀▀▀▀▀▀[0;90;40m█▐[0;90;44m▀▀▀▀▀▀▀[0;90;40m█▐[0;90;44m▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀▀▀▀▀▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█▐[0;90;44m▀▀▀▀▀[0;90;40m▐[0;90;44m▀▀▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█▐[0;90;44m▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀▀▀▀▀▀▀[0;90;40m▄[0;37;40m      [0;90;40m▄[0;90;44m▀▀▀▀▀▀▀[0;90;40m█[0m
[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄▄▄▄[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m   [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m    [0;36;40m█[0;36;44m   ▄▄▄▄▄[0;36;40m▌█[0;36;44m▄▄▄[0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄▄▄▄[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌  ▄▄▄▄▄▄ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄[0;36;40m▐[0;36;44m▌ ▐[0;36;40m█[0;36;44m▄▄[0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄▄▄▄[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌  ▄▄▄▄▄[0;34;40m█[0;36;44m [0;36;40m█[0;37;40m    [0;36;40m█[0;36;44m   ▄▄▄▄▄[0;36;40m▌[0m
[0;37;40m  [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m         [0;96;40m█[0;96;44m  █[0;37;40m    [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m     [0;96;40m█[0;96;44m   ▀[0;96;40m▄[0;37;40m        [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m         [0;96;40m█[0;96;44m  ▐[0;96;40m▌[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m         [0;96;40m█[0;96;44m  ▐[0;96;40m▌▄[0;97;40m▄▄[0;96;44m▀ ▄[0;96;40m▀[0;37;40m    [0;96;40m█[0;96;44m   ▀[0;96;40m▄[0;37;40m    [0m
[0;37;40m [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m        [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m   [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m      [0;97;40m▀[0;97;44m▄   ▀[0;97;40m▄[0;37;40m     [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m        [0;97;40m▐[0;97;44m▌ ▐[0;97;40m█[0;37;40m   [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m  [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m  [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m  [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m  [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌█[0;97;44m▀▀[0;97;40m█[0;37;40m    [0;97;40m▐[0;97;44m▌ ▐[0;97;40m█[0;37;40m▐[0;96;44m▄[0;97;44m▄[0;34;40m██[0;97;47m▄[0;37;40m       [0;97;40m▀[0;97;44m▄   ▀[0;97;40m▄[0;37;40m  [0m
[0;37;40m [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m         [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m    [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m         [0;96;40m█[0;34;40m███[0;96;40m█[0;37;40m     [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m         [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m    [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m [0;96;40m▀▀▀[0;37;40m     [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m    [0;96;40m█[0;34;40m█[0;96;44m▐[0;96;40m▌[0;37;40m        [0;96;40m█[0;34;40m███[0;96;40m█[0;37;40m  [0m
[0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▀▀▀[0;36;40m█[0;37;40m   [0;36;40m▐[0;36;44m▌ ▀▀▀▀▀▀[0;34;40m█[0;36;44m ▐[0;36;40m▌[0;37;40m   [0;36;40m█[0;36;44m▀▀▀▀▀   ▄[0;36;40m▀[0;37;40m    [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m        [0;36;40m▐[0;36;44m▌ ▀▀▀▀▀▀[0;34;40m█[0;36;44m ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▀▀▀[0;36;40m█[0;37;40m   [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m   [0;36;40m▐[0;36;44m▌[0;34;40m█[0;36;44m▐[0;36;40m▌[0;37;40m  [0;36;40m█[0;36;44m▀▀▀▀▀   ▄[0;36;40m▀[0;37;40m  [0m
[0;90;40m█[0;90;44m▄▄[0;90;40m█▐[0;90;44m▄▄▄▄[0;90;40m▌[0;37;40m   [0;90;40m█[0;90;44m▄▄▄▄▄▄▄▄▄▄[0;90;40m█[0;37;40m   [0;90;40m▐[0;90;44m▄▄▄▄▄▄▄▄[0;90;40m▀[0;37;40m      [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m         [0;90;40m█[0;90;44m▄▄▄▄▄▄▄▄▄▄[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▄▄[0;90;40m█▐[0;90;44m▄▄▄▄[0;90;40m▌[0;37;40m   [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m    [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m  [0;90;40m▐[0;90;44m▄▄▄▄▄▄▄▄[0;90;40m▀[0;37;40m    [0m
[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█▐[0;90;44m▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀▀▀▀▀▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█▐[0;90;44m▀▀▀▀▀▀[0;90;40m█[0;37;40m     [0;90;40m▄[0;90;44m▀▀▀▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀▀▀▀▀▀▀▀▀[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▀▀[0;90;40m█[0;37;40m      [0;90;40m█[0;90;44m▀▀[0;90;40m█▐[0;90;44m▀▀▀▀[0;90;40m█[0m
[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄▄▄▄[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌  ▄▄▄▄▄▄ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄▄[0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m    [0;36;40m█[0;36;44m   ▄▄▄▄▄[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌  ▄▄▄▄▄▄ ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m     [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▄▄▄▄[0;36;40m▌[0m
[0;37;40m  [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m         [0;96;40m█[0;96;44m  ▐[0;96;40m▌[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m    [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m     [0;96;40m█[0;96;44m   ▀[0;96;40m▄[0;37;40m      [0;96;40m█[0;96;44m  ▐[0;96;40m▌[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m   [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m      [0;96;40m█[0;96;44m  [0;96;40m█[0;37;40m       [0m
[0;37;40m [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m        [0;97;40m▐[0;97;44m▌ ▐[0;97;40m█[0;37;40m   [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m  [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m   [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m      [0;97;40m▀[0;97;44m▄   ▀[0;97;40m▄[0;37;40m   [0;97;40m▐[0;97;44m▌ ▐[0;97;40m█[0;37;40m   [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m  [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌[0;37;40m     [0;97;40m▐[0;97;44m▌ ▐[0;97;40m▌█[0;97;44m▀▀[0;97;40m█[0;37;40m   [0m
[0;37;40m [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m         [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m    [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m    [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m         [0;96;40m█[0;34;40m███[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m    [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m   [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m      [0;96;40m█[0;34;40m██[0;96;40m█[0;37;40m [0;96;40m▀▀▀[0;37;40m    [0m
[0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▀▀▀[0;36;40m█[0;37;40m   [0;36;40m▐[0;36;44m▌ ▀▀▀▀▀▀[0;34;40m█[0;36;44m ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m   [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌[0;37;40m   [0;36;40m█[0;36;44m▀▀▀▀▀   ▄[0;36;40m▀[0;37;40m  [0;36;40m▐[0;36;44m▌ ▀▀▀▀▀▀[0;34;40m█[0;36;44m ▐[0;36;40m▌[0;37;40m  [0;36;40m▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▀▀▀[0;36;40m█▐[0;36;44m▌ ▐[0;36;40m▌█[0;36;44m▀▀▀[0;36;40m█[0;37;40m   [0m
[0;90;40m█[0;90;44m▄▄[0;90;40m█▐[0;90;44m▄▄▄▄[0;90;40m▌[0;37;40m   [0;90;40m█[0;90;44m▄▄▄▄▄▄▄▄▄▄[0;90;40m█[0;37;40m   [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m    [0;90;40m█[0;90;44m▄▄[0;90;40m█[0;37;40m   [0;90;40m▐[0;90;44m▄▄▄▄▄▄▄▄[0;90;40m▀[0;37;40m    [0;90;40m█[0;90;44m▄▄▄▄▄▄▄▄▄▄[0;90;40m█[0;37;40m   [0;90;44m█▄▄█[0;90;40m▐[0;90;44m▄▄▄▄[0;90;40m▌█[0;90;44m▄▄[0;90;40m█▐[0;90;44m▄▄▄▄[0;90;40m▌[0;37;40m   [0m"
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host "${c_cyan}   C U S T O M E R S C O N ${c_reset}${c_pink}:: Customers Console ::${c_reset} ${c_gray}Ciszu Network v$VERSION${c_reset}"
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host ""
}

function Show-MenuHeader([string]$Title) {
    Write-Host ""
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host "${c_blue}  $Title${c_reset}"
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host ""
}

function Press-Continue {
    Write-Host ""
    Write-Host "${c_gray}Pulsa una tecla para continuar...${c_reset}"
    $null = [System.Console]::ReadKey($true)
}

# ---------- Menu simple ----------
function Show-Menu {
    param([string]$Title, [object[]]$Options, [int]$InitIndex = 0)
    $i = [Math]::Max(0, [Math]::Min($InitIndex, $Options.Count - 1))
    while ($true) {
        Clear-Host
        Show-Banner
        Show-MenuHeader $Title
        Write-Host "${c_gray}(↑/↓ o numero para moverte, Enter para elegir, Q para volver)${c_reset}"
        Write-Host ""
        for ($n = 0; $n -lt $Options.Count; $n++) {
            $opt    = $Options[$n]
            $icon   = if ($opt.ic) { $opt.ic } else { '  ' }
            $label  = $opt.l
            $suffix = if ($opt.s) { '  ' + $opt.s } else { '' }
            $idx    = $n + 1
            if ($n -eq $i) {
                Write-Host "${c_yellow}▸ [${idx}] ${c_reset}${c_yellow}${icon}${c_reset}  ${c_yellow}${label}${c_reset}${c_yellow}${suffix}${c_reset}"
            } else {
                Write-Host "   [${idx}]  ${icon}  ${label}${suffix}"
            }
        }
        Write-Host ""
        $keyInfo = [System.Console]::ReadKey($true)
        $k = $keyInfo.Key
        if     ($k -eq [ConsoleKey]::UpArrow)   { if ($i -gt 0) { $i-- } }
        elseif ($k -eq [ConsoleKey]::DownArrow) { if ($i -lt $Options.Count - 1) { $i++ } }
        elseif ($k -eq [ConsoleKey]::Enter)     { return $i }
        elseif ($k -eq [ConsoleKey]::Escape)    { return -1 }
        elseif ($k -eq [ConsoleKey]::Q)         { return -1 }
        else {
            $ch = $keyInfo.KeyChar
            if ($ch -ge '1' -and $ch -le '9') {
                $n = [int][string]$ch - 1
                if ($n -lt $Options.Count) { $i = $n }
            }
            elseif ($ch -eq '0') { if ($Options.Count -gt 9) { $i = 9 } }
        }
    }
}

# ---------- Vault: password global (DEVCON_PASSWORD, ciszu001) ----------
function Read-VaultEnv([string]$Name) {
    $vault = Join-Path $root 'services\supabase\.env'
    if (-not (Test-Path -LiteralPath $vault)) { return $null }
    foreach ($line in Get-Content -LiteralPath $vault) {
        if ($line -match "^$Name\s*=\s*(.*)$") {
            return $matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return $null
}

function Test-CustomersconPassword {
    $expected = Read-VaultEnv 'DEVCON_PASSWORD'
    if ([string]::IsNullOrWhiteSpace($expected)) {
        Write-Host "${c_red}[SEGURIDAD] DEVCON_PASSWORD no configurado en el vault (services/supabase/.env).${c_reset}"
        return $false
    }
    $secure = Read-Host "Contraseña de acceso" -AsSecureString
    $plain = [System.Net.NetworkCredential]::new('', $secure).Password
    return ($plain -ceq $expected)
}

# ---------- Identidad + acceso (quién opera la consola) ----------
# Pide el ID de empresa (CZ-XXX) y valida el rango contra org.accesos.customerscon.
function Select-StaffIdentity {
    $staffFile = Join-Path $root 'archives\staff\data\staff.json'
    if (-not (Test-Path $staffFile)) { Write-Host "${c_red}No existe archives/staff/data/staff.json.${c_reset}"; return $null }
    $d = Get-Content -LiteralPath $staffFile -Raw | ConvertFrom-Json
    $emps = @($d.empleados | Where-Object { $_.estado -eq 'activo' })
    if ($emps.Count -eq 0) { Write-Host "${c_red}No hay empleados activos.${c_reset}"; return $null }
    $opts = @()
    foreach ($emp in $emps) {
        $role = $d.roles | Where-Object { $_.carpeta -eq $emp.cargo }
        $nivel = if ($role) { [int]$role.nivel } else { 99 }
        $opts += @{ ic = '👤'; l = "$($emp.id)  $($emp.nombres) $($emp.apellidos)"; s = "nivel $nivel - $($emp.cargo)"; nivel = $nivel; emp = $emp }
    }
    Write-Host ""
    Write-Host "${c_gray}Indica quién eres (ID de empresa). Según tu rango podrás acceder o no.${c_reset}"
    $sel = Show-Menu -Title "¿QUIÉN ERES? (identidad)" -Options $opts
    if ($sel -lt 0) { return $null }
    $nivel = $opts[$sel].nivel
    $max = [int]$d.org.accesos.customerscon
    if ($nivel -gt $max) {
        Write-Host "${c_red}Acceso DENEGADO: tu cargo (nivel $nivel) supera el máximo ($max) para CUSTOMERSCON.${c_reset}"
        Write-Host "${c_gray}Solicita acceso a un cargo con nivel $max o menor.${c_reset}"
        return $null
    }
    return $opts[$sel].emp.id
}

function Write-CustomersconLog([string]$Line) {
    $log = Join-Path $LOG_DIR ("customerscon-" + (Get-Date -Format 'yyyy-MM-dd') + '.log')
    Add-Content -LiteralPath $log -Value ("[" + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "] " + $Line)
}

# ---------- Datos ----------
function Get-CustomersData {
    return (Get-Content -LiteralPath $DATA_FILE -Raw | ConvertFrom-Json)
}

function Invoke-CustomersNode {
    param([string[]]$NodeArgs)
    Push-Location $root
    try {
        node @NodeArgs 2>&1 | Out-Host
        return $LASTEXITCODE
    } finally {
        Pop-Location
    }
}

# ---------- Selector ----------
function Show-PickCustomer([string]$Title) {
    $d = Get-CustomersData
    $custs = @($d.customers | Where-Object { $_.estado -eq 'activo' })
    $opts = @()
    foreach ($c in $custs) {
        $opts += @{ ic = '👤'; l = "$($c.id)  $($c.nombres) $($c.apellidos)"; s = "asunto: $($c.asunto)"; cust = $c }
    }
    if ($opts.Count -eq 0) { Write-Host "${c_yellow}No hay clientes activos para elegir.${c_reset}"; return $null }
    $sel = Show-Menu -Title $Title -Options $opts
    if ($sel -lt 0) { return $null }
    return $opts[$sel].cust.id
}

# ---------- Acciones ----------
function Show-Summary {
    $d = Get-CustomersData
    Clear-Host
    Show-Banner
    Show-MenuHeader "RESUMEN / SUPERVISAR CLIENTES"
    Write-Host "${c_cyan}Organizacion:${c_reset} ${c_white}$($d.org.nombre)${c_reset}"
    Write-Host "${c_cyan}Sede:${c_reset}         $($d.org.sede) ($($d.org.pais))"
    Write-Host ""
    $act = @($d.customers | Where-Object { $_.estado -eq 'activo' })
    $bajas = @($d.customers | Where-Object { $_.estado -eq 'inactivo' })
    Write-Host "${c_green}Clientes activos (${c_reset}$($act.Count)${c_green}):${c_reset}"
    foreach ($c in $act) {
        Write-Host ("   {0}  {1,-20} asunto: {2}" -f $c.id, "$($c.nombres) $($c.apellidos)", $c.asunto)
    }
    if ($bajas.Count -gt 0) {
        Write-Host ""
        Write-Host "${c_yellow}Historial de bajas (IDs conservados):${c_reset}"
        foreach ($c in $bajas) {
            $f = if ($c.registroBaja) { $c.registroBaja.fecha } else { '-' }
            Write-Host ("   {0}  {1,-20} baja: {2}" -f $c.id, "$($c.nombres) $($c.apellidos)", $f)
        }
    }
    Write-Host ""
    Write-Host "${c_gray}Ubicacion: archives/customers/ (docs globales + carpeta por cliente)${c_reset}"
    Write-Host "${c_gray}Fuente:    $DATA_FILE${c_reset}"
    Press-Continue
}

function Show-Add {
    Clear-Host
    Show-Banner
    Show-MenuHeader "AÑADIR CLIENTE"
    Write-Host "${c_gray}(Enter en campo = vacío)${c_reset}"
    $nombres = Read-Host "Nombres (obligatorio)"
    if ([string]::IsNullOrWhiteSpace($nombres)) { return }
    $apellidos = Read-Host "Apellidos (obligatorio)"
    if ([string]::IsNullOrWhiteSpace($apellidos)) { return }
    $asunto = Read-Host "Asunto / trabajo"
    $telefono = Read-Host "Telefono"
    $correo = Read-Host "Correo"
    $direccion = Read-Host "Direccion"
    $fecha = Read-Host "Fecha (AAAA-MM-DD, Enter = vacío)"

    $nodeArgs = @('scripts/customerscon.js', 'add', '--session', $script:custSession, '--actor', $script:custActor,
                  '--nombres', $nombres, '--apellidos', $apellidos)
    if ($asunto)    { $nodeArgs += @('--asunto', $asunto) }
    if ($telefono)  { $nodeArgs += @('--telefono', $telefono) }
    if ($correo)    { $nodeArgs += @('--correo', $correo) }
    if ($direccion) { $nodeArgs += @('--direccion', $direccion) }
    if ($fecha)     { $nodeArgs += @('--fecha', $fecha) }
    Write-Host ""
    Invoke-CustomersNode $nodeArgs
    Press-Continue
}

function Show-Remove {
    Clear-Host
    Show-Banner
    Show-MenuHeader "QUITAR CLIENTE"
    Write-Host "${c_gray}El ID se conserva y sus docs se convierten en registro de baja.${c_reset}"
    $custId = Show-PickCustomer "Elige el cliente a QUITAR"
    if (-not $custId) { return }
    $motivo = Read-Host "Motivo de la baja"
    if ([string]::IsNullOrWhiteSpace($motivo)) { $motivo = 'Baja no especificada' }
    Write-Host ""
    Invoke-CustomersNode @('scripts/customerscon.js', 'remove', '--session', $script:custSession, '--actor', $script:custActor, '--id', $custId, '--motivo', $motivo)
    Press-Continue
}

function Show-Modify {
    Clear-Host
    Show-Banner
    Show-MenuHeader "MODIFICAR / EDITAR CLIENTE"
    $custId = Show-PickCustomer "Elige el cliente a MODIFICAR"
    if (-not $custId) { return }
    $fields = @(
        @{ ic = '✏'; l = 'nombres' },
        @{ ic = '✏'; l = 'apellidos' },
        @{ ic = '📌'; l = 'asunto' },
        @{ ic = '📞'; l = 'telefono' },
        @{ ic = '✉'; l = 'correo' },
        @{ ic = '📍'; l = 'direccion' },
        @{ ic = '📅'; l = 'fecha' },
        @{ ic = '🔗'; l = 'redes' }
    )
    $sel = Show-Menu -Title "CAMPO a modificar de $custId" -Options $fields
    if ($sel -lt 0) { return }
    $campo = $fields[$sel].l
    $valor = Read-Host "Nuevo valor para '$campo' (Enter = vaciar)"
    if ($campo -eq 'redes' -and $valor) {
        Write-Host "${c_gray}Formato JSON: [{\"red\":\"Instagram\",\"url\":\"...\"}]${c_reset}"
        $valor = Read-Host "Redes (JSON)"
    }
    Write-Host ""
    Invoke-CustomersNode @('scripts/customerscon.js', 'modify', '--session', $script:custSession, '--actor', $script:custActor, '--id', $custId, '--campo', $campo, '--valor', $valor)
    Press-Continue
}

# ---------- Manual / herramientas / info ----------
function Show-Manual {
    Clear-Host
    Show-Banner
    Show-MenuHeader "MANUAL DE USO - CUSTOMERSCON"
    Write-Host "${c_white}Objetivo:${c_reset} crear y mantener la documentacion real de los clientes de`
Ciszu Network (archives/customers)."
    Write-Host ""
    Write-Host "${c_cyan}Estructura generada:${c_reset}"
    Write-Host "   archives/customers/docs/            -> 5 formatos (md/txt/csv/docx/pdf) globales"
    Write-Host "   archives/customers/<CLIENTE>/docs/  -> ficha del cliente (ID CL-XXX + asunto)"
    Write-Host "   archives/customers/<CLIENTE>/content/{images,videos,profile} -> contenido visual"
    Write-Host "   archives/customers/<CLIENTE>/asunto/ -> archivos del trabajo/encargo"
    Write-Host "   archives/customers/data/customers.json -> fuente de verdad"
    Write-Host ""
    Write-Host "${c_cyan}Quitar un cliente:${c_reset} el ID (CL-XXX) se conserva de forma permanente; la`
carpeta queda como REGISTRO DE BAJA (el .txt guarda el historial completo) y la`
documentacion global deja de listarlo como activo."
    Write-Host ""
    Write-Host "${c_cyan}Sin cargos ni prioridad:${c_reset} cualquier persona con la password puede operar.`
Todo queda registrado en el log de sesion."
    Write-Host ""
    Write-Host "${c_gray}Logs: $LOG_DIR\customerscon-<fecha>.log${c_reset}"
    Press-Continue
}

function Show-Tools {
    $opts = @(
        @{ ic = '📁'; l = "Abrir archives/customers en el explorador"; act = { Start-Process explorer.exe (Resolve-Path (Join-Path $root 'archives\customers')).Path; Press-Continue } },
        @{ ic = '📜'; l = "Ver el log de CUSTOMERSCON de hoy";        act = { $log = Join-Path $LOG_DIR ("customerscon-" + (Get-Date -Format 'yyyy-MM-dd') + '.log'); Clear-Host; if (Test-Path $log) { Get-Content $log -Tail 40 | Out-Host } else { Write-Host "${c_yellow}Sin log de hoy todavia.${c_reset}" }; Press-Continue } },
        @{ ic = '🗑'; l = "Limpiar logs de CUSTOMERSCON";             act = { Remove-Item "$LOG_DIR\customerscon-*.log" -Force -ErrorAction SilentlyContinue; Write-Host "${c_green}Logs limpiados.${c_reset}"; Press-Continue } },
        @{ ic = '🔄'; l = "Regenerar TODA la documentacion (customersgen)"; act = { Push-Location $root; node scripts/customersgen.js 2>&1 | Out-Host; Pop-Location; Press-Continue } },
        @{ ic = '🔍'; l = "Ver el JSON fuente (customers.json)";      act = { Clear-Host; Get-Content $DATA_FILE | Out-Host; Press-Continue } }
    )
    $sel = Show-Menu -Title "HERRAMIENTAS ADICIONALES" -Options $opts
    if ($sel -ge 0) { & $opts[$sel].act }
}

function Show-Info {
    Clear-Host
    Show-Banner
    Show-MenuHeader "INFORMACIÓN / CRÉDITOS"
    Write-Host "${c_pink}CISZU NETWORK${c_reset} ${c_gray}- ecosistema digital de Ciszuko Antony.${c_reset}"
    Write-Host "${c_gray}Consola:       Customers Console (CUSTOMERSCON)${c_reset}"
    Write-Host "${c_gray}Version:       $VERSION${c_reset}"
    Write-Host "${c_gray}Carpeta:       test/website/debug/customerscon.ps1${c_reset}"
    Write-Host "${c_gray}Motor:         scripts/customerscon.js + scripts/customersgen.js${c_reset}"
    Write-Host "${c_gray}Datos:         archives/customers/data/customers.json${c_reset}"
    Write-Host "${c_gray}Creado:        ago 2026${c_reset}"
    Write-Host ""
    Write-Host "${c_gray}Documentacion: CUSTOMERS_SYSTEM.md${c_reset}"
    Press-Continue
}

# ---------- Modo Demo ----------
if ($Demo.IsPresent) {
    $d = Get-CustomersData
    Clear-Host
    Show-Banner
    Show-MenuHeader "DEMO - RESUMEN DE CLIENTES"
    Write-Host "Clientes: $($d.customers.Count) (activos: $(@($d.customers | Where-Object { $_.estado -eq 'activo' }).Count))"
    foreach ($c in $d.customers) {
        Write-Host ("  {0}  {1}  asunto: {2}" -f $c.id, "$($c.nombres) $($c.apellidos)", $c.asunto)
    }
    Write-Host ""
    Write-Host "${c_gray}(modo demo: sin menu interactivo)${c_reset}"
    exit 0
}

# ---------- Modo SelfTest ----------
if ($SelfTest.IsPresent) {
    $failures = @()
    if ($VERSION -ne '1.0.0') { $failures += 'Version' }
    if (-not (Test-Path $DATA_FILE)) { $failures += "data file: $DATA_FILE" }
    else {
        $d = Get-CustomersData
        if (@($d.customers | Where-Object { $_.estado -eq 'activo' }).Count -lt 1) { $failures += 'sin clientes activos' }
    }
    if ($failures.Count -gt 0) {
        Write-Host "${c_red}SELF-TEST FALLIDO:${c_reset}" | Out-Host
        $failures | ForEach-Object { Write-Host "  - $_" } | Out-Host
        exit 1
    }
    Write-Host "${c_green}SELF-TEST OK (v$VERSION)${c_reset}" | Out-Host
    exit 0
}

# ---------- Login de acceso (seguridad) ----------
Clear-Host
Show-Banner
Write-Host "${c_cyan}══════════════════════  CUSTOMERSCON - ACCESO RESTRINGIDO  ══════════════════════${c_reset}"
if (-not (Test-CustomersconPassword)) {
    Write-Host "${c_red}[SEGURIDAD] Contraseña incorrecta. Cerrando la consola.${c_reset}"
    Start-Sleep -Milliseconds 900
    exit 1
}
$script:custSession = 'customerscon-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString().Substring(0, 8))
# Identidad: quién opera la consola (ID de empresa). Según su rango podrá acceder o no.
Clear-Host
Show-Banner
Write-Host "${c_green}Password OK. Indica quién eres.${c_reset}"
$script:custActor = Select-StaffIdentity
if (-not $script:custActor) {
    Write-Host "${c_red}[SEGURIDAD] Identidad no válida o sin acceso. Cerrando la consola.${c_reset}"
    Start-Sleep -Milliseconds 900
    exit 1
}
Write-CustomersconLog "session=$script:custSession actor=$script:custActor accion=login"
Clear-Host

# ---------- Menu principal ----------
$script:quitRequested = $false
while (-not $script:quitRequested) {
    $menuItems = @(
        @{ ic = '📊'; l = "Resumen / supervisar clientes";   key = '__summary' },
        @{ ic = '➕'; l = "Añadir cliente";                   key = '__add' },
        @{ ic = '➖'; l = "Quitar cliente";                   key = '__remove' },
        @{ ic = '✏'; l = "Modificar / editar cliente";       key = '__modify' },
        @{ ic = '🧰'; l = "Herramientas adicionales";        key = '__tools' },
        @{ ic = '❓'; l = "Manual de uso";                   key = '__manual' },
        @{ ic = 'ℹ'; l = "Información / Créditos";          key = '__info' },
        @{ ic = '🚪'; l = "Salir (Ctrl+C)";                  key = '__quit' }
    )

    Clear-Host
    Show-Banner
    Show-MenuHeader "CUSTOMERS CONSOLE - MENÚ PRINCIPAL"
    Write-Host "${c_gray}sesión: $($script:custSession) · operador: $script:custActor${c_reset}"
    Write-Host ""
    for ($n = 0; $n -lt $menuItems.Count; $n++) {
        $ic = if ($menuItems[$n].ic) { $menuItems[$n].ic } else { '  ' }
        Write-Host ("   [{0}]  {1}  {2}" -f ($n + 1), $ic, $menuItems[$n].l)
    }
    Write-Host ""
    Write-Host "${c_gray}(elige un número o navega con ↑/↓ y Enter; Q para salir)${c_reset}"

    $sel = Show-Menu -Title "CUSTOMERS CONSOLE - MENÚ PRINCIPAL" -Options $menuItems
    if ($sel -lt 0) { $script:quitRequested = $true; continue }
    $key = $menuItems[$sel].key
    switch ($key) {
        '__summary'   { Show-Summary }
        '__add'       { Show-Add }
        '__remove'    { Show-Remove }
        '__modify'    { Show-Modify }
        '__tools'     { Show-Tools }
        '__manual'    { Show-Manual }
        '__info'      { Show-Info }
        '__quit'      { Write-CustomersconLog "session=$script:custSession actor=$script:custActor accion=logout"; $script:quitRequested = $true }
    }
}

Clear-Host
Write-Host "${c_green}Customers Console finalizada. Documentacion actualizada en archives/customers.${c_reset} ${c_pink}:: CISZU NETWORK ::${c_reset}"
Write-Host "${c_cyan}════════════════════════════════════════════════════════════════════════${c_reset}"
