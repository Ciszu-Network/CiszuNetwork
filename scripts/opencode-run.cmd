@echo off
rem opencode-run.cmd - Lanzador por defecto de opencode (sesion con reload del server).
rem Flujo:
rem   1. Consola local (PC): se auto-eleva a administrador (UAC) -> opencode corre elevado.
rem      Sesion remota (SSH/Termius): NO eleva (detecta SESSIONNAME).
rem   2. Mata el listener de 4096 si escucha (recarga plugin/entorno/config).
rem   3. Delega en opencode-ciszu-pc (ensure server + attach al puerto 4096) para
rem      reutilizar su logica de attach y no dejar ventanas huerfanas.
rem Uso: opencode-run  (en PATH, visible tambien desde el servidor remoto SSH)
setlocal

rem Auto-elevacion solo en consola local (PC), nunca en sesiones remotas SSH/RDP
if /i "%SESSIONNAME%"=="Console" (
    net session >nul 2>&1
    if errorlevel 1 (
        echo [opencode] Elevando a administrador (UAC)...
        powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
        echo [opencode] La sesion se abre en la nueva ventana elevada.
        timeout /t 3 >nul
        exit /b
    )
)

echo [opencode] Deteniendo el servidor en el puerto 4096 (recarga de config)...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 4096 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Output ('Stop PID ' + $c.OwningProcess) } else { Write-Output 'No habia servidor escuchando en 4096' }"
timeout /t 1 /nobreak >nul

rem Delega en opencode-ciszu-pc (ensure server + attach al puerto elegido)
call opencode-ciszu-pc
exit /b %errorlevel%