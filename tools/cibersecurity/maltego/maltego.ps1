# maltego.ps1 — Lanzador oficial de Maltego (Ciszu Network)
#
# Maltego v4.12.1 (Community Edition): framework de minería de datos y
# visualización de vínculos (entidades: personas, emails, dominios, IPs).
# Instalado por Ciszuko el 18 ago 2026. Uso GUI/manual (sin CLI para CI).
# Config del usuario: %APPDATA%\Maltego\v4.12.1
# Doc: CIBERSECURITY_SYSTEM.md y OSINT_PROTOCOLS.md
#
# Uso:
#   .\tools\cibersecurity\maltego\maltego.ps1            # abre la GUI
#   .\tools\cibersecurity\maltego\maltego.ps1 -Config    # abre la carpeta de config
#   .\tools\cibersecurity\maltego\maltego.ps1 -Log       # abre el log actual
#
# Atajos: PowerShell `maltego` · opencode `/maltego`

param(
  [switch]$Config,
  [switch]$Log
)

$ErrorActionPreference = 'Stop'
$exe = 'C:\Program Files (x86)\Paterva\Maltego\v4.12.1\bin\maltego.exe'
$cfg = Join-Path $env:APPDATA 'Maltego\v4.12.1'
$logDir = Join-Path $cfg (Join-Path 'var' 'log')

if (-not (Test-Path $exe)) {
  Write-Host "[ciszu:maltego] No se encontro el ejecutable: $exe" -ForegroundColor Yellow
  exit 2
}

if ($Config) {
  New-Item -ItemType Directory -Force -Path $cfg | Out-Null
  explorer.exe $cfg
  exit 0
}
if ($Log) {
  if (Test-Path $logDir) { explorer.exe $logDir } else { Write-Host "[ciszu:maltego] sin logs todavia" -ForegroundColor Yellow }
  exit 0
}

Write-Host "[ciszu:maltego] abriendo GUI (v4.12.1)..."
& $exe
exit $LASTEXITCODE