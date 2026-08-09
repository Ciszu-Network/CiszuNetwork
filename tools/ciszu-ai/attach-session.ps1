# attach-session.ps1 - Adjunta la sesion compartida de opencode (127.0.0.1:PORT)
# Lanzador oficial: garantiza el server (ensure-server.ps1, idempotente) y hace
# `opencode attach` para entrar en la sesion en vivo (PC/movil comparten la misma).
#
# Uso:
#   powershell -NoProfile -ExecutionPolicy Bypass -File attach-session.ps1
#   -Port <n>      puerto (default 4096)
#   -RepoRoot <d>  raiz del repo (default: derivada del script o espejo)
#   -Exe <ruta>    binario opencode (default: npm global)
#
# NOTA: SOLO ASCII en este archivo.

param(
    [int]$Port = 4096,
    [string]$RepoRoot = '',
    [string]$Exe = 'C:\Users\fplay\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe'
)

if (-not $RepoRoot) {
    if ($PSScriptRoot -eq 'C:\Users\fplay\ciszu-ai') {
        $RepoRoot = 'E:\Ciszu Network'
    } else {
        $RepoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    }
}

if (-not (Test-Path $Exe)) {
    Write-Host "[ciszu-ai] No existe $Exe - instala opencode-ai (npm i -g opencode-ai)" -ForegroundColor Red
    exit 1
}

$ensure = Join-Path $PSScriptRoot 'ensure-server.ps1'
Write-Host "[ciszu-ai] Garantizando server en 127.0.0.1:$Port ..." -ForegroundColor Cyan
& $ensure -Port $Port -RepoRoot $RepoRoot

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ciszu-ai] No se pudo preparar el server. Revisa .opencode\temp\opencode-server-err.log" -ForegroundColor Red
    exit 1
}

Write-Host "[ciszu-ai] Adjuntando sesion compartida http://127.0.0.1:$Port ..." -ForegroundColor Cyan
& $Exe attach http://127.0.0.1:$Port
exit $LASTEXITCODE