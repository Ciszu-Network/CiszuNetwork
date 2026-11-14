param(
  [switch]$Check,
  [string]$RepoRoot = ''
)

$ErrorActionPreference = 'Stop'

if (-not $RepoRoot) {
  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}
$RepoRoot = (Resolve-Path $RepoRoot).Path
$module = Join-Path $RepoRoot 'shared\powershell\CiszuNetwork.Profile.ps1'
if (-not (Test-Path -LiteralPath $module)) {
  throw "No se encontro el modulo del perfil: $module"
}

if ($Check) {
  $loaded = if (Test-Path -LiteralPath $PROFILE) { Get-Content -LiteralPath $PROFILE -Raw } else { '' }
  Write-Output "Perfil:  $PROFILE"
  Write-Output "Modulo:  $module"
  Write-Output "Repo:    $RepoRoot"
  Write-Output "Loader:  $(if ($loaded -match 'CiszuNetwork\.Profile') { 'OK' } else { 'NO INSTALADO' })"
  exit 0
}

$profileDir = Split-Path -Parent $PROFILE
if (-not (Test-Path -LiteralPath $profileDir)) {
  New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}
if (Test-Path -LiteralPath $PROFILE) {
  $backup = "$PROFILE.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $PROFILE -Destination $backup -Force
  Write-Output "Backup: $backup"
}

$escapedModule = $module.Replace("'", "''")
$escapedRepo = $RepoRoot.Replace("'", "''")
$loader = @"
# CISZU Network — cargador del perfil portable.
# Generado por shared/powershell/install-profile.ps1.
`$ciszuCandidates = @(
  `$env:CISZU_REPO,
  '$escapedRepo',
  'E:\Ciszu Network',
  (Join-Path `$HOME 'Ciszu Network'),
  (Join-Path `$HOME 'source\repos\CiszuNetwork')
)
foreach (`$ciszuRoot in `$ciszuCandidates) {
  if (-not `$ciszuRoot) { continue }
  `$ciszuModule = Join-Path `$ciszuRoot 'shared\powershell\CiszuNetwork.Profile.ps1'
  if (Test-Path -LiteralPath `$ciszuModule) {
    . `$ciszuModule
    return
  }
}
Write-Host 'CISZU profile: no se encontro shared/powershell/CiszuNetwork.Profile.ps1. Ejecuta pnpm profile:install desde el repo.' -ForegroundColor Yellow
"@

Set-Content -LiteralPath $PROFILE -Value $loader -Encoding UTF8
Write-Output "Instalado: $PROFILE"
Write-Output "Modulo:    $module"
