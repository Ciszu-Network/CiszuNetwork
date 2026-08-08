# Ensure SSH Remote Control — Ciszu Network
# Diagnostica/repara el acceso SSH desde el móvil (Termius → Tailscale → OpenSSH).
# Re-ejecutable e idempotente. No requiere admin salvo para tocar firewall/servicio.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts/ensure-ssh.ps1            # diagnóstico + fix automático
#   powershell -ExecutionPolicy Bypass -File scripts/ensure-ssh.ps1 -CheckOnly # solo diagnóstico
#
# Qué arregla (lecciones 8 ago 2026 — ver AGENTS.md "Gotchas reportados"):
#   1. Firewall: la regla OpenSSH viene con Profile=Private; el tráfico entrante
#      por el adaptador Tailscale puede clasificarse en otro perfil y Windows lo
#      bloquea en silencio → FORZA -Profile Any.
#   2. sshd "Running" con listeners zombis → Restart-Service sshd -Force.
#   3. Puertos: verifica que escucha 0.0.0.0:22/[::]:22 y responde por la IP tailnet.

param(
    [switch]$CheckOnly
)

$ErrorActionPreference = 'SilentlyContinue'
$fixed = @()

Write-Host "`n==> SSH Health Check ($(Get-Date -Format 'HH:mm:ss'))" -ForegroundColor Cyan

# ---------- 1. Servicio ----------
$svc = Get-Service sshd
if (-not $svc) {
    Write-Host '[FAIL] sshd no existe. Ejecuta scripts/setup-remote-control.ps1' -ForegroundColor Red
    exit 1
}
Write-Host "[ok] sshd = $($svc.Status) ($($svc.StartType))"

# ---------- 2. Listener real :22 ----------
$listen = Get-NetTCPConnection -LocalPort 22 -State Listen
if (-not $listen) {
    Write-Host '[FAIL] no hay listener en :22' -ForegroundColor Red
    if ($CheckOnly) { exit 1 }
    Restart-Service sshd -Force
    Start-Sleep -Seconds 2
    $listen = Get-NetTCPConnection -LocalPort 22 -State Listen
    $fixed += 'listener :22 (restart sshd)'
}
else {
    Write-Host "[2] listener :22 = $($listen.LocalAddress -join ', ') (PID $($listen.OwningProcess -join ','))" -ForegroundColor Green
}

# ---------- 3. Firewall Profile Any ----------
$rule = Get-NetFirewallRule -DisplayName 'OpenSSH SSH Server (sshd)'
if (-not $rule -or $rule.Profile -ne 'Any') {
    Write-Host '[3] regla OpenSSH no es Profile=Any → reparando' -ForegroundColor Yellow
    if (-not $CheckOnly) {
        if (-not $rule) {
            New-NetFirewallRule -Name 'OpenSSH-Server-Inbound-TCP' -DisplayName 'OpenSSH SSH Server (sshd)' `
                -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 -Profile Any | Out-Null
        }
        else {
            Set-NetFirewallRule -DisplayName 'OpenSSH SSH Server (sshd)' -Profile Any
        }
        $fixed += 'firewall Profile=Any'
        $rule = Get-NetFirewallRule -DisplayName 'OpenSSH SSH Server (sshd)'
    }
    else {
        Write-Host '[CHECK] regla OpenSSH NO está en All profiles' -ForegroundColor Red
    }
}
if ($rule) { Write-Host "[3] firewall = $($rule.Action) / Profile $($rule.Profile)" -ForegroundColor Green }

# ---------- 4. Probe local (conexión al puerto 22) ----------
$probe = Test-NetConnection -ComputerName 127.0.0.1 -Port 22 -InformationLevel Quiet
Write-Host "[4] probe local :22 = $probe" -ForegroundColor $(if ($probe) { 'Green' } else { 'Red' })
if (-not $probe -and -not $CheckOnly) {
    Restart-Service sshd -Force
    Start-Sleep -Seconds 2
    $probe = Test-NetConnection -ComputerName 127.0.0.1 -Port 22 -InformationLevel Quiet
    if ($probe) { $fixed += 'probe local (restart sshd)' }
}

# ---------- 5. IP tailnet ----------
$tail = 'C:\Program Files\Tailscale\tailscale.exe'
if (Test-Path $tail) {
    $ip4 = & $tail ip -4 2>$null | Select-Object -First 1
    if ($ip4) {
        $probeTail = Test-NetConnection -ComputerName $ip4 -Port 22 -InformationLevel Quiet
        Write-Host "[5] tailnet $ip4 :22 = $probeTail" -ForegroundColor $(if ($probeTail) { 'Green' } else { 'Yellow' })
    }
}
else {
    Write-Host '[5] tailscale no instalado (no crítico para SSH local)' -ForegroundColor Yellow
}

# ---------- Resumen ----------
if ($fixed.Count -gt 0) {
    Write-Host "`n[OK] Reparado: $($fixed -join '; ')" -ForegroundColor Green
}
else {
    Write-Host "`n[OK] SSH operativo, sin reparaciones." -ForegroundColor Green
}