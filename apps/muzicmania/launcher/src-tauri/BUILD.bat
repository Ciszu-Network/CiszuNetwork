@echo off
title MuzicMania - Build Script
cd /d "%~dp0"

echo === MuzicMania Build Script ===
echo.
echo TARGET: x86_64-pc-windows-msvc (64 bits)
echo OUTPUT: target\x86_64-pc-windows-msvc\release\bundle\
echo.

echo [1/4] Verificando dependencias...
pnpm install --frozen-lockfile --ignore-scripts 2>nul || pnpm install
if %errorlevel% neq 0 (
    echo ERROR: pnpm install fallo
    pause
    exit /b 1
)

echo [2/4] Ejecutando lint...
call pnpm run lint
if %errorlevel% neq 0 (
    echo ERROR: lint fallo
    pause
    exit /b 1
)

echo [3/4] Construyendo instalador Tauri...
call pnpm tauri build --target x86_64-pc-windows-msvc
if %errorlevel% neq 0 (
    echo ERROR: Tauri build fallo
    pause
    exit /b 1
)

echo.
echo === COPIANDO INSTALADORES A public/downloads/ ===
set BUNDLE_DIR=target\x86_64-pc-windows-msvc\release\bundle

copy /Y "%BUNDLE_DIR%\nsis\MuzicMania_2.0.0_x64-setup.exe" "..\public\downloads\muzicmania_installer_windows11_x64.exe" >nul
if %errorlevel% equ 0 (
    echo [OK] NSIS copiado a public/downloads/
) else (
    echo [WARN] NSIS no se pudo copiar
)

copy /Y "%BUNDLE_DIR%\msi\MuzicMania_2.0.0_x64_es-ES.msi" "..\public\downloads\muzicmania_installer_windows10_x64.msi" >nul
if %errorlevel% equ 0 (
    echo [OK] MSI copiado a public/downloads/
) else (
    echo [WARN] MSI no se pudo copiar
)

echo.
echo === BUILD COMPLETADO EXITOSAMENTE ===
echo.
echo Instaladores generados:
echo   - NSIS: %BUNDLE_DIR%\nsis\MuzicMania_2.0.0_x64-setup.exe
echo   - MSI:  %BUNDLE_DIR%\msi\MuzicMania_2.0.0_x64_es-ES.msi
echo.
echo Copiados a: ..\public\downloads\
echo   - muzicmania_installer_windows11_x64.exe
echo   - muzicmania_installer_windows10_x64.msi
echo.
echo NOTA: Los cambios de interfaz (titlebar, atajos, audio) estan en
echo el frontend de Next.js y requieren deploy a Vercel para verse.
echo Los cambios de Rust (metadatos, cierre ventana) si estan en el binario.
pause
