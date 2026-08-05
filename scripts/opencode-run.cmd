@echo off
rem opencode-run.cmd - Lanzador por defecto de opencode (server headless :4096 + attach).
rem Reinicia el servidor si hace falta (mata el listener de 4096, relanza via ensure y attach).
rem Necesario tras cambiar tui.json (plugin de voz) o variables de entorno.
rem Uso: opencode-run  (desde cualquier lugar si esta en PATH)
setlocal
echo [opencode] Deteniendo el servidor en el puerto 4096...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 4096 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en 4096' }"
timeout /t 1 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\fplay\opencode-server-ensure.ps1"
if errorlevel 1 (
    echo [opencode] No se pudo conectar al servidor. Revisa opencode-server-err.log
    pause
    exit /b 1
)
opencode attach http://127.0.0.1:4096
