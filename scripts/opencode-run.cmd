@echo off
rem opencode-run.cmd - Lanzador por defecto de opencode (server headless :4096 + attach).
rem - Consola local (PC): se auto-eleva a administrador (UAC) -> opencode corre elevado.
rem - Sesion remota (SSH/Termius): NO eleva; mismo ensure + attach sobre 127.0.0.1:4096
rem   (visible y usable desde el servidor remoto SSH: opencode-run).
rem Necesario tras cambiar tui.json (plugin de voz) o variables de entorno.
rem Uso: opencode-run  (en PATH)
setlocal

rem Auto-elevacion solo en consola local (PC), nunca en sesiones remotas SSH/RDP
if /i "%SESSIONNAME%"=="Console" (
    net session >nul 2>&1
    if errorlevel 1 (
        echo [opencode] Elevando a administrador (UAC)...
        powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
        exit /b
    )
)

echo [opencode] Deteniendo el servidor en el puerto 4096...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 4096 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en 4096' }"
timeout /t 1 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\fplay\opencode-server-ensure.ps1"
if errorlevel 1 (
    echo [opencode] No se pudo conectar al servidor. Revisa opencode-server-err.log
    exit /b 1
)
opencode attach http://127.0.0.1:4096