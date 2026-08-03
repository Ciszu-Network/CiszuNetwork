# =============================================================================
# MuzicMania - Script de Setup Completo para Build Tauri
# Autor: Ciszuko Antony | Herramienta: Antigravity AI
# Proyecto: E:\Ciszu Network\ciszu_proyects\muzic mania
# Uso: Ejecutar como Administrador en PowerShell (recomendado para Defender exclusion)
# =============================================================================

param(
    [switch]$SkipRust,
    [switch]$OnlyIcons,
    [switch]$SkipDefender,
    [switch]$Build
)

# -------------------------------------------------------
# RUTAS — Todo en E:\ para evitar el disco C (7 GB libre)
# ProjectRoot se calcula dinamicamente desde la ubicacion del script
# -------------------------------------------------------
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir   # sube un nivel: scripts/ -> raiz del proyecto

$env:CARGO_HOME  = "E:\.cargo"
$env:CARGO_TARGET_DIR = "$ProjectRoot\src-tauri\target"
$env:TEMP        = "E:\.tauri-temp"
$env:TMP         = "E:\.tauri-temp"
$env:PATH        = "$env:USERPROFILE\.cargo\bin;$env:PATH"

# Crear directorios en E: si no existen
foreach ($dir in @("E:\.cargo", "E:\.tauri-temp")) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

$TauriIconSrc = "$ProjectRoot\src-tauri\icons\app-icon-source.png"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   MuzicMania - Tauri Build Setup v2"      -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Proyecto : $ProjectRoot"                -ForegroundColor DarkGray
Write-Host "   CARGO    : $env:CARGO_HOME"             -ForegroundColor DarkGray
Write-Host "   TARGET   : $env:CARGO_TARGET_DIR"       -ForegroundColor DarkGray
Write-Host "   TEMP     : $env:TEMP"                   -ForegroundColor DarkGray
Write-Host ""

