# maigret.ps1 — Busqueda OSINT de perfiles con Maigret (presets Ciszu)
#
# Maigret: recopilacion de URLs de perfiles por username + datos extraidos de
# las paginas (recursion). Binario: C:\Users\fplay\AppData\Local\Programs\Python\Python314\Scripts\maigret.exe
# Documentado en: projects/ciszu/docs/documentation/CIBERSECURITY_SYSTEM.md y OSINT_PROTOCOLS.md
#
# Uso:
#   .\tools\cibersecurity\osint\maigret.ps1 -Usernames none_xisty_zzz_999                     # preset full
#   .\tools\cibersecurity\osint\maigret.ps1 -Usernames foo -Preset quick -Test             # test rapido en test/osint/maigret
#   .\tools\cibersecurity\osint\maigret.ps1 -Usernames foo -Out "E:\ruta\custom"              # carpeta de salida explicita
#
# Presets:
#   full  (default) -> --graph --tags social,tech --csv --json ndjson --html
#   quick           -> --csv (solo CSV, mas rapido)
#
# Salida:
#   oficial -> tools/cibersecurity/osint/output/maigret/
#   -Test   -> test/osint/maigret/   (pruebas rapidas, gitignored)

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string[]]$Usernames,
  [ValidateSet('full', 'quick')]
  [string]$Preset = 'full',
  [switch]$Test,
  [string]$Out
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

if ($Out) { $outDir = $Out }
elseif ($Test) { $outDir = Join-Path $repo 'test\osint\maigret' }
else { $outDir = Join-Path $repo 'tools\cibersecurity\osint\output\maigret' }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$flags = @('--folderoutput', $outDir)
switch ($Preset) {
  'full'  { $flags += @('--graph', '--tags', 'social,tech', '--csv', '--json', 'ndjson', '--html') }
  'quick' { $flags += @('--csv') }
}

Write-Host "[osint:maigret] preset=$Preset -> $outDir"
& maigret @Usernames @flags
exit $LASTEXITCODE
