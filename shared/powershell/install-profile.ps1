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

$documents = [Environment]::GetFolderPath('MyDocuments')
$profilePaths = @(
  $PROFILE,
  (Join-Path $documents 'PowerShell\Microsoft.PowerShell_profile.ps1')
) | Select-Object -Unique

if ($Check) {
  foreach ($path in $profilePaths) {
    $loaded = if (Test-Path -LiteralPath $path) { Get-Content -LiteralPath $path -Raw } else { '' }
    Write-Output "Perfil:  $path"
    Write-Output "Loader:  $(if ($loaded -match 'CiszuNetwork\.Profile') { 'OK' } else { 'NO INSTALADO' })"
  }
  Write-Output "Modulo:  $module"
  Write-Output "Repo:    $RepoRoot"
  exit 0
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
) | Select-Object -Unique
foreach (`$ciszuRoot in `$ciszuCandidates) {
  if ([string]::IsNullOrWhiteSpace([string]`$ciszuRoot)) { continue }
  try {
    if (-not (Test-Path -LiteralPath `$ciszuRoot -PathType Container -ErrorAction Stop)) { continue }
    `$ciszuModule = Join-Path `$ciszuRoot 'shared\powershell\CiszuNetwork.Profile.ps1'
    if (Test-Path -LiteralPath `$ciszuModule -PathType Leaf -ErrorAction Stop) {
      . `$ciszuModule
      return
    }
  } catch {
    continue
  }
}
"@

foreach ($path in $profilePaths) {
  $profileDir = Split-Path -Parent $path
  if (-not (Test-Path -LiteralPath $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
  }
  if (Test-Path -LiteralPath $path) {
    $backup = "$path.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -LiteralPath $path -Destination $backup -Force
    Write-Output "Backup: $backup"
  }
  Set-Content -LiteralPath $path -Value $loader -Encoding UTF8
  Write-Output "Instalado: $path"
}
Write-Output "Modulo:    $escapedModule"
