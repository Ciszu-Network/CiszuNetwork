@echo off
rem ============================================================
rem ciszu-ai.cmd - Lanzador OFICIAL de sesiones de Ciszu-AI (opencode).
rem Tool: tools/ciszu-ai/ (fuente unica). Los .cmd/.bat de PATH son stubs
rem que delegan a la tool via espejo sin espacios (C:\Users\fplay\ciszu-ai\).
rem
rem Comportamiento:
rem   - Por defecto: NO reinicia el servidor. Abre `attach-session.ps1`
rem     en POWERSHELL dentro de Windows Terminal (UTF-8, Ctrl+Enter).
rem     - Consola local sin admin: wt.exe -Verb RunAs (UAC, PowerShell).
rem     - Consola local con admin: wt.exe directo (PowerShell).
rem     - Sesion remota SSH/Termius: powershell -File directo (sin WT).
rem   - `reset`: reinicia el server (para + ensure + attach).
rem   - `server`: solo garantizar/levantar el server (sin attach).
rem   - `stop`: detener el server de 4096.
rem
rem Uso:
rem   ciszu-ai              entrar/adjuntar sin reiniciar (NO mata el server)
rem   ciszu-ai reset        reiniciar el server (detener + ensure + attach)
rem   ciszu-ai server       solo garantizar/levantar el server (sin attach)
rem   ciszu-ai stop         detener el server de 4096
rem
rem Stubs en PATH (C:\Users\fplay y AppData\Roaming\npm, .cmd y .bat):
rem   ciszu-ai-pc / ciszu-ai-cel           -> entrar (sin reiniciar)
rem   opencode-ciszu-pc / opencode-ciszu-cel -> alias de entrar
rem   ciszu-ai-start / opencode-ciszu-start  -> arrancar/garantizar server
rem   ciszu-ai-stop  / opencode-ciszu-stop   -> detener server
rem   ciszu-ai-reset / opencode-ciszu-reset  -> reiniciar server
rem   opencode-run      -> alias legacy de entrar
rem
rem NOTA: SOLO ASCII + CRLF (cmd.exe lee en codepage 850/1252; tildes y
rem caracteres UTF-8 corrompen el parseo). Rutas 8.3 (%~sdp0) en los
rem relanzamientos para que los espacios de la ruta no rompan wt.exe.
rem ============================================================
setlocal EnableExtensions
chcp 65001 >nul

set "TOOL_DIR=%~dp0"
set "ENSURE=%TOOL_DIR%ensure-server.ps1"
set "ATTACH_PS=%TOOL_DIR%attach-session.ps1"
set "PORT=4096"

rem ---- Subcomandos ----
if /i "%~1"=="reset" goto cmd_reset
if /i "%~1"=="server" goto cmd_server
if /i "%~1"=="stop" goto cmd_stop

rem ---- Sesion remota SSH/RDP: sin WT, sin elevacion -> script directo ----
if /i not "%SESSIONNAME%"=="Console" goto do_attach

rem ---- Consola local: comprobar admin ----
net session >nul 2>&1
if errorlevel 1 goto not_admin

rem ---- Admin + consola local ----
if defined WT_SESSION goto do_attach
echo [ciszu-ai] Abriendo Windows Terminal con PowerShell...
powershell -NoProfile -Command "$ps='%~sdp0attach-session.ps1'; start wt.exe -WorkingDirectory '%~sdp0' -ArgumentList 'powershell','-NoProfile','-ExecutionPolicy','Bypass','-File',$ps"
ping -n 4 127.0.0.1 >nul
exit /b 0

:not_admin
rem Consola local sin admin: relanzar elevado dentro de WT en PowerShell.
echo [ciszu-ai] Elevando a administrador en Windows Terminal (PowerShell)...
powershell -NoProfile -Command "$ps='%~sdp0attach-session.ps1'; start wt.exe -Verb RunAs -WorkingDirectory '%~sdp0' -ArgumentList 'powershell','-NoProfile','-ExecutionPolicy','Bypass','-File',$ps"
ping -n 4 127.0.0.1 >nul
exit /b 0

:cmd_server
echo [ciszu-ai] Garantizando server en 127.0.0.1:%PORT% (sin parar, sin attach)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ENSURE%" -Port %PORT%
exit /b %errorlevel%

:cmd_stop
echo [ciszu-ai] Deteniendo server en 127.0.0.1:%PORT% ...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en %PORT%' }"
exit /b 0

:cmd_reset
echo [ciszu-ai] Reiniciando server en 127.0.0.1:%PORT% ...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en %PORT%' }"
ping -n 2 127.0.0.1 >nul
goto run_attach

:run_attach
:do_attach
rem --- Garantiza el server (si no responde) y adjunta en PowerShell ---
if not exist "%ATTACH_PS%" (
    echo [ciszu-ai] No existe %ATTACH_PS% - revisa la instalacion de la tool.
    pause
    exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%ATTACH_PS%" -Port %PORT%
exit /b %errorlevel%