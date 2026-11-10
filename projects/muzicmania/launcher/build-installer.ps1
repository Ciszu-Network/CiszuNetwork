$ErrorActionPreference = "Stop"

$LauncherRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $LauncherRoot
$WebsiteRoot = Join-Path $ProjectRoot "website"
$TauriCli = Join-Path $WebsiteRoot "node_modules\.bin\tauri.cmd"
$PatchScript = Join-Path $WebsiteRoot "scripts\patch-nsis-lang.ps1"
$TargetRoot = Join-Path $LauncherRoot "src-tauri\target\x86_64-pc-windows-msvc\release"
$Installer = Join-Path $TargetRoot "nsis\x64\nsis-output.exe"
$AppVersion = "2.1.1"
$InstallerVersion = "2.3.1"
$Names = @(
    "MuzicMania(v$AppVersion)_InstallerSetup(v$InstallerVersion)_Windows10_x64.exe",
    "MuzicMania(v$AppVersion)_InstallerSetup(v$InstallerVersion)_Windows11_x64.exe"
)

if (-not (Test-Path $TauriCli)) {
    throw "Tauri CLI no encontrado en $TauriCli"
}

Push-Location $LauncherRoot
try {
    & $TauriCli build --target x86_64-pc-windows-msvc --bundles nsis --ci --no-sign
    if ($LASTEXITCODE -ne 0) { throw "Tauri build fallo con codigo $LASTEXITCODE" }
} finally {
    Pop-Location
}

& powershell -NoProfile -ExecutionPolicy Bypass -File $PatchScript
if ($LASTEXITCODE -ne 0) { throw "El parche NSIS fallo con codigo $LASTEXITCODE" }

if (-not (Test-Path $Installer)) {
    throw "No se encontro el instalador final en $Installer"
}

$Size = (Get-Item $Installer).Length
if ($Size -lt 1000000) {
    throw "El instalador es demasiado pequeno: $Size bytes"
}

$WebsiteDownloads = Join-Path $WebsiteRoot "public\downloads"
$LauncherDownloads = Join-Path $LauncherRoot "downloads"
New-Item -ItemType Directory -Path $WebsiteDownloads -Force | Out-Null
New-Item -ItemType Directory -Path $LauncherDownloads -Force | Out-Null

foreach ($Name in $Names) {
    Copy-Item -LiteralPath $Installer -Destination (Join-Path $WebsiteDownloads $Name) -Force
    Copy-Item -LiteralPath $Installer -Destination (Join-Path $LauncherDownloads $Name) -Force
}

$Hash = (Get-FileHash -LiteralPath $Installer -Algorithm SHA256).Hash
Write-Host "Instalador listo: $Installer" -ForegroundColor Green
Write-Host "Tamano: $Size bytes" -ForegroundColor Green
Write-Host "SHA256: $Hash" -ForegroundColor Green
