# spiderfoot.ps1 — Framework integral de investigación OSINT con SpiderFoot (presets Ciszu)
#
# SpiderFoot v4: automatiza OSINT en cientos de fuentes (correos, telefonos, dominios,
# IPs, usernames). Open source (MIT), Python 3.7+, wiper CLI/web. DB en ~/.spiderfoot/.
# Repo: https://github.com/smicallef/spiderfoot · Doc: CIBERSECURITY_SYSTEM.md / OSINT_PROTOCOLS.md
#
# Uso:
#   .\tools\osint\spiderfoot.ps1 -Targets usuario@example.com   # preset full (use-case passive)
#   .\tools\osint\spiderfoot.ps1 -Targets dominio.com -Preset quick -Test
#
# Presets:
#   full  (default) -> -u passive (todos los modulos pasivos, sin API keys)
#   quick           -> solo modulos basicos de username/email
#
# Salida:
#   oficial -> tools/osint/output/spiderfoot/
#   -Test   -> test/osint/spiderfoot/   (pruebas rapidas, gitignored)
#
# Importante: SpiderFoot escanea UN target por scan; el wrapper itera sobre los targets.
# La instalacion NO esta disponible de serie; requiere aprobacion (AGENTS 7.1):
#   git clone https://github.com/smicallef/spiderfoot "$env:USERPROFILE\spiderfoot"
#   cd "$env:USERPROFILE\spiderfoot"; pip install -r requirements.txt

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string[]]$Targets,
  [ValidateSet('full', 'quick')]
  [string]$Preset = 'full',
  [switch]$Test,
  [string]$Out
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

if ($Out) { $outDir = $Out }
elseif ($Test) { $outDir = Join-Path $repo 'test\osint\spiderfoot' }
else { $outDir = Join-Path $repo 'tools\osint\output\spiderfoot' }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Detectar sf.py (clon local de SpiderFoot >= 4.0)
$candidates = @(
  (Join-Path $env:USERPROFILE 'spiderfoot\sf.py'),
  (Join-Path $repo 'tools\spiderfoot\sf.py'),
  (Get-Command sf.py -ErrorAction SilentlyContinue).Source
)
$sf = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $sf) {
  Write-Host "[osint:spiderfoot] SpiderFoot NO instalado." -ForegroundColor Yellow
  Write-Host "Instalacion (requiere aprobacion de Ciszuko, AGENTS 7.1):" -ForegroundColor Yellow
  Write-Host "  git clone https://github.com/smicallef/spiderfoot `"$env:USERPROFILE\spiderfoot`"" -ForegroundColor Yellow
  Write-Host "  cd `"$env:USERPROFILE\spiderfoot`"; pip install -r requirements.txt" -ForegroundColor Yellow
  exit 2
}

# Modulos segun preset.
# 'passive' (use-case) selecciona automaticamente los modulos pasivos sin API key.
switch ($Preset) {
  'full'  { $usecase = 'passive' }
  'quick' { $usecase = 'passive' }   # reservado para acotar a sfp_gravatar/sfp_username mas adelante
}

Write-Host "[osint:spiderfoot] preset=$Preset targets=$($Targets -join ',')"
$exitCode = 0
foreach ($t in $Targets) {
  $sfOut = ($t -replace '[^a-zA-Z0-9_.@-]', '_')
  $file = Join-Path $outDir "$sfOut.csv"
  Write-Host "[osint:spiderfoot] scan: $t -> $file"
  & python $sf -s $t -u $usecase -o csv -q | Out-File -FilePath $file -Encoding utf8
  if ($LASTEXITCODE -ne 0) { $exitCode = $LASTEXITCODE }
}
exit $exitCode