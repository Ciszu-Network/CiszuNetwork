@echo off
rem opencode-run.cmd - Lanzador por defecto de opencode (sesion con reload del server).
rem Flujo:
rem   1. Consola local (PC): abre la sesion DENTRO de Windows Terminal (WT) para
rem      fuente correcta, UTF-8 (tildes) y Ctrl+Enter como salto de linea.
rem      - Si no eres admin -> abre WT elevado (UAC).
rem      - Si ya estás en WT sin admin -> abre WT elevado (UAC).
rem   2. Sesion remota SSH/Termius: NO toca WT (usa su propio terminal), NO eleva.
rem   3. Mata el listener de 4096 si escucha (recarga plugin/entorno/config).
rem   4. Delega en opencode-ciszu-pc (ensure server + attach al puerto 4096).
rem Uso: opencode-run  (en PATH, visible tambien desde el servidor remoto SSH)
setlocal EnableExtensions
chcp 65001 >nul

rem Sesion remota SSH/RDP: sin WT, sin elevacion. Directo al reload.
if /i not "%SESSIONNAME%"=="Console" goto reload

rem Comprueba si ya somos administrador
net session >nul 2>&1
if errorlevel 1 goto not_admin

rem Admin + consola local. Si NO estamos en Windows Terminal, abrir ahí una pestaña nueva.
if defined WT_SESSION goto reload
echo [opencode] Abriendo en Windows Terminal...
powershell -NoProfile -Command "Start-Process wt.exe -WorkingDirectory '%~dp0' -ArgumentList 'cmd','/c','%~f0'"
ping -n 4 127.0.0.1 >nul
exit /b 0

:not_admin
rem Consola local sin admin: relanzar elevado dentro de Windows Terminal (UAC).
echo [opencode] Elevando a administrador en Windows Terminal...
powershell -NoProfile -Command "Start-Process wt.exe -Verb RunAs -WorkingDirectory '%~dp0' -ArgumentList 'cmd','/c','%~f0'"
ping -n 4 127.0.0.1 >nul
exit /b 0

:reload
echo [opencode] Deteniendo el servidor en el puerto 4096 (recarga de config)...
net session >nul 2>&1
set HASADMIN=%errorlevel%
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 4096 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en 4096' }"
ping -n 2 127.0.0.1 >nul

rem Delega en opencode-ciszu-pc (ensure server + attach al puerto elegido)
call opencode-ciszu-pc
exit /b %errorlevel%