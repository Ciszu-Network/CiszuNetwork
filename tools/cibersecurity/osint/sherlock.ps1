# sherlock.ps1 — Busqueda de presencia social por username con Sherlock (presets Ciszu)
#
# Sherlock: checkeo rapido de ~400 redes sociales por username. Binario:
# C:\Users\fplay\AppData\Local\Programs\Python\Python314\Scripts\sherlock.exe
# Documentado en: projects/ciszu/docs/documentation/CIBERSECURITY_SYSTEM.md y OSINT_PROTOCOLS.md
#
# Uso:
#   .\tools\cibersecurity\osint\sherlock.ps1 -Usernames none_xisty_zzz_999    # preset full
#   .\tools\cibersecurity\osint\sherlock.ps1 -Usernames none_xisty_zzz_999 -Preset quick -Test
#   .\tools\cibersecurity\osint\sherlock.ps1 -Usernames foo -Out "E:\ruta\custom"
#
# Presets:
#   full  (default) -> --csv --xlsx --timeout 30
#   quick           -> --csv --timeout 15
#
# Salida:
#   oficial -> tools/cibersecurity/osint/output/sherlock/
#   -Test   -> test/osint/sherlock/   (pruebas rapidas, gitignored)

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string[]]$Usernames,
  [ValidateSet('full', 'quick')]
  [string]$Preset = 'full',
  [switch]$Test,
  [string]$Out
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path

if ($Out) { $outDir = $Out }
elseif ($Test) { $outDir = Join-Path $repo 'test\osint\sherlock' }
else { $outDir = Join-Path $repo 'tools\cibersecurity\osint\output\sherlock' }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$flags = @('--csv', '--xlsx', '--timeout', '30', '--folderoutput', $outDir)
switch ($Preset) {
  'full'  { }
  'quick' { $flags = @('--csv', '--timeout', '15', '--folderoutput', $outDir) }
}

Write-Host "[osint:sherlock] preset=$Preset -> $outDir"
& sherlock @Usernames @flags
exit $LASTEXITCODE
