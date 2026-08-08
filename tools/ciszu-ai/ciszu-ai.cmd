@echo off
rem ============================================================
rem ciszu-ai.cmd — Lanzador OFICIAL de sesiones de Ciszu-AI (opencode).
rem Tool: tools/ciszu-ai/  (fuente unica). Los .cmd de PATH son stubs
rem que delegan aqui: ciszu-ai, opencode-run, opencode-ciszu-pc/-cel.
rem
rem Comportamiento:
rem   1. Consola local (PC): abre la sesion DENTRO de Windows Terminal (WT)
rem      para fuente correcta, UTF-8 (tildes) y Ctrl+Enter como salto de linea.
rem      - Si no eres admin -> abre WT elevado (UAC).
rem   2. Sesion remota SSH/Termius: NO toca WT (usa su propio terminal), NO eleva.
rem   3. Mata el listener de 4096 si escucha (recarga plugin/entorno/config).
rem   4. ensure-server.ps1 levanta el server headless (idempotente) y `opencode
rem      attach` conecta a la sesion compartida.
rem
rem Uso:
rem   ciszu-ai            sesion completa (reload + ensure + attach)
rem   ciszu-ai server     solo garantizar/levantar el server (sin attach)
rem   ciszu-ai stop       detener el server de 4096
rem
rem ⚠️ Requiere CRLF (cmd.exe rompe con LF) y NUNCA parentesis en echo
rem    dentro de bloques if (rompe el parser de cmd).
rem ============================================================
setlocal EnableExtensions
chcp 65001 >nul

set "TOOL_DIR=%~dp0"
set "ENSURE=%TOOL_DIR%ensure-server.ps1"
set "PORT=4096"

rem ---- Subcomando: server (solo ensure, sin attach) ----
if /i "%~1"=="server" goto cmd_server
if /i "%~1"=="stop" goto cmd_stop

rem ---- Sesion remota SSH/RDP: sin WT, sin elevacion -> reload directo ----
if /i not "%SESSIONNAME%"=="Console" goto reload

rem ---- Consola local: comprobar admin ----
net session >nul 2>&1
if errorlevel 1 goto not_admin

rem ---- Admin + consola local. Si NO estamos en WT, abrir pestaña nueva ----
if defined WT_SESSION goto reload
echo [ciszu-ai] Abriendo en Windows Terminal...
powershell -NoProfile -Command "$wt='%~f0'; start wt.exe -WorkingDirectory '%TOOL_DIR%' -ArgumentList 'cmd','/c',$wt"
ping -n 4 127.0.0.1 >nul
exit /b 0

:not_admin
rem Consola local sin admin: relanzar elevado dentro de WT (UAC).
echo [ciszu-ai] Elevando a administrador en Windows Terminal...
powershell -NoProfile -Command "$wt='%~f0'; start wt.exe -Verb RunAs -WorkingDirectory '%TOOL_DIR%' -ArgumentList 'cmd','/c',$wt"
ping -n 4 127.0.0.1 >nul
exit /b 0

:cmd_server
echo [ciszu-ai] Garantizando server en 127.0.0.1:%PORT%
powershell -NoProfile -ExecutionPolicy Bypass -File "%ENSURE%" -Port %PORT%
exit /b %errorlevel%

:cmd_stop
echo [ciszu-ai] Deteniendo server en 127.0.0.1:%PORT%
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en %PORT%' }"
exit /b 0

:reload
echo [ciszu-ai] Deteniendo server en 127.0.0.1:%PORT% (recarga de config)...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en %PORT%' }"
ping -n 2 127.0.0.1 >nul

rem --- Levanta el servidor (si no responde) y adjunta la sesion compartida ---
powershell -NoProfile -ExecutionPolicy Bypass -File "%ENSURE%" -Port %PORT%
if errorlevel 1 (
    echo [ciszu-ai] No se pudo preparar el server. Revisa .opencode-tmp\opencode-server-err.log
    pause
    exit /b 1
)
opencode attach http://127.0.0.1:%PORT%
exit /b %errorlevel%