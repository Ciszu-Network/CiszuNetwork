# ensure-server.ps1 — Ciszu-AI: garantiza que el servidor headless de opencode
# este corriendo en 127.0.0.1:4096 y repara el binario si esta corrupto.
#
# Tool oficial: tools/ciszu-ai/ (repo). Los lanzadores .cmd y la tarea
# programada (opencode-server-ciszu) delegan en este script.
#
# Puede ejecutarse desde cualquier cwd:
#   powershell -NoProfile -ExecutionPolicy Bypass -File "<repo>\tools\ciszu-ai\ensure-server.ps1"
#   -Port <n>    puerto alternativo (default 4096)
#   -Exe <ruta>  binario opencode alternativo (default: global npm)

param(
    [int]$Port = 4096,
    [string]$Exe = 'C:\Users\fplay\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe'
)

$ErrorActionPreference = 'SilentlyContinue'
$toolDir = $PSScriptRoot
$repoRoot = Split-Path (Split-Path $toolDir -Parent) -Parent   # tools/ciszu-ai -> tools -> repo
$url = "http://127.0.0.1:$Port"
$log = Join-Path $repoRoot '.opencode-tmp\opencode-server.log'
$err = Join-Path $repoRoot '.opencode-tmp\opencode-server-err.log'

if (-not (Test-Path $exe)) {
    Write-Output "Ciszu-AI: no existe $exe — instala opencode-ai (npm i -g opencode-ai)"
    exit 1
}

# Guardia: si opencode.exe no es un PE valido (postinstall no ejecutado deja un
# shim de texto), repararlo con el postinstall antes de arrancar el server.
function Repair-Binary {
    $bytes = [System.IO.File]::ReadAllBytes($exe)
    if ($bytes.Length -lt 1024) { return $false }
    $pe = [BitConverter]::ToUInt32($bytes, 0x3C)
    if ($pe -lt $bytes.Length -and $bytes[$pe] -eq 0x50) { return $true }
    return $false
}

if (-not (Repair-Binary)) {
    Write-Output "opencode.exe corrupto/shim (postinstall no ejecutado). Reparando..."
    Push-Location (Split-Path $exe -Parent)
    node postinstall.mjs 2>&1 | Out-Null
    Pop-Location
    if (-not (Repair-Binary)) {
        Write-Output "FALLO: no se pudo reparar opencode.exe. Reinstala opencode-ai."
        exit 1
    }
    Write-Output "opencode.exe reparado."
}

function Test-Server {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        return $r.StatusCode -eq 200
    } catch {
        return $false
    }
}

if (Test-Server) {
    Write-Output "Ciszu-AI: servidor ya corriendo en $url"
    exit 0
}

Write-Output "Iniciando opencode serve en $url ..."
$p = Start-Process -FilePath $exe -ArgumentList "serve --port $Port --hostname 127.0.0.1" -WindowStyle Hidden -WorkingDirectory $repoRoot -RedirectStandardOutput $log -RedirectStandardError $err -PassThru

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-Server) {
        Write-Output "CisZu-AI server listo (PID $($p.Id))"
        exit 0
    }
}

Write-Output "FALLO: el servidor no respondio en tiempo. Revisa $err"
exit 1