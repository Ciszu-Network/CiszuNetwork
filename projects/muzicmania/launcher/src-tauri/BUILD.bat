@echo off
title MuzicMania - Build Installer
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\build-installer.ps1"
if %errorlevel% neq 0 (
    echo ERROR: el build del instalador fallo
    pause
    exit /b 1
)
pause