# -------------------------------------------------------
# PASO 0 (CRITICO): Excluir el proyecto de Windows Defender
# Esto evita el error "os error 32" (archivo en uso) durante
# la compilacion de Rust, causado por el AV escaneando .o/.rlib
# -------------------------------------------------------
if (-not $SkipDefender) {
    Write-Host "[0/4] Agregando exclusion de Windows Defender..." -ForegroundColor Yellow
    try {
        $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        if ($isAdmin) {
            Add-MpPreference -ExclusionPath $ProjectRoot -ErrorAction SilentlyContinue
            Add-MpPreference -ExclusionPath "E:\.cargo"  -ErrorAction SilentlyContinue
            Write-Host "      Exclusion de Defender aplicada. (evita os error 32)" -ForegroundColor Green
        } else {
            Write-Host "      AVISO: No se ejecuto como Admin. Si el build falla con 'os error 32'," -ForegroundColor Yellow
            Write-Host "      re-ejecuta PowerShell como Administrador o usa -SkipDefender." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "      No se pudo aplicar exclusion de Defender (no critico)." -ForegroundColor DarkGray
    }
} else {
    Write-Host "[0/4] Saltando exclusion de Defender (-SkipDefender activado)" -ForegroundColor DarkGray
}

# -------------------------------------------------------
# PASO 1: Verificar e instalar Rust
# -------------------------------------------------------
Write-Host ""
if (-not $SkipRust) {
    Write-Host "[1/4] Verificando instalacion de Rust..." -ForegroundColor Yellow
    $rustExists = Get-Command rustc -ErrorAction SilentlyContinue
    $cargoPath  = "$env:USERPROFILE\.cargo\bin\rustc.exe"

    if (-not $rustExists -and -not (Test-Path $cargoPath)) {
        Write-Host "      Rust no encontrado. Instalando via rustup..." -ForegroundColor Red
        $rustupInstaller = "$env:TEMP\rustup-init.exe"
        Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $rustupInstaller
        Start-Process -FilePath $rustupInstaller -ArgumentList "--default-toolchain stable --profile minimal -y" -Wait
        $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
        Write-Host "      Rust instalado correctamente." -ForegroundColor Green
    } else {
        $rustVersion = & rustc --version 2>$null
        Write-Host "      Rust encontrado: $rustVersion" -ForegroundColor Green
    }
} else {
    Write-Host "[1/4] Saltando verificacion de Rust (-SkipRust activado)" -ForegroundColor DarkGray
}

# -------------------------------------------------------
# PASO 2: Verificar WebView2 Runtime
# -------------------------------------------------------
Write-Host ""
Write-Host "[2/4] Verificando WebView2 Runtime..." -ForegroundColor Yellow
$webview2Key     = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
$webview2KeyUser = "HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"

if ((Test-Path $webview2Key) -or (Test-Path $webview2KeyUser)) {
    Write-Host "      WebView2 Runtime encontrado. OK" -ForegroundColor Green
} else {
    Write-Host "      WebView2 Runtime NO encontrado. Descargando instalador..." -ForegroundColor Red
    $wv2Installer = "$env:TEMP\MicrosoftEdgeWebview2Setup.exe"
    Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $wv2Installer
    Start-Process -FilePath $wv2Installer -ArgumentList "/silent /install" -Wait
    Write-Host "      WebView2 Runtime instalado." -ForegroundColor Green
}

# -------------------------------------------------------
# PASO 3: Verificar/generar iconos
# -------------------------------------------------------
Write-Host ""
Write-Host "[3/4] Verificando iconos para Tauri..." -ForegroundColor Yellow
$iconsDir   = "$ProjectRoot\src-tauri\icons"
$iconFiles  = @("32x32.png", "128x128.png", "128x128@2x.png", "icon.ico")
$allIconsExist = $true

if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

foreach ($icon in $iconFiles) {
    if (-not (Test-Path "$iconsDir\$icon")) { $allIconsExist = $false; break }
}

if (-not $allIconsExist) {
    if (Test-Path $TauriIconSrc) {
        Set-Location $ProjectRoot
        & pnpm tauri icon $TauriIconSrc
        Write-Host "      Iconos generados desde: $TauriIconSrc" -ForegroundColor Green
    } else {
        Write-Host "      ADVERTENCIA: No se encontro icono fuente en $TauriIconSrc" -ForegroundColor Yellow
        Write-Host "      Continuando con iconos por defecto..." -ForegroundColor DarkGray
    }
} else {
    Write-Host "      Iconos ya existen. OK" -ForegroundColor Green
}

if ($OnlyIcons) {
    Write-Host ""
    Write-Host "Modo -OnlyIcons: Finalizado." -ForegroundColor Cyan
    exit 0
}

# -------------------------------------------------------
# PASO 4: Compilar Tauri
# -------------------------------------------------------
Write-Host ""
Write-Host "[4/4] Compilando ejecutable Tauri para Windows..." -ForegroundColor Yellow
Write-Host "      Cargo HOME : $env:CARGO_HOME" -ForegroundColor DarkGray
Write-Host "      Target     : $env:CARGO_TARGET_DIR" -ForegroundColor DarkGray
Write-Host "      Nota: La primera compilacion tarda 5-15 min." -ForegroundColor DarkGray
Write-Host ""

Set-Location $ProjectRoot
& pnpm tauri build

# Patch NSIS to force language selector dialog every time
Write-Host ""
Write-Host "[+] Parcheando NSIS para forzar selector de idioma..." -ForegroundColor Yellow
& "$ScriptDir\patch-nsis-lang.ps1"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "   BUILD EXITOSO!"                          -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Instalador en:" -ForegroundColor White
    Write-Host "   $ProjectRoot\src-tauri\target\release\bundle\nsis\" -ForegroundColor Cyan
    Write-Host ""
    
    $downloadsDir = "$ProjectRoot\public\downloads"
    if (-not (Test-Path $downloadsDir)) {
        New-Item -ItemType Directory -Path $downloadsDir | Out-Null
    }
    
    # Obtener la version de la app desde tauri.conf.json
    $tauriConf = Get-Content "$ProjectRoot\src-tauri\tauri.conf.json" | ConvertFrom-Json
    $appVersion = $tauriConf.version
    $installerVersion = "2.1.3"
    $arch = "x64"
    
    Write-Host "[+] Copiando instalador NSIS a public/downloads/ ..." -ForegroundColor Yellow
    $nsisOutput = "$ProjectRoot\src-tauri\target\release\nsis\x64\nsis-output.exe"
    $bundleExe = "$ProjectRoot\src-tauri\target\release\bundle\nsis\MuzicMania_$($appVersion)_x64-setup.exe"
    
    # Copy from patched output (nsis-output.exe) or bundle as fallback
    $srcExe = if (Test-Path $nsisOutput) { $nsisOutput } elseif (Test-Path $bundleExe) { $bundleExe } else { $null }
    if ($srcExe) {
        @("Windows10", "Windows11") | ForEach-Object {
            $name = "MuzicMania(v$appVersion)_InstallerSetup(v$installerVersion)_${_}_$arch.exe"
            Copy-Item $srcExe -Destination "$downloadsDir\$name" -Force
            $size = [math]::Round((Get-Item "$downloadsDir\$name").Length / 1KB)
            Write-Host "      Copiado: $name ($size KB)" -ForegroundColor Green
        }
    } else {
        Write-Host "      ERROR: No se encontró el instalador compilado" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Sube el instalador .exe a GitHub Releases." -ForegroundColor White

} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "   ERROR EN LA COMPILACION"                 -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Causas comunes:" -ForegroundColor Yellow
    Write-Host "  - 'os error 32' = Windows Defender bloqueando .o/.rlib -> Re-ejecuta como Admin" -ForegroundColor White
    Write-Host "  - 'os error 112' = Sin espacio en disco -> Verifica E:\" -ForegroundColor White
    Write-Host "  - Rust no en PATH -> Cierra y vuelve a abrir PowerShell" -ForegroundColor White
    Write-Host ""
    Write-Host "Soporte: https://tauri.app/start/prerequisites/" -ForegroundColor DarkGray
}
