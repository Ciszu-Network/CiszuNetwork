param(
  [switch]$Check,
  [switch]$Corporate,
  [string]$RepoRoot = ''
)

$ErrorActionPreference = 'Stop'

if (-not $RepoRoot) {
  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}
$RepoRoot = (Resolve-Path $RepoRoot).Path

# Por defecto se instala el perfil PERSONAL; el corporativo se carga con `ciszu`.
$moduleName = if ($Corporate) { 'CiszuNetwork.Profile.ps1' } else { 'Microsoft.PowerShell_profile.ps1' }
$module = Join-Path $RepoRoot "shared\powershell\$moduleName"
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
    Write-Output "Loader:  $(if ($loaded -match [regex]::Escape($moduleName)) { 'OK' } else { 'NO INSTALADO' })"
  }
  Write-Output "Modulo:  $module"
  Write-Output "Modo:    $(if ($Corporate) { 'corporativo' } else { 'personal + ciszu' })"
  Write-Output "Repo:    $RepoRoot"
  exit 0
}

$escapedModule = $module.Replace("'", "''")
$escapedRepo = $RepoRoot.Replace("'", "''")
$escapedModuleName = $moduleName.Replace("'", "''")
$loader = @"
# Personal PowerShell profile loader (repo-managed).
# Generado por shared/powershell/install-profile.ps1.
`$ciszuCandidates = @(
  `$env:CISZU_REPO,
  '$escapedRepo',
  'E:\Ciszu Network',
  (Join-Path `$HOME 'Ciszu Network'),
  (Join-Path `$HOME 'source\repos\CiszuNetwork')
) | Where-Object { `$_ } | Select-Object -Unique
foreach (`$ciszuRoot in `$ciszuCandidates) {
  if ([string]::IsNullOrWhiteSpace([string]`$ciszuRoot)) { continue }
  try {
    if (-not (Test-Path -LiteralPath `$ciszuRoot -PathType Container -ErrorAction Stop)) { continue }
    `$env:CISZU_REPO = (Resolve-Path -LiteralPath `$ciszuRoot).Path
    `$ciszuModule = Join-Path `$ciszuRoot 'shared\powershell\$escapedModuleName'
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
Write-Output "Modo:      $(if ($Corporate) { 'corporativo' } else { 'personal + ciszu' })"
