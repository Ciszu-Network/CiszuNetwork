@echo off
setlocal
title CiszuPY Run

:: 1. Verificar entorno virtual
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR CRITICO] No se encuentra el archivo .venv\Scripts\python.exe
    goto :error
)

:: 2. Ejecutar APP
set "PATH=%~dp0.venv\Scripts;%PATH%"
ciszupy

if %errorlevel% neq 0 (
    echo.
    echo [AVISO] El script termino con codigo de error: %errorlevel%
)
