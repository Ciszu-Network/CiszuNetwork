@echo off
rem opencode-restart.cmd - Reinicia el servidor headless de opencode (opencode serve :4096).
rem Necesario para que cargue el plugin de voz (tui.json) y las nuevas variables de entorno.
rem Uso: opencode-restart.cmd  (desde cualquier lugar si esta en PATH)
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