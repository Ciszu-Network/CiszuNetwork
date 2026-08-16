# runner-install.ps1 — Instalación y arranque del Self-Hosted Runner de GitHub
# de Ciszu Network (sistema híbrido, ver ACTIONS_RUNNERS_SYSTEM.md).
#
# Instala el runner de GitHub Actions en este PC (Windows x64) para ejecutar los
# workflows sin consumir minutos de la organización. Funciona por polling saliente
# (no abre puertos). Requiere VPN/red que resuelva github.com.
#
# Uso:
#   .\scripts\runner-install.ps1 install      # descarga, configura e instala como servicio
#   .\scripts\runner-install.ps1 start        # arranca el servicio
#   .\scripts\runner-install.ps1 stop         # detiene el servicio
#   .\scripts\runner-install.ps1 run          # modo manual (pruebas, no servicio)
#   .\scripts\runner-install.ps1 uninstall    # elimina el runner y el servicio
#   .\scripts\runner-install.ps1 status       # estado del servicio
#
# Configuración:
#   - $RUNNER_VERSION : versión del paquete (default 2.336.0)
#   - $REPO_URL       : https://github.com/Ciszu-Network/CiszuNetwork
#   - $TOKEN          : RUNNER_REGISTRATION_TOKEN (del vault, ver abajo)
#   - $RUNNER_DIR     : E:\actions-runner (rutas sin espacios: RunnerService.exe falla
#     si el binPath contiene espacios)
#
# El token de registro es de UN SOLO uso y expira. Se lee de .env.local (vault),
# nunca se hardcodea ni se commitea.

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('install', 'uninstall', 'start', 'stop', 'run', 'status')]
  [string]$Action
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$RunnerVersion = '2.336.0'
$RepoUrl = 'https://github.com/Ciszu-Network/CiszuNetwork'
$RunnerDir = 'E:\actions-runner'
$Sha256Zip = 'd59123a43003e357b0805b5d0f611d0bd2f65ab67d51bd070dd4e7a0f685c162'
$ZipUrl = "https://github.com/actions/runner/releases/download/v$RunnerVersion/actions-runner-win-x64-$RunnerVersion.zip"
$ZipPath = Join-Path $RunnerDir "actions-runner-win-x64-$RunnerVersion.zip"

function Get-RunnerToken {
  $envFile = Join-Path $repo '.env.local'
  if (-not (Test-Path $envFile)) { throw 'No existe .env.local (vault). Ejecutar vault decrypt o copiar.' }
  $line = Get-Content $envFile | Where-Object { $_ -match '^RUNNER_REGISTRATION_TOKEN\s*=' } | Select-Object -First 1
  if (-not $line) { throw 'RUNNER_REGISTRATION_TOKEN no está en .env.local' }
  return $line.Split('=', 2)[1].Trim()
}

switch ($Action) {
  'install' {
    if (-not (Test-Path $RunnerDir)) { New-Item -ItemType Directory -Force -Path $RunnerDir | Out-Null }

    Write-Host '[runner] Descargando runner...'
    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath

    $hash = (Get-FileHash -Path $ZipPath -Algorithm SHA256).Hash.ToUpper()
    if ($hash -ne $Sha256Zip.ToUpper()) { throw "Checksum no coincide: $hash" }
    Write-Host '[runner] Checksum OK.'

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    Get-ChildItem $RunnerDir -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    [System.IO.Compression.ZipFile]::ExtractToDirectory($ZipPath, $RunnerDir)
    Remove-Item $ZipPath -Force

    $token = Get-RunnerToken
    Write-Host '[runner] Configurando runner y registrando servicio (--runasservice)...'
    Push-Location $RunnerDir
    try {
      # --unattended evita prompts; --runasservice registra e instala el servicio de Windows
      & .\config.cmd --unattended --url $RepoUrl --token $token --runasservice
      if ($LASTEXITCODE -ne 0) { throw 'config.cmd falló' }
    } finally { Pop-Location }

    Write-Host '[runner] Instalado. Arrancar con: .\scripts\runner-install.ps1 start'
  }
  'uninstall' {
    Get-Service 'actions.runner.Ciszu-Network-CiszuNetwork.*' -ErrorAction SilentlyContinue |
      ForEach-Object { Stop-Service $_.Name -ErrorAction SilentlyContinue; sc.exe delete $_.Name | Out-Null }
    if (Test-Path (Join-Path $RunnerDir '.runner')) {
      Push-Location $RunnerDir
      try { & .\config.cmd remove --local; if ($LASTEXITCODE -ne 0) { throw 'remove local falló' } } finally { Pop-Location }
    }
    Write-Host '[runner] Runner y servicio eliminados.'
  }
  'start' {
    Get-Service 'actions.runner.Ciszu-Network-CiszuNetwork.*' | ForEach-Object { Start-Service $_.Name }
    Write-Host '[runner] Servicios del runner arrancados.'
  }
  'stop' {
    Get-Service 'actions.runner.Ciszu-Network-CiszuNetwork.*' | ForEach-Object { Stop-Service $_.Name }
    Write-Host '[runner] Servicios del runner detenidos.'
  }
  'run' {
    Push-Location $RunnerDir
    try { & .\run.cmd } finally { Pop-Location }
  }
  'status' {
    Get-Service | Where-Object { $_.Name -match 'actions.runner' } | Select-Object Name, Status
  }
}
