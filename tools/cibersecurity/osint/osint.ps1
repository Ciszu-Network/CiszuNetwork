# osint.ps1 — Dispatcher OSINT (Ciszu Network)
#
# Punto de entrada unico para las herramientas OSINT oficiales:
#   maigret, sherlock, simplelogin, spiderfoot
#
# Uso:
#   .\tools\cibersecurity\osint\osint.ps1 maigret -Usernames foo,bar
#   .\tools\cibersecurity\osint\osint.ps1 sherlock -Usernames foo -Preset quick -Test
#   .\tools\cibersecurity\osint\osint.ps1 simplelogin info
#   .\tools\cibersecurity\osint\osint.ps1 spiderfoot -Targets foo@example.com
#
# Atajos PowerShell (perfil): osint-mai, osint-sher, osint-slo, osint-sfx

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('maigret', 'sherlock', 'simplelogin', 'spiderfoot')]
  [string]$Tool,
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Rest
)

$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot ($Tool + '.ps1')

# Preservar parametros con nombre: el splat de array es posicional, asi que se
# reconstruye la linea de llamada con cada token entre comillas si es necesario.
$tokens = foreach ($t in $Rest) {
  if ($t -match '[ ''\t"]' -or $t -eq '') { "'" + ($t -replace "'", "''") + "'" }
  else { $t }
}
Invoke-Expression ("& '$script' " + ($tokens -join ' '))
exit $LASTEXITCODE