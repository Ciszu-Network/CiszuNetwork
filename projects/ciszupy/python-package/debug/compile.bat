@echo off
setlocal enabledelayedexpansion
cls
echo ==========================================
echo Building new CiszuPY version...
echo ==========================================

:: Check if pyinstaller is installed
where pyinstaller >nul 2>&1
if errorlevel 1 (
    echo [INFO] PyInstaller not found. Installing...
    python -m pip install pyinstaller
    if errorlevel 1 (
        echo [ERROR] Failed to install PyInstaller.
        pause
        exit /b 1
    )
)

:: Clean previous builds
if exist "dist" (
    echo [INFO] Cleaning previous builds...
    rmdir /s /q dist
    if errorlevel 1 (
        echo [ERROR] Failed to remove dist folder.
        pause
        exit /b 1
    )
)

if exist "build" (
    echo [INFO] Cleaning previous builds...
    rmdir /s /q build
    if errorlevel 1 (
        echo [ERROR] Failed to remove build folder.
        pause
        exit /b 1
    )
)

:: Build
echo [INFO] Building...
pyinstaller --onedir --icon="public\images\icon.ico" --version-file="file_version_info.txt" --console --hidden-import=ciszupy --hidden-import=ciszupy.modules --hidden-import=typer --hidden-import=rich --hidden-import=keyboard --paths=src src\ciszupy\main.py --name ciszupy --clean

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed. Check the messages above.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Build finished! Check the dist\ folder
echo ==========================================
pause
