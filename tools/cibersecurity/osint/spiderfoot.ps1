# spiderfoot.ps1 — Framework integral de investigación OSINT con SpiderFoot (presets Ciszu)
#
# SpiderFoot v4: automatiza OSINT en cientos de fuentes (correos, telefonos, dominios,
# IPs, usernames). Open source (MIT), Python 3.7+, CLI/web. DB en ~/.spiderfoot/.
# Repo: https://github.com/smicallef/spiderfoot · Doc: CIBERSECURITY_SYSTEM.md / OSINT_PROTOCOLS.md
#
# Uso (SpiderFoot detecta el tipo por el formato del target):
#   .\tools\cibersecurity\osint\spiderfoot.ps1 -Targets foo@example.com     # EMAIL  (contiene @)
#   .\tools\cibersecurity\osint\spiderfoot.ps1 -Targets ejemplo.com,tld     # DOMINIO (formato DNS)
#   .\tools\cibersecurity\osint\spiderfoot.ps1 -Targets +584161234567       # TELEFONO (empieza con + y solo digitos)
#   .\tools\cibersecurity\osint\spiderfoot.ps1 -Targets foo                 # USERNAME (lo demás)
#   .\tools\cibersecurity\osint\spiderfoot.ps1 -Targets foo@example.com -Preset quick -Test
#
# Presets:
#   full  (default) -> -u passive (todos los modulos pasivos, sin API keys; lento/exhaustivo)
#   quick            -> modulos gratuitos seleccionados segun el tipo de target (rapido)
#
# Salida:
#   oficial -> tools/cibersecurity/osint/output/spiderfoot/
#   -Test   -> test/osint/spiderfoot/   (pruebas rapidas, gitignored)
#
# Nota instalacion: clon vive en clones/spiderfoot (aprobado 18 ago 2026)
#   git clone https://github.com/smicallef/spiderfoot "clones\spiderfoot"
#   cd "clones\spiderfoot"; pip install -r requirements.txt

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string[]]$Targets,
  [ValidateSet('full', 'quick')]
  [string]$Preset = 'full',
  [switch]$Test,
  [string]$Out
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path

if ($Out) { $outDir = $Out }
elseif ($Test) { $outDir = Join-Path $repo 'test\osint\spiderfoot' }
else { $outDir = Join-Path $repo 'tools\cibersecurity\osint\output\spiderfoot' }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Detectar sf.py (clon local de SpiderFoot >= 4.0)
$candidates = @(
  (Join-Path $repo 'clones\spiderfoot\sf.py'),
  (Join-Path $env:USERPROFILE 'spiderfoot\sf.py'),
  (Get-Command sf.py -ErrorAction SilentlyContinue).Source
)
$sf = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $sf) {
  Write-Host "[osint:spiderfoot] SpiderFoot NO instalado." -ForegroundColor Yellow
  Write-Host "Instalacion (clon en clones/spiderfoot):" -ForegroundColor Yellow
  Write-Host "  git clone https://github.com/smicallef/spiderfoot `"$repo\clones\spiderfoot`"" -ForegroundColor Yellow
  Write-Host "  cd `"$repo\clones\spiderfoot`"; pip install -r requirements.txt" -ForegroundColor Yellow
  exit 2
}

# Tipo de target (misma logica que helpers.targetTypeFromString): email, phone, dominio o username.
function Get-TargetType([string]$t) {
  if ($t -match '@') { return 'email' }
  if ($t -match '^\+[0-9]+$') { return 'phone' }
  if ($t -match '^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)+([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$') { return 'dominio' }
  return 'username'
}

# Modulos gratuitos (sin API key) por tipo, para el preset quick.
# full usa -u passive que ya se adapta solo a cualquier tipo.
switch ($Preset) {
  'full'  { $sfArgs = @('-u', 'passive') }
  'quick' {
    $type = Get-TargetType $Targets[0]
    switch ($type) {
      'email'   { $sfArgs = @('-m', 'sfp_email,sfp_haveibeenpwned,sfp_pgp,sfp_botscout,sfp_psbdmp,sfp_threatcrowd,sfp_emailrep') }
      'phone'   { $sfArgs = @('-m', 'sfp_phone,sfp_intelx') }
      'dominio' { $sfArgs = @('-m', 'sfp_whois,sfp_crt,sfp_viewdns,sfp_hunter') }
      default   { $sfArgs = @('-m', 'sfp_gravatar,sfp_keybase,sfp_social,sfp_accounts') }
    }
    Write-Host "[osint:spiderfoot] tipo=$type"
  }
}

Write-Host "[osint:spiderfoot] preset=$Preset targets=$($Targets -join ',')"
$exitCode = 0
foreach ($t in $Targets) {
  $sfOut = ($t -replace '[^a-zA-Z0-9_.@+-]', '_')
  $file = Join-Path $outDir "$sfOut.csv"
  Write-Host "[osint:spiderfoot] scan: $t -> $file"
  & python $sf -s $t @sfArgs -o csv -q | Out-File -FilePath $file -Encoding utf8
  if ($LASTEXITCODE -ne 0) { $exitCode = $LASTEXITCODE }
}
exit $exitCode