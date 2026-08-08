@echo off
rem ============================================================
rem ciszu-ai.cmd - Lanzador OFICIAL de sesiones de Ciszu-AI (opencode).
rem Tool: tools/ciszu-ai/ (fuente unica). Los .cmd/.bat de PATH son stubs
rem que delegan a la tool via espejo sin espacios (C:\Users\fplay\ciszu-ai\).
rem
rem Comportamiento:
rem   - Por defecto: NO reinicia el servidor. Solo garantiza que el
rem     server de 127.0.0.1:4096 este vivo (ensure-server.ps1, idempotente)
rem     y adjunta la sesion compartida con `opencode attach`.
rem   - `reset`: reinicia el server (para + ensure + attach).
rem   - `server`: solo garantizar/levantar el server (sin attach, sin parar).
rem   - `stop`: detener el server de 4096.
rem
rem Navegacion de consola:
rem   1. Consola local (PC): abre la sesion DENTRO de Windows Terminal (WT)
rem      para fuente correcta, UTF-8 y Ctrl+Enter como salto de linea.
rem      - Si no eres admin -> abre WT elevado (UAC).
rem   2. Sesion remota SSH/Termius: NO toca WT (usa su propio terminal), NO eleva.
rem
rem Uso:
rem   ciszu-ai              entrar/adjuntar sin reiniciar (NO mata el server)
rem   ciszu-ai reset        reiniciar el server (detener + ensure + attach)
rem   ciszu-ai server       solo garantizar/levantar el server (sin attach)
rem   ciszu-ai stop         detener el server de 4096
rem
rem Stubs en PATH (C:\Users\fplay y AppData\Roaming\npm):
rem   ciszu-ai-pc / ciszu-ai-cel            -> entrar (sin reiniciar)
rem   opencode-ciszu-pc / opencode-ciszu-cel -> alias de entrar
rem   ciszu-ai-reset / opencode-ciszu-reset   -> reiniciar server
rem   ciszu-ai-stop  / opencode-ciszu-stop    -> detener server
rem   opencode-run  -> alias legacy de entrar
rem   (cada uno con su version .bat equivalente)
rem
rem NOTA: SOLO ASCII + CRLF en este archivo (cmd.exe lee con codepage
rem 850/1252; caracteres UTF-8 como tildes/em-dash corrompen el parseo).
rem ============================================================
setlocal EnableExtensions
chcp 65001 >nul

set "TOOL_DIR=%~dp0"
set "ENSURE=%TOOL_DIR%ensure-server.ps1"
set "PORT=4096"

rem ---- Subcomandos ----
if /i "%~1"=="reset" goto cmd_reset
if /i "%~1"=="server" goto cmd_server
if /i "%~1"=="stop" goto cmd_stop

rem ---- Sesion remota SSH/RDP: sin WT, sin elevacion -> attach directo ----
if /i not "%SESSIONNAME%"=="Console" goto do_attach

rem ---- Consola local: comprobar admin ----
net session >nul 2>&1
if errorlevel 1 goto not_admin

rem ---- Admin + consola local: si NO estamos en WT, abrir ventana nueva ----
if defined WT_SESSION goto do_attach
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
goto do_attach

:do_attach
rem --- Garantiza el server (si no responde) y adjunta la sesion compartida ---
powershell -NoProfile -ExecutionPolicy Bypass -File "%ENSURE%" -Port %PORT%
if errorlevel 1 (
    echo [ciszu-ai] No se pudo preparar el server. Revisa .opencode-tmp\opencode-server-err.log
    pause
    exit /b 1
)
opencode attach http://127.0.0.1:%PORT%
exit /b %errorlevel%