<#
.SYNOPSIS
Ciszu Network - Staff Console (TUI)
Consola interactiva para gestionar los empleados de la organizacion.

.DESCRIPTION
Menu navegable con flechas (up/down + Enter) para:
  - Ver un resumen de empleados, rangos e informacion y ubicacion exacta.
  - Añadir un empleado (nombres, apellidos, telefono, correo, direccion,
    ID automatico, redes, cargo y supervisor).
  - Quitar un empleado (el ID se conserva, los docs se re-editan como baja).
  - Cambiar el rango (cargo) de un empleado.
  - Modificar datos de un empleado (cualquier campo excepto el rango).
  - Manual de uso, herramientas y creditos.

Seguridad:
  - Password global (DEVCON_PASSWORD del vault, ciszu001) al ingresar.
  - Identidad por ID de empresa (CZ-XXX). Solo CEO, Supervisor y Gerente
    pueden añadir; los permisos y la jerarquia los valida scripts/staffcon.js.
  - Toda accion queda registrada en local-logs/staffcon-<fecha>.log.

.EXAMPLE
  .\test\website\debug\staffcon.ps1          # modo TUI interactivo
  .\test\website\debug\staffcon.ps1 -Demo    # imprime el resumen sin menus
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
$DATA_FILE = Join-Path $root 'archives\staff\data\staff.json'
$LOG_DIR = Join-Path $PSScriptRoot 'local-logs'
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

# ---------- Banner ----------

function Show-MenuHeader([string]$Title) {
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host "                    [0;37;40m                                                                [0m
                        [0;37;40m      [0;34;40m▄▄▓▄[0;37;40m    [0;34;40m▄▓[0;94;44m▄[0;34;40m▄[0;37;40m         [0;34;40m▄▄▄▄[0;37;40m        [0;34;40m▄▄▄▄[0;37;40m               [0;34;40m▄[0;37;40m     [0m
                        [0;37;40m   [0;34;40m▄▓[0;94;44m·[0;34;40m█▀[0;90;40m░[0;37;40m [0;34;40m▀[0;37;40m  [0;34;40m▀▀███▓[0;37;40m     [0;34;40m▄▀▀▀▀█▓█[0;94;44m▄[0;34;40m▄▀▀▄[0;94;44m▄[0;34;40m█▓█▀▀▀▀▄[0;37;40m        [0;90;40m░░[0;37;40m [0;34;40m▐█▓▄[0;37;40m   [0m
                        [0;37;40m [0;34;40m▄▓█[0;94;44m■[0;34;40m▀[0;90;40m░[0;37;40m       [0;90;40m░░[0;34;40m███▌[0;37;40m   [0;34;40m▓▄▄[0;37;40m   [0;90;40m░[0;34;40m▀▓▀[0;37;40m    [0;34;40m▀▓▀[0;90;40m░[0;37;40m   [0;34;40m▄▄▓[0;37;40m    [0;34;40m▄▄█▀[0;37;40m   [0;34;40m█[0;94;44m▀[0;34;40m█▓▄[0;37;40m [0m
                        [0;34;40m▐███▌[0;90;40m░[0;37;40m         [0;90;40m░[0;34;40m▐██▌[0;37;40m  [0;90;40m░░[0;34;40m▀██▓▄[0;37;40m            [0;34;40m▄▓██▀[0;90;40m░░[0;37;40m  [0;34;40m█[0;94;44m░░[0;37;40m     [0;90;40m░[0;94;44m░░░░[0;34;40m▌[0m
                        [0;94;44m░░░░[0;34;40m▌[0;90;40m░░[0;37;40m         [0;90;40m░[0;94;44m░░[0;34;40m▌[0;37;40m    [0;90;40m░░[0;34;40m█[0;94;44m▀[0;34;40m█▓▄[0;37;40m        [0;34;40m▄▓█[0;94;44m▀[0;34;40m█[0;90;40m░░[0;37;40m    [0;94;44m▒▒[0;34;40m▌[0;37;40m     [0;90;40m░[0;34;40m▐[0;94;44m▒▒▒▒[0m
                        [0;34;40m▐[0;94;44m▒▒▒▒[0;90;40m░[0;37;40m      [0;94;40m▄[0;37;40m   [0;90;40m░[0;94;44m▒▒[0;37;40m  [0;94;40m▄▀[0;37;40m   [0;90;40m░[0;94;44m░░░░[0;34;40m▌[0;37;40m      [0;34;40m▐[0;94;44m░░░░[0;90;40m░[0;37;40m   [0;94;40m▀▄[0;37;40m [0;94;44m▓▓▓[0;94;40m▄[0;37;40m   [0;90;40m░░[0;94;44m▓▓▓▓[0;94;40m▌[0m
                        [0;37;40m [0;94;40m▀[0;94;44m▓▓▓▓[0;94;40m▄▄▄▄█▀[0;37;40m     [0;94;44m▓[0;94;40m▌[0;37;40m [0;94;40m▐[0;94;44m▓[0;94;40m▄[0;37;40m   [0;34;40m▄[0;94;44m▒▒▒[0;34;40m█[0;37;40m        [0;34;40m█[0;94;44m▒▒▒[0;34;40m▄[0;37;40m   [0;94;40m▄[0;94;44m▓[0;94;40m▌[0;37;40m [0;94;40m▀█[0;94;44m█[0;94;40m█▄▄▄▓[0;94;44m██[0;94;40m█▀[0;37;40m [0m
                        [0;37;40m   [0;94;40m▀▀▀▀▀▀[0;37;40m       [0;94;40m▀[0;37;40m    [0;94;40m▀█[0;94;44m▓▓▓▒▒[0;34;40m▀▀[0;37;40m          [0;34;40m▀▀[0;94;44m▒▒▓▓▓[0;94;40m█▀[0;37;40m     [0;94;40m▀▀▀▀▀▀▀[0;37;40m   [0m"
    Write-Host "[0;37;40m      [0;97;40m▄▀▀▀▀▀▀█[0;37;40m   [0;97;40m▄▀▀▀▀▀▀▀▀▀▀█[0;37;40m   [0;97;40m▄▄▀▀▀▀▀▀▄▄[0;37;40m   [0;97;40m█▀▀▀▀▀▀▀▀▀▀▀▀█[0;37;40m [0;97;40m█▀▀▀▀▀▀▀▀▀▀▀▀█[0m
[0;37;40m    [0;97;40m▄▀[0;37;40m [0;97;40m▄▀[0;97;47m░[0;37;40m [0;92;42m░[0;37;40m [0;97;47m░[0;37;40m [0;97;40m▄█▄▄▀[0;97;47m▓[0;37;40m [0;32;40m░[0;37;40m [0;97;47m▓[0;97;40m▀▀▀▀[0;37;40m [0;97;40m█▀[0;37;40m  [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;37;40m  [0;97;40m▀█[0;37;40m [0;97;47m▓[0;37;40m [0;32;40m░[0;37;40m [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;97;40m▄▄▄[0;97;47m▓[0;37;40m [0;97;47m▓[0;37;40m [0;32;40m░[0;37;40m [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;97;40m▄▄▄[0;97;47m▓[0m
[0;37;40m  [0;97;40m▄▀[0;37;40m [0;97;40m▄▀[0;37;40m  [0;97;47m▒[0;37;40m▄▄▄[0;97;47m▒[0;37;40m      [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m     [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m    [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m          [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m         [0m
[0;97;40m▄▀[0;37;40m  [0;97;47m▓[0;37;40m               [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m     [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m    [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m          [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m         [0m
[0;37;40m█ [0;92;42m░[0;37;40m [0;97;47m▀[0;37;40m▄▄▄▄▄▄▄▄▄      █ [0;32;40m█[0;37;40m █     █ [0;32;40m█[0;37;40m ▀▀▀▀▀▀ [0;92;42m░[0;37;40m █ █ [0;32;40m█[0;37;40m ▀▀▀▀█      █ [0;32;40m█[0;37;40m ▀▀▀▀█     [0m
[0;90;47m░[0;37;40m▄▄▄▄▄▄▄▄▄ [0;32;40m▄[0;37;40m [0;90;47m░[0;37;40m      [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m [0;90;47m░[0;37;40m     [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m █▀▀▀▀█ [0;92;42m▒[0;37;40m [0;90;47m░[0;37;40m [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m █▀▀▀▀      [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m █▀▀▀▀     [0m
[0;37;40m         [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m      [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m     [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m    [0;90;47m▒[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▒[0;37;40m [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m          [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m         [0m
[0;90;47m▓[0;90;40m▀▀▀[0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m      [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m     [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m          [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m         [0m
[0;37;40m [0;90;40m▀▀▄▄▀▀▀▀▀[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0;37;40m      [0;90;40m█[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0;37;40m     [0;90;40m█[0;37;40m   [0;90;40m█[0;37;40m    [0;90;40m█[0;37;40m   [0;90;40m█[0;37;40m [0;90;40m█[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0;37;40m          [0;90;40m█[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0;37;40m         [0m
[0;37;40m     [0;90;40m▀▀▀▀▀▀▀▀▀[0;37;40m      [0;90;40m▀▀▀▀▀[0;37;40m     [0;90;40m▀▀▀▀▀[0;37;40m    [0;90;40m▀▀▀▀▀[0;37;40m [0;90;40m▀▀▀▀▀[0;37;40m          [0;90;40m▀▀▀▀▀[0;37;40m         [0m
[0;97;40m█▀▀▀▀▀▀▀▀▀▀▀▀█[0;37;40m   [0;97;40m▄▄▀▀▀▀▀▀▄▄[0;37;40m   [0;97;40m█▀▀▀▀▀▀▀▀▀▄▄[0;37;40m         [0;97;40m▄▀▀▀▀▀▀█[0;37;40m   [0;97;40m▄▄▀▀▀▀▀▀▄▄[0;37;40m   [0;97;40m█▀▀▀█[0;37;40m          [0;97;40m█▀▀▀▀▀▀▀▀▀▀▀▀█[0m
[0;97;47m▓[0;37;40m [0;32;40m░[0;37;40m [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m▓[0;37;40m [0;97;40m█▀[0;37;40m  [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;37;40m  [0;97;40m▀█[0;37;40m [0;97;40m█[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;37;40m  [0;97;40m▀█[0;37;40m     [0;97;40m▄▀[0;37;40m [0;97;40m▄▀[0;97;47m░[0;37;40m [0;92;42m░[0;37;40m [0;97;47m░[0;37;40m [0;97;40m█▀[0;37;40m  [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;37;40m  [0;97;40m▀█[0;37;40m [0;97;47m▓[0;37;40m [0;32;40m░[0;37;40m [0;97;47m▓[0;37;40m          [0;97;47m▓[0;37;40m [0;32;40m░[0;37;40m [0;97;47m▓[0;97;40m▀▀▀▀[0;97;47m▓[0;97;40m▄▄▄[0;97;47m▓[0m
[0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m    [0;97;47m▒[0;97;40m▄▄▄[0;97;47m▓[0;37;40m [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m    [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m    [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m   [0;97;40m▄▀[0;37;40m [0;97;40m▄▀[0;37;40m  [0;97;47m▒[0;37;40m▄▄▄[0;97;47m▒[0;37;40m [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m    [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m          [0;97;47m▒[0;37;40m [0;32;40m▒[0;37;40m [0;97;47m▒[0;37;40m         [0m
[0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m          [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m    [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m    [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m [0;97;40m▄▀[0;37;40m  [0;97;47m▓[0;37;40m          [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m    [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m          [0;97;47m░[0;37;40m [0;32;40m▓[0;37;40m [0;97;47m░[0;37;40m         [0m
[0;37;40m█ [0;32;40m█[0;37;40m █          █ [0;32;40m█[0;37;40m █    █ [0;92;42m░[0;37;40m █ █ [0;32;40m█[0;37;40m █    █ [0;92;42m░[0;37;40m █ █ [0;92;42m░[0;37;40m [0;97;47m▀[0;37;40m▄▄▄▄▄▄▄▄▄ █ [0;32;40m█[0;37;40m █    █ [0;92;42m░[0;37;40m █ █ [0;32;40m█[0;37;40m █          █ [0;32;40m█[0;37;40m ▀▀▀▀█     [0m
[0;90;47m░[0;37;40m [0;92;42m░[0;37;40m █          [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m [0;90;47m░[0;37;40m    [0;90;47m░[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m░[0;37;40m [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m █    █ [0;92;42m▒[0;37;40m [0;90;47m░[0;37;40m [0;90;47m░[0;37;40m▄▄▄▄▄▄▄▄▄ [0;32;40m▄[0;37;40m [0;90;47m░[0;37;40m [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m [0;90;47m░[0;37;40m    [0;90;47m░[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m░[0;37;40m [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m [0;90;47m░[0;37;40m          [0;90;47m░[0;37;40m [0;92;42m░[0;37;40m █▀▀▀▀     [0m
[0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m    [0;90;47m▒[0;90;40m▀▀▀[0;90;47m▒[0;37;40m [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m    [0;90;47m▒[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▒[0;37;40m [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m    [0;90;47m▒[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▒[0;37;40m          [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m    [0;90;47m▒[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▒[0;37;40m [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m          [0;90;47m▒[0;37;40m [0;92;42m▒[0;37;40m [0;90;47m▒[0;37;40m         [0m
[0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m [0;90;47m▓[0;90;40m▀▀▀[0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m          [0;90;47m▓[0;37;40m [0;92;42m▓[0;37;40m [0;90;47m▓[0;37;40m    [0;90;47m▓[0;37;40m▀▀▀[0;90;47m▓[0m
[0;90;40m█[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m▀▀▀▀▀▀[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0;37;40m [0;90;40m▀▀▄▄▀▀▀▀▀▀▄▄▀▀[0;37;40m [0;90;40m█[0;37;40m   [0;90;40m█[0;37;40m    [0;90;40m█[0;37;40m   [0;90;40m█[0;37;40m  [0;90;40m▀▀▄▄▀▀▀▀▀[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0;37;40m [0;90;40m▀▀▄▄▀▀▀▀▀▀▄▄▀▀[0;37;40m [0;90;40m█[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m▀▀▀▀▀▀▀▀▀█[0;37;40m [0;90;40m█[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m▀▀▀▀▀▀[0;37;40m [0;92;40m▀[0;37;40m [0;90;40m█[0m
[0;90;40m▀▀▀▀▀▀▀▀▀▀▀▀▀▀[0;37;40m     [0;90;40m▀▀▀▀▀▀[0;37;40m     [0;90;40m▀▀▀▀▀[0;37;40m    [0;90;40m▀▀▀▀▀[0;37;40m      [0;90;40m▀▀▀▀▀▀▀▀▀[0;37;40m     [0;90;40m▀▀▀▀▀▀[0;37;40m     [0;90;40m▀▀▀▀▀▀▀▀▀▀▀▀▀▀[0;37;40m [0;90;40m▀▀▀▀▀▀▀▀▀▀▀▀▀▀[0m"
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host "${c_blue}  $Title${c_reset}"
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host ""
}

function Show-Banner {
    Write-Host "${c_cyan}═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════${c_reset}"
    Write-Host "${c_cyan}   S T A F F C O N ${c_reset}${c_pink}:: Staff Console ::${c_reset} ${c_gray}Ciszu Network v$VERSION${c_reset}"}

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

function Test-StaffconPassword {
    $expected = Read-VaultEnv 'DEVCON_PASSWORD'
    if ([string]::IsNullOrWhiteSpace($expected)) {
        Write-Host "${c_red}[SEGURIDAD] DEVCON_PASSWORD no configurado en el vault (services/supabase/.env).${c_reset}"
        return $false
    }
    $secure = Read-Host "Contraseña de acceso" -AsSecureString
    $plain = [System.Net.NetworkCredential]::new('', $secure).Password
    return ($plain -ceq $expected)
}

# ---------- Datos ----------
function Get-StaffData {
    return (Get-Content -LiteralPath $DATA_FILE -Raw | ConvertFrom-Json)
}

function Invoke-StaffNode {
    param([string[]]$NodeArgs)
    Push-Location $root
    try {
        node @NodeArgs 2>&1 | Out-Host
        return $LASTEXITCODE
    } finally {
        Pop-Location
    }
}

# ---------- Identidad ----------
function Show-Identity {
    $d = Get-StaffData
    $emps = @($d.empleados | Where-Object { $_.estado -eq 'activo' })
    if ($emps.Count -eq 0) {
        Write-Host "${c_red}No hay empleados activos. No puedes operar la STAFFCON.${c_reset}"
        return $null
    }
    $opts = @()
    foreach ($emp in $emps) {
        $opts += @{ ic = '👤'; l = "$($emp.id)  $($emp.nombres) $($emp.apellidos)"; s = "cargo: $($emp.cargo)"; emp = $emp }
    }
    Write-Host ""
    Write-Host "${c_gray}Indica quién eres (por ID de empresa). Según tus permisos podrás operar.${c_reset}"
    Write-Host "${c_gray}(También puedes escribir tu ID manualmente en vez de elegir.)${c_reset}"
    Write-Host ""
    $sel = Show-Menu -Title "¿QUIÉN ERES? (identidad)" -Options $opts
    if ($sel -lt 0) { return $null }
    return $opts[$sel].emp.id
}

function Show-SwitchIdentity {
    $id = Show-Identity
    if ($id) { $script:identityId = $id }
    Press-Continue
}

# ---------- Selectores ----------
function Show-PickEmployee([string]$Title, [string]$ExcludeId = '') {
    $d = Get-StaffData
    $emps = @($d.empleados | Where-Object { $_.estado -eq 'activo' })
    $opts = @()
    foreach ($emp in $emps) {
        if ($ExcludeId -and $emp.id -eq $ExcludeId) { continue }
        $opts += @{ ic = '👤'; l = "$($emp.id)  $($emp.nombres) $($emp.apellidos)"; s = "cargo: $($emp.cargo)"; emp = $emp }
    }
    if ($opts.Count -eq 0) {
        Write-Host "${c_yellow}No hay empleados para gestionar: los únicos activos son tú o el fundador,${c_reset}"
        Write-Host "${c_yellow}que no puede ser gestionado (ni tú mismo ni el fundador).${c_reset}"
        Write-Host "${c_gray}Añade empleados primero desde el menú «Añadir empleado».${c_reset}"
        return $null
    }
    $sel = Show-Menu -Title $Title -Options $opts
    if ($sel -lt 0) { return $null }
    return $opts[$sel].emp.id
}

function Show-PickRole([string]$Title) {
    $d = Get-StaffData
    $opts = @()
    foreach ($r in $d.roles) {
        $opts += @{ ic = '🎖'; l = $r.carpeta; s = "nivel $($r.nivel) - $($r.displayName)" }
    }
    $sel = Show-Menu -Title $Title -Options $opts
    if ($sel -lt 0) { return $null }
    return $d.roles[$sel].carpeta
}

# ---------- Acciones ----------
function Show-Summary {
    $d = Get-StaffData
    Clear-Host
    Show-Banner
    Show-MenuHeader "RESUMEN DE EMPLEADOS"
    Write-Host "${c_cyan}Organizacion:${c_reset} ${c_white}$($d.org.nombre)${c_reset}"
    Write-Host "${c_cyan}Fundador:${c_reset}     $($d.org.fundador)"
    Write-Host "${c_cyan}Sede:${c_reset}         $($d.org.sede) ($($d.org.pais))"
    Write-Host "${c_cyan}Correo:${c_reset}       $($d.org.correo)"
    Write-Host ""
    Write-Host "${c_cyan}Roles por nivel (0 = mayor autoridad):${c_reset}"
    foreach ($r in ($d.roles | Sort-Object nivel)) {
        $n = @($d.empleados | Where-Object { $_.estado -eq 'activo' -and $_.cargos -contains $r.carpeta }).Count
        Write-Host ("   nivel {0,-2} {1,-20} {2} activo(s)" -f $r.nivel, $r.carpeta, $n)
    }
    Write-Host ""
    Write-Host "${c_cyan}Empleados activos:${c_reset}"
    foreach ($e in @($d.empleados | Where-Object { $_.estado -eq 'activo' })) {
        Write-Host ("   {0}  {1,-22} -> {2}" -f $e.id, "$($e.nombres) $($e.apellidos)", $e.cargo)
    }
    $bajas = @($d.empleados | Where-Object { $_.estado -eq 'inactivo' })
    if ($bajas.Count -gt 0) {
        Write-Host ""
        Write-Host "${c_yellow}Historial de bajas (IDs conservados):${c_reset}"
        foreach ($e in $bajas) {
            $f = if ($e.registroBaja) { $e.registroBaja.fecha } else { '-' }
            Write-Host ("   {0}  {1,-22} baja: {2}" -f $e.id, "$($e.nombres) $($e.apellidos)", $f)
        }
    }
    Write-Host ""
    Write-Host "${c_gray}Ubicacion: archives/staff/ (docs globales · por cargo · por empleado)${c_reset}"
    Write-Host "${c_gray}Fuente:    $DATA_FILE${c_reset}"
    Press-Continue
}

function Show-Add {
    if (-not $script:identityId) { Write-Host "${c_yellow}Primero indica quién eres.${c_reset}"; Press-Continue; return }
    Clear-Host
    Show-Banner
    Show-MenuHeader "AÑADIR EMPLEADO - identidad: $script:identityId"
    Write-Host "${c_gray}Solo CEO, Supervisor y Gerente pueden añadir. (Enter en campo = vacío)${c_reset}"
    $nombres = Read-Host "Nombres (obligatorio)"
    if ([string]::IsNullOrWhiteSpace($nombres)) { return }
    $apellidos = Read-Host "Apellidos (obligatorio)"
    if ([string]::IsNullOrWhiteSpace($apellidos)) { return }
    $telefono = Read-Host "Telefono"
    $correo = Read-Host "Correo"
    $direccion = Read-Host "Direccion"
    $cargo = Show-PickRole "CARGO del nuevo empleado"
    if (-not $cargo) { return }
    $supRaw = Read-Host "Supervisor ID (Enter = $script:identityId)"
    $sup = if ([string]::IsNullOrWhiteSpace($supRaw)) { $script:identityId } else { $supRaw.Trim() }

    $nodeArgs = @('scripts/staffcon.js', 'add', '--actor', $script:identityId, '--session', $script:staffSession,
                  '--nombres', $nombres, '--apellidos', $apellidos, '--cargo', $cargo, '--supervisor', $sup)
    if ($telefono)  { $nodeArgs += @('--telefono', $telefono) }
    if ($correo)    { $nodeArgs += @('--correo', $correo) }
    if ($direccion) { $nodeArgs += @('--direccion', $direccion) }
    Write-Host ""
    Invoke-StaffNode $nodeArgs
    Press-Continue
}

function Show-Remove {
    if (-not $script:identityId) { Write-Host "${c_yellow}Primero indica quién eres.${c_reset}"; Press-Continue; return }
    Clear-Host
    Show-Banner
    Show-MenuHeader "QUITAR EMPLEADO - identidad: $script:identityId"
    Write-Host "${c_gray}El ID se conserva y sus docs se convierten en registro de baja.${c_reset}"
    $empId = Show-PickEmployee "Elige el empleado a QUITAR" -ExcludeId $script:identityId
    if (-not $empId) { return }
    $motivo = Read-Host "Motivo de la baja"
    if ([string]::IsNullOrWhiteSpace($motivo)) { $motivo = 'Baja no especificada' }
    Write-Host ""
    Invoke-StaffNode @('scripts/staffcon.js', 'remove', '--actor', $script:identityId, '--session', $script:staffSession, '--id', $empId, '--motivo', $motivo)
    Press-Continue
}

function Show-Rank {
    if (-not $script:identityId) { Write-Host "${c_yellow}Primero indica quién eres.${c_reset}"; Press-Continue; return }
    Clear-Host
    Show-Banner
    Show-MenuHeader "CAMBIAR RANGO - identidad: $script:identityId"
    $empId = Show-PickEmployee "Elige el empleado a reubicar" -ExcludeId $script:identityId
    if (-not $empId) { return }
    $cargo = Show-PickRole "NUEVO CARGO para $empId"
    if (-not $cargo) { return }
    Write-Host ""
    Invoke-StaffNode @('scripts/staffcon.js', 'rank', '--actor', $script:identityId, '--session', $script:staffSession, '--id', $empId, '--cargo', $cargo)
    Press-Continue
}

function Show-Modify {
    if (-not $script:identityId) { Write-Host "${c_yellow}Primero indica quién eres.${c_reset}"; Press-Continue; return }
    Clear-Host
    Show-Banner
    Show-MenuHeader "MODIFICAR EMPLEADO - identidad: $script:identityId"
    Write-Host "${c_gray}Cualquier dato excepto el rango (cargo) se puede modificar. Puedes editarte a ti mismo. (Enter = vaciar)${c_reset}"
    $empId = Show-PickEmployee "Elige el empleado a MODIFICAR"
    if (-not $empId) { return }
    $fields = @(
        @{ ic = '✏'; l = 'nombres' },
        @{ ic = '✏'; l = 'apellidos' },
        @{ ic = '📞'; l = 'telefono' },
        @{ ic = '✉'; l = 'correo' },
        @{ ic = '📍'; l = 'direccion' },
        @{ ic = '👤'; l = 'supervisor' },
        @{ ic = '📅'; l = 'fechaIngreso' },
        @{ ic = '🔗'; l = 'redes' }
    )
    $sel = Show-Menu -Title "CAMPO a modificar de $empId" -Options $fields
    if ($sel -lt 0) { return }
    $campo = $fields[$sel].l
    $valor = Read-Host "Nuevo valor para '$campo' (Enter = vaciar)"
    if ($campo -eq 'redes' -and $valor) {
        Write-Host "${c_gray}Formato JSON: [{\"red\":\"Instagram\",\"url\":\"...\"}]${c_reset}"
        $valor = Read-Host "Redes (JSON)"
    }
    Write-Host ""
    Invoke-StaffNode @('scripts/staffcon.js', 'modify', '--actor', $script:identityId, '--session', $script:staffSession, '--id', $empId, '--campo', $campo, '--valor', $valor)
    Press-Continue
}

# ---------- Manual / herramientas / info ----------
function Show-Manual {
    Clear-Host
    Show-Banner
    Show-MenuHeader "MANUAL DE USO - STAFFCON"
    Write-Host "${c_white}Objetivo:${c_reset} crear y mantener la documentacion real de los empleados de`
Ciszu Network de forma organizada y automatica (archives/staff)."
    Write-Host ""
    Write-Host "${c_cyan}Estructura generada (general → cargo → empleado):${c_reset}"
    Write-Host "   archives/staff/docs/                -> 5 formatos (md/txt/csv/docx/pdf) globales"
    Write-Host "   archives/staff/<cargo>/docs/        -> ficha del cargo + sus miembros"
    Write-Host "   archives/staff/<cargo>/<EMPLEADO>/docs/ -> ficha del empleado en ese cargo"
    Write-Host "   .../content/{images,videos,profile} -> contenido visual de cada nivel"
    Write-Host "   archives/staff/data/staff.json      -> fuente de verdad (la edita la STAFFCON)"
    Write-Host ""
    Write-Host "${c_cyan}Identidad y permisos:${c_reset}"
    Write-Host "   Al entrar indicas tu ID (CZ-XXX). El sistema valida permisos y jerarquia:"
    Write-Host "   - Añadir: CEO, Supervisor y Gerente."
    Write-Host "   - Quitar / Cambiar rango: CEO, Supervisor y Gerente (jerarquia)."
    Write-Host "   - Modificar datos: los que tengan permiso, siempre en rangos inferiores."
    Write-Host "   - El fundador (CZ-001) no se puede quitar ni cambiar de rango."
    Write-Host ""
    Write-Host "${c_cyan}Quitar un empleado:${c_reset} el ID se conserva de forma permanente; la carpeta`
queda como REGISTRO DE BAJA (el .txt guarda el historial completo, el resto queda`
minimo) y la documentacion global/del cargo deja de listarlo como activo."
    Write-Host ""
    Write-Host "${c_cyan}Salir:${c_reset} cierra la consola. Los cambios ya quedaron guardados y regenerados."
    Write-Host ""
    Write-Host "${c_gray}Logs: $LOG_DIR\staffcon-<fecha>.log${c_reset}"
    Press-Continue
}

function Show-Tools {
    $opts = @(
        @{ ic = '📁'; l = "Abrir archives/staff en el explorador";   act = { Start-Process explorer.exe (Resolve-Path (Join-Path $root 'archives\staff')).Path; Press-Continue } },
        @{ ic = '📜'; l = "Ver el log de STAFFCON de hoy";           act = { $log = Join-Path $LOG_DIR ("staffcon-" + (Get-Date -Format 'yyyy-MM-dd') + '.log'); Clear-Host; if (Test-Path $log) { Get-Content $log -Tail 40 | Out-Host } else { Write-Host "${c_yellow}Sin log de hoy todavia.${c_reset}" }; Press-Continue } },
        @{ ic = '🗑'; l = "Limpiar logs de STAFFCON";                act = { Remove-Item "$LOG_DIR\staffcon-*.log" -Force -ErrorAction SilentlyContinue; Write-Host "${c_green}Logs de STAFFCON limpiados.${c_reset}"; Press-Continue } },
        @{ ic = '🔄'; l = "Regenerar TODA la documentacion (staffgen)"; act = { Push-Location $root; node scripts/staffgen.js 2>&1 | Out-Host; Pop-Location; Press-Continue } },
        @{ ic = '🔍'; l = "Ver el JSON fuente (staff.json)";         act = { Clear-Host; Get-Content $DATA_FILE | Out-Host; Press-Continue } }
    )
    $sel = Show-Menu -Title "OTRAS HERRAMIENTAS" -Options $opts
    if ($sel -ge 0) { & $opts[$sel].act }
}

function Show-Info {
    Clear-Host
    Show-Banner
    Show-MenuHeader "INFORMACIÓN / CRÉDITOS"
    Write-Host "${c_pink}CISZU NETWORK${c_reset} ${c_gray}- ecosistema digital de Ciszuko Antony.${c_reset}"
    Write-Host "${c_gray}Consola:       Staff Console (STAFFCON)${c_reset}"
    Write-Host "${c_gray}Version:       $VERSION${c_reset}"
    Write-Host "${c_gray}Carpeta:       test/website/debug/staffcon.ps1${c_reset}"
    Write-Host "${c_gray}Motor:         scripts/staffcon.js + scripts/staffgen.js${c_reset}"
    Write-Host "${c_gray}Datos:         archives/staff/data/staff.json${c_reset}"
    Write-Host "${c_gray}Creado:        ago 2026${c_reset}"
    Write-Host ""
    Write-Host "${c_gray}Documentacion: STAFF_SYSTEM.md · EMPLOYEES_SYSTEM.md${c_reset}"
    Press-Continue
}

# ---------- Modo Demo ----------
if ($Demo.IsPresent) {
    $d = Get-StaffData
    Clear-Host
    Show-Banner
    Show-MenuHeader "DEMO - RESUMEN DE EMPLEADOS"
    Write-Host "Empleados activos: $(@($d.empleados | Where-Object { $_.estado -eq 'activo' }).Count)"
    Write-Host "Roles:             $($d.roles.Count)"
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
        $d = Get-StaffData
        if ($d.roles.Count -ne 20) { $failures += "roles count: $($d.roles.Count) != 20" }
        if (@($d.empleados | Where-Object { $_.estado -eq 'activo' }).Count -lt 1) { $failures += 'sin empleados activos' }
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
Write-Host "${c_cyan}══════════════════════  STAFFCON - ACCESO RESTRINGIDO  ══════════════════════${c_reset}"
if (-not (Test-StaffconPassword)) {
    Write-Host "${c_red}[SEGURIDAD] Contraseña incorrecta. Cerrando la consola.${c_reset}"
    Start-Sleep -Milliseconds 900
    exit 1
}
$script:staffSession = 'staffcon-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString().Substring(0, 8))

# Identidad inicial (quien opera la consola)
$script:identityId = $null
while (-not $script:identityId) {
    Clear-Host
    Show-Banner
    Write-Host "${c_green}Password OK. Ahora indica quién eres.${c_reset}"
    $script:identityId = Show-Identity
    if (-not $script:identityId) {
        Write-Host "${c_red}No se pudo establecer la identidad. Cerrando.${c_reset}"
        Start-Sleep -Milliseconds 900
        exit 1
    }
}

# ---------- Menu principal ----------
$script:quitRequested = $false
while (-not $script:quitRequested) {
    $menuItems = @(
        @{ ic = '📊'; l = "Resumen (empleados y rangos)";    key = '__summary' },
        @{ ic = '➕'; l = "Añadir empleado";                  key = '__add' },
        @{ ic = '➖'; l = "Quitar empleado";                  key = '__remove' },
        @{ ic = '🔄'; l = "Cambiar rango (cargo)";           key = '__rank' },
        @{ ic = '✏'; l = "Modificar datos de un empleado";   key = '__modify' },
        @{ ic = '🧰'; l = "Otras herramientas";              key = '__tools' },
        @{ ic = '❓'; l = "Manual de uso";                   key = '__manual' },
        @{ ic = 'ℹ'; l = "Información / Créditos";          key = '__info' },
        @{ ic = '👤'; l = "Cambiar identidad (quién eres)";  key = '__identity' },
        @{ ic = '🚪'; l = "Salir (Ctrl+C)";                  key = '__quit' }
    )

    Clear-Host
    Show-Banner
    Show-MenuHeader "STAFF CONSOLE - MENÚ PRINCIPAL"
    Write-Host "${c_cyan}Identidad: ${c_white}$script:identityId${c_reset}${c_gray} · sesión: $($script:staffSession)${c_reset}"
    Write-Host ""
    for ($n = 0; $n -lt $menuItems.Count; $n++) {
        $ic = if ($menuItems[$n].ic) { $menuItems[$n].ic } else { '  ' }
        Write-Host ("   [{0}]  {1}  {2}" -f ($n + 1), $ic, $menuItems[$n].l)
    }
    Write-Host ""
    Write-Host "${c_gray}(elige un número o navega con ↑/↓ y Enter; Q para salir)${c_reset}"

    $sel = Show-Menu -Title "STAFF CONSOLE - MENÚ PRINCIPAL" -Options $menuItems
    if ($sel -lt 0) { $script:quitRequested = $true; continue }
    $key = $menuItems[$sel].key
    switch ($key) {
        '__summary'   { Show-Summary }
        '__add'       { Show-Add }
        '__remove'    { Show-Remove }
        '__rank'      { Show-Rank }
        '__modify'    { Show-Modify }
        '__tools'     { Show-Tools }
        '__manual'    { Show-Manual }
        '__info'      { Show-Info }
        '__identity'  { Show-SwitchIdentity }
        '__quit'      { $script:quitRequested = $true }
    }
}

Clear-Host
Write-Host "${c_green}Staff Console finalizada. Documentacion actualizada en archives/staff.${c_reset} ${c_pink}:: CISZU NETWORK ::${c_reset}"
Write-Host "${c_cyan}════════════════════════════════════════════════════════════════════════${c_reset}"
