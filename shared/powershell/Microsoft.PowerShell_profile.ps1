# Perfil personal de PowerShell (Windows).
# Solo dos cosas: fastfetch y el comando `ciszu` para entrar al perfil de la empresa.
# No define prompt, ni alias, ni banner: es un perfil normal.

$ErrorActionPreference = 'Continue'

# --- Raiz del repo (solo para localizar el perfil corporativo) --------------
$script:CiszuRepo = $null
$candidates = @(
  $env:CISZU_REPO,
  'E:\Ciszu Network',
  (Join-Path $HOME 'Ciszu Network'),
  (Join-Path $HOME 'source\repos\CiszuNetwork')
) | Where-Object { $_ } | Select-Object -Unique
foreach ($candidate in $candidates) {
  try {
    if (Test-Path -LiteralPath $candidate -PathType Container -ErrorAction Stop) {
      $script:CiszuRepo = (Resolve-Path -LiteralPath $candidate).Path
      break
    }
  } catch { continue }
}

# --- Fastfetch (si esta instalado; fallback a WinGet Links) -----------------
if (-not (Get-Command fastfetch -ErrorAction SilentlyContinue)) {
  $wingetLinks = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links'
  $ffExe = Join-Path $wingetLinks 'fastfetch.exe'
  if (Test-Path -LiteralPath $ffExe) { $env:Path = "$wingetLinks;$env:Path" }
}
if (Get-Command fastfetch -ErrorAction SilentlyContinue) {
  $cfg = if ($script:CiszuRepo) { Join-Path $script:CiszuRepo 'shared\fastfetch\config.jsonc' } else { '' }
  if ($cfg -and (Test-Path -LiteralPath $cfg)) { fastfetch --config $cfg } else { fastfetch }
} elseif (Get-Command winfetch -ErrorAction SilentlyContinue) {
  winfetch
} elseif (Get-Command neofetch -ErrorAction SilentlyContinue) {
  neofetch
}

# --- Entrar al perfil corporativo ------------------------------------------
# Se abre una sesion nueva con el perfil de Ciszu; al salir (exit) vuelves aqui.
function ciszu {
  if (-not $script:CiszuRepo) {
    Write-Host 'No se encontro el repo. Define CISZU_REPO o clona CiszuNetwork.' -ForegroundColor Yellow
    return
  }
  $module = Join-Path $script:CiszuRepo 'shared\powershell\CiszuNetwork.Profile.ps1'
  if (-not (Test-Path -LiteralPath $module)) {
    Write-Host "No existe el perfil corporativo: $module" -ForegroundColor Red
    return
  }
  $exe = if ($PSVersionTable.PSEdition -eq 'Desktop') {
    Join-Path $PSHOME 'powershell.exe'
  } else {
    Join-Path $PSHOME 'pwsh.exe'
  }
  $cwd = $PWD.Path.Replace("'", "''")
  $mod = $module.Replace("'", "''")
  Clear-Host
  & $exe -NoLogo -NoExit -NoProfile -Command "Set-Location -LiteralPath '$cwd'; . '$mod'"
}
