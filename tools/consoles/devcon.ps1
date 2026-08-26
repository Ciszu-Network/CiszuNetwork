<#
.SYNOPSIS
Dev Console - acceso desde tools/consoles (wrapper).

.DESCRIPTION
Este wrapper SOLO referencia la consola real de debugging ubicada en
test/website/debug/dev_console.ps1. Reenvia todos los parametros tal cual
para que los comandos del perfil (devcon, devall, devstop, devstatus, devlog,
devweb, devantony, devbotweb, devmuzic) sigan funcionando igual.

.EXAMPLE
  .\tools\consoles\devcon.ps1               # TUI interactiva
  .\tools\consoles\devcon.ps1 -Action status
#>

[CmdletBinding()]
param(
    [switch]$Demo,
    [switch]$SelfTest,
    [ValidateSet('start', 'stop', 'restart', 'status', 'log', 'help')]
    [string]$Action,
    [string]$Web
)

# tools/consoles -> tools -> E:\Ciszu Network
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$real = Join-Path $root 'test\website\debug\dev_console.ps1'
if (-not (Test-Path -LiteralPath $real)) {
    Write-Host "[ERROR] No se encontro la consola real en: $real"
    exit 1
}
# Solo reenvía los parámetros que vengan definidos (evita -Action:$null).
$fwd = @{}
if ($Demo)     { $fwd['Demo'] = $true }
if ($SelfTest) { $fwd['SelfTest'] = $true }
if ($Action)   { $fwd['Action'] = $Action }
if ($Web)      { $fwd['Web'] = $Web }
& $real @fwd